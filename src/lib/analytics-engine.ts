// Performance analytics and challenge rule engine
// Designed to be replaceable with a real backend later

import {
  Position, getPositions, getAccount, getInstruments, AccountState,
  saveOrder, savePosition, saveAccount, generateId, getInstrumentBySymbol,
} from "./trading-store";

// ── Performance Metrics ──

export interface PerformanceMetrics {
  totalReturn: number;
  netPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  totalTrades: number;
  avgHoldTimeMs: number;
  maxDrawdown: number;
  currentDrawdown: number;
  riskAdjustedScore: number;
  winCount: number;
  lossCount: number;
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
  pnl: number;
}

export interface AssetClassPerformance {
  assetClass: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export function calculatePerformanceMetrics(): PerformanceMetrics {
  const account = getAccount();
  const positions = getPositions();
  const instruments = getInstruments();
  const closed = positions.filter((p) => p.status === "Closed");
  const open = positions.filter((p) => p.status === "Open");

  // Unrealized PnL from open positions
  let unrealizedPnl = 0;
  for (const pos of open) {
    const inst = instruments.find((i) => i.symbol === pos.symbol);
    if (!inst) continue;
    const cp = pos.side === "Buy" ? inst.bid : inst.ask;
    unrealizedPnl += pos.side === "Buy"
      ? (cp - pos.entryPrice) * pos.size * inst.lotSize
      : (pos.entryPrice - cp) * pos.size * inst.lotSize;
  }

  const wins = closed.filter((p) => (p.realizedPnl ?? 0) > 0);
  const losses = closed.filter((p) => (p.realizedPnl ?? 0) < 0);
  const totalTrades = closed.length;
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

  const totalWinPnl = wins.reduce((s, p) => s + (p.realizedPnl ?? 0), 0);
  const totalLossPnl = Math.abs(losses.reduce((s, p) => s + (p.realizedPnl ?? 0), 0));
  const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? Infinity : 0;

  const avgWin = wins.length > 0 ? totalWinPnl / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossPnl / losses.length : 0;

  const pnls = closed.map((p) => p.realizedPnl ?? 0);
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

  const holdTimes = closed
    .filter((p) => p.closedAt && p.openedAt)
    .map((p) => (p.closedAt! - p.openedAt));
  const avgHoldTimeMs = holdTimes.length > 0 ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0;

  // Drawdown calculation from equity curve
  const curve = buildEquityCurve();
  let peak = account.startingBalance;
  let maxDrawdown = 0;
  for (const point of curve) {
    if (point.equity > peak) peak = point.equity;
    const dd = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }
  const currentEquity = account.balance + unrealizedPnl;
  const currentPeak = Math.max(peak, currentEquity);
  const currentDrawdown = currentPeak > 0 ? ((currentPeak - currentEquity) / currentPeak) * 100 : 0;

  const netPnl = account.realizedPnl + unrealizedPnl;
  const totalReturn = account.startingBalance > 0 ? (netPnl / account.startingBalance) * 100 : 0;

  // Simple risk-adjusted score: (return / max(drawdown, 1)) capped
  const riskAdjustedScore = maxDrawdown > 0 ? Math.min(10, (totalReturn / maxDrawdown) * 2) : totalReturn > 0 ? 10 : 0;

  return {
    totalReturn,
    netPnl,
    realizedPnl: account.realizedPnl,
    unrealizedPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    bestTrade,
    worstTrade,
    totalTrades,
    avgHoldTimeMs,
    maxDrawdown,
    currentDrawdown,
    riskAdjustedScore,
    winCount: wins.length,
    lossCount: losses.length,
  };
}

// ── Equity Curve ──

export function buildEquityCurve(): EquityPoint[] {
  const account = getAccount();
  const positions = getPositions();
  const closed = positions
    .filter((p) => p.status === "Closed" && p.closedAt)
    .sort((a, b) => (a.closedAt ?? 0) - (b.closedAt ?? 0));

  const points: EquityPoint[] = [{ timestamp: Date.now() - 86400000 * 30, equity: account.startingBalance, pnl: 0 }];
  let runningBalance = account.startingBalance;

  for (const pos of closed) {
    const pnl = pos.realizedPnl ?? 0;
    runningBalance += pnl;
    points.push({ timestamp: pos.closedAt!, equity: runningBalance, pnl });
  }

  // Add current point
  points.push({ timestamp: Date.now(), equity: account.balance, pnl: 0 });
  return points;
}

// ── Asset Class Performance ──

export function getAssetClassPerformance(): AssetClassPerformance[] {
  const positions = getPositions();
  const instruments = getInstruments();
  const closed = positions.filter((p) => p.status === "Closed");
  const byClass: Record<string, { pnl: number; wins: number; total: number }> = {};

  for (const pos of closed) {
    const inst = instruments.find((i) => i.symbol === pos.symbol);
    const cls = inst?.assetClass ?? "Other";
    if (!byClass[cls]) byClass[cls] = { pnl: 0, wins: 0, total: 0 };
    byClass[cls].pnl += pos.realizedPnl ?? 0;
    byClass[cls].total++;
    if ((pos.realizedPnl ?? 0) > 0) byClass[cls].wins++;
  }

  return Object.entries(byClass).map(([assetClass, data]) => ({
    assetClass,
    pnl: data.pnl,
    trades: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
  }));
}

// ── Insights ──

export function generateInsights(): string[] {
  const metrics = calculatePerformanceMetrics();
  const classPerf = getAssetClassPerformance();
  const insights: string[] = [];

  if (metrics.totalTrades === 0) {
    insights.push("No closed trades yet. Start trading to see performance insights.");
    return insights;
  }

  // Win rate insights
  if (metrics.winRate >= 60) insights.push(`Your win rate of ${metrics.winRate.toFixed(0)}% is strong. Maintain your discipline.`);
  else if (metrics.winRate < 40 && metrics.totalTrades >= 3) insights.push(`Win rate is below 40%. Consider refining your entry criteria.`);

  // Risk/reward
  if (metrics.avgLoss > metrics.avgWin && metrics.avgWin > 0) {
    insights.push("Average loss exceeds average win. Consider tightening stop-losses or letting winners run longer.");
  }
  if (metrics.profitFactor > 1.5 && metrics.totalTrades >= 3) {
    insights.push(`Profit factor of ${metrics.profitFactor.toFixed(2)} suggests a positive edge. Stay consistent.`);
  }

  // Drawdown
  if (metrics.currentDrawdown > 5) {
    insights.push(`Current drawdown at ${metrics.currentDrawdown.toFixed(1)}%. Monitor risk exposure carefully.`);
  }

  // Asset class concentration
  if (classPerf.length > 0) {
    const worst = classPerf.sort((a, b) => a.pnl - b.pnl)[0];
    if (worst.pnl < 0) insights.push(`Largest losses concentrated in ${worst.assetClass}. Review your approach to this market.`);
    const best = classPerf.sort((a, b) => b.pnl - a.pnl)[0];
    if (best.pnl > 0) insights.push(`Most profitable asset class: ${best.assetClass}.`);
  }

  return insights.slice(0, 4);
}

// ── Challenge / Evaluation ──

export interface ChallengeRules {
  profitTarget: number;      // percentage
  maxDailyDrawdown: number;  // percentage
  maxTotalDrawdown: number;  // percentage
  minTradingDays: number;
}

export interface ChallengeState {
  status: "not_started" | "in_progress" | "passed" | "failed";
  rules: ChallengeRules;
  currentReturn: number;
  currentDrawdown: number;
  dailyDrawdown: number;
  tradingDays: number;
  breachedRule: string | null;
  progressPercent: number; // towards profit target
}

const CHALLENGE_KEY = "pts_challenge";
const DEFAULT_RULES: ChallengeRules = {
  profitTarget: 10,
  maxDailyDrawdown: 5,
  maxTotalDrawdown: 10,
  minTradingDays: 5,
};

export function getChallengeRules(): ChallengeRules {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY + "_rules");
    if (raw) return JSON.parse(raw);
  } catch { /* fallthrough */ }
  return { ...DEFAULT_RULES };
}

export function saveChallengeStatus(status: ChallengeState["status"]) {
  localStorage.setItem(CHALLENGE_KEY + "_status", status);
}

export function getChallengeStatus(): ChallengeState["status"] {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY + "_status");
    if (raw) return raw as ChallengeState["status"];
  } catch { /* fallthrough */ }
  return "not_started";
}

export function evaluateChallenge(): ChallengeState {
  const rules = getChallengeRules();
  const metrics = calculatePerformanceMetrics();
  const account = getAccount();
  const positions = getPositions();
  let savedStatus = getChallengeStatus();

  const currentReturn = metrics.totalReturn;
  const currentDrawdown = metrics.maxDrawdown;

  // Estimate daily drawdown from today's trades
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();
  const todayClosed = positions.filter((p) => p.status === "Closed" && (p.closedAt ?? 0) >= todayTs);
  const todayPnl = todayClosed.reduce((s, p) => s + (p.realizedPnl ?? 0), 0);
  const dailyDrawdown = todayPnl < 0 ? Math.abs(todayPnl / account.startingBalance) * 100 : 0;

  // Count unique trading days
  const closedWithDates = positions.filter((p) => p.status === "Closed" && p.closedAt);
  const uniqueDays = new Set(closedWithDates.map((p) => new Date(p.closedAt!).toDateString()));
  const tradingDays = uniqueDays.size;

  let breachedRule: string | null = null;

  // Check breaches
  if (savedStatus === "in_progress" || savedStatus === "not_started") {
    if (currentDrawdown >= rules.maxTotalDrawdown) {
      breachedRule = "Max total drawdown exceeded";
      savedStatus = "failed";
      saveChallengeStatus("failed");
    } else if (dailyDrawdown >= rules.maxDailyDrawdown) {
      breachedRule = "Max daily drawdown exceeded";
      savedStatus = "failed";
      saveChallengeStatus("failed");
    }

    // Check pass
    if (!breachedRule && currentReturn >= rules.profitTarget && tradingDays >= rules.minTradingDays) {
      savedStatus = "passed";
      saveChallengeStatus("passed");
    }

    // Auto-start
    if (savedStatus === "not_started" && metrics.totalTrades > 0) {
      savedStatus = "in_progress";
      saveChallengeStatus("in_progress");
    }
  }

  const progressPercent = Math.min(100, Math.max(0, (currentReturn / rules.profitTarget) * 100));

  return {
    status: savedStatus,
    rules,
    currentReturn,
    currentDrawdown,
    dailyDrawdown,
    tradingDays,
    breachedRule,
    progressPercent,
  };
}

export function resetChallenge() {
  localStorage.removeItem(CHALLENGE_KEY + "_status");
  localStorage.removeItem(CHALLENGE_KEY + "_rules");
}

// ── Seed Demo Data ──

export function seedWinningTrades() {
  const symbols = ["EUR/USD", "AAPL", "XAU/USD", "US500", "BTC/USD"];
  let account = getAccount();

  for (const sym of symbols) {
    const inst = getInstrumentBySymbol(sym);
    if (!inst) continue;
    const id = generateId();
    const entryPrice = inst.bid * 0.995;
    const exitPrice = inst.bid;
    const pnl = (exitPrice - entryPrice) * 1 * inst.lotSize;
    const margin = (entryPrice * 1 * inst.lotSize) / inst.leverageMax;
    const ts = Date.now() - Math.random() * 86400000 * 5;

    account = { ...account, balance: account.balance + pnl, realizedPnl: account.realizedPnl + pnl };
    saveAccount(account);

    saveOrder({
      id, symbol: sym, instrumentName: inst.name, side: "Buy", type: "Market",
      quantity: 1, leverage: inst.leverageMax, entryPrice, status: "Filled", timestamp: ts, margin,
    });
    savePosition({
      id, symbol: sym, instrumentName: inst.name, side: "Buy", size: 1,
      entryPrice, currentPrice: exitPrice, pnl, marginUsed: margin, leverage: inst.leverageMax,
      openedAt: ts, closedAt: ts + 3600000 * Math.random() * 24, exitPrice, realizedPnl: pnl, status: "Closed",
    });
  }
}

export function seedLosingTrades() {
  const { saveOrder, savePosition, getAccount: ga, saveAccount: sa, generateId, getInstrumentBySymbol } = require("./trading-store");
  const symbols = ["GBP/USD", "TSLA", "XRP/USD", "NGAS", "DE40"];
  const account = ga();

  for (const sym of symbols) {
    const inst = getInstrumentBySymbol(sym);
    if (!inst) continue;
    const id = generateId();
    const entryPrice = inst.bid * 1.005;
    const exitPrice = inst.bid;
    const pnl = (exitPrice - entryPrice) * 1 * inst.lotSize;
    const margin = (entryPrice * 1 * inst.lotSize) / inst.leverageMax;
    const ts = Date.now() - Math.random() * 86400000 * 5;

    sa({ ...account, balance: account.balance + pnl, realizedPnl: account.realizedPnl + pnl });

    saveOrder({
      id, symbol: sym, instrumentName: inst.name, side: "Buy", type: "Market",
      quantity: 1, leverage: inst.leverageMax, entryPrice, status: "Filled", timestamp: ts, margin,
    });
    savePosition({
      id, symbol: sym, instrumentName: inst.name, side: "Buy", size: 1,
      entryPrice, currentPrice: exitPrice, pnl, marginUsed: margin, leverage: inst.leverageMax,
      openedAt: ts, closedAt: ts + 3600000 * Math.random() * 12, exitPrice, realizedPnl: pnl, status: "Closed",
    });
  }
}
