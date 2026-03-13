import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Activity, Eye, ShieldCheck, AlertTriangle, LineChart,
  TrendingUp, TrendingDown, ListOrdered, Briefcase, BarChart3, Target, Trophy,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import WatchlistWidget from "@/components/WatchlistWidget";
import TradeTicket from "@/components/TradeTicket";
import {
  Instrument, getInstruments, simulatePriceTick, getWatchlist,
  getPositions, getOrders, Position, Order, calculateMetrics, AccountMetrics,
} from "@/lib/trading-store";
import { calculatePerformanceMetrics, evaluateChallenge } from "@/lib/analytics-engine";

const fmt = (n: number, d = 2) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pctFmt = (n: number) => (n === Infinity ? "∞" : `${n.toFixed(1)}%`);

const Dashboard = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>(getInstruments);
  const [watchlist, setWatchlist] = useState<string[]>(getWatchlist);
  const [positions, setPositions] = useState<Position[]>(getPositions);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [tradeSymbol, setTradeSymbol] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => simulatePriceTick(prev));
      setPositions(getPositions());
      setOrders(getOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const m = calculateMetrics(instruments, positions);
  const perf = calculatePerformanceMetrics();
  const challenge = evaluateChallenge();
  const openPositions = positions.filter((p) => p.status === "Open");
  const closedPositions = positions.filter((p) => p.status === "Closed");

  const statCards = [
    { label: "Account Status", value: "Active", sub: "Simulation Mode", color: "text-success" },
    { label: "Balance", value: fmt(m.balance), sub: "Available Funds" },
    { label: "Equity", value: fmt(m.equity), sub: `${openPositions.length} open position(s)` },
    { label: "Unrealised PnL", value: `${m.unrealizedPnl >= 0 ? "+" : ""}${fmt(m.unrealizedPnl)}`, sub: openPositions.length ? `${openPositions.length} active` : "No open trades", color: m.unrealizedPnl >= 0 ? "text-success" : "text-destructive" },
    { label: "Margin Used", value: fmt(m.marginUsed), sub: `${m.marginUsed > 0 ? ((m.marginUsed / m.equity) * 100).toFixed(1) : "0.0"}% utilisation` },
    { label: "Free Margin", value: fmt(m.freeMargin), sub: m.freeMargin < 0 ? "Deficit" : `${m.equity > 0 ? ((m.freeMargin / m.equity) * 100).toFixed(1) : "100.0"}% available`, color: m.freeMargin < 0 ? "text-destructive" : "" },
  ];

  const openTradeTicket = (symbol: string) => {
    setTradeSymbol(symbol);
    setTicketOpen(true);
  };

  const tradeInstrument = tradeSymbol ? instruments.find((i) => i.symbol === tradeSymbol) ?? null : null;
  const movers = [...instruments].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardShell title="Dashboard Overview" activeItem="Overview">
      {/* Margin Warning Banner */}
      {m.marginWarning !== "none" && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${
          m.marginWarning === "critical"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-primary/10 border-primary/30 text-primary"
        }`}>
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {m.marginWarning === "critical" ? "Critical: Margin Level Below 100%" : "Warning: Margin Level Below 150%"}
            </p>
            <p className="text-xs opacity-80">
              {m.marginWarning === "critical"
                ? "Your simulated account is at risk of liquidation. Consider closing positions."
                : "Margin level is approaching critical threshold. Monitor your exposure."
              }
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto shrink-0 text-xs" onClick={() => navigate("/dashboard/risk")}>
            View Risk
          </Button>
        </div>
      )}

      {/* Quick action */}
      <div className="flex flex-wrap gap-3">
        <Button className="gold-gradient text-primary-foreground font-semibold" onClick={() => navigate("/dashboard/markets")}>
          <LineChart className="h-4 w-4 mr-2" /> Open Trade Ticket
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/markets")}>
          Browse Markets
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/positions")}>
          View Positions
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/performance")}>
          <Target className="h-4 w-4 mr-2" /> Performance
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/risk")}>
          <ShieldCheck className="h-4 w-4 mr-2" /> Risk
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{card.label}</p>
            <p className={`mt-1 text-xl font-bold font-mono ${card.color ?? "text-foreground"}`}>{card.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Margin Health Meter */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Account Health
          </h3>
          <button onClick={() => navigate("/dashboard/risk")} className="text-[10px] uppercase tracking-wider font-semibold text-primary hover:underline">
            Full Report →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Margin Level", value: pctFmt(m.marginLevel), color: m.marginWarning === "critical" ? "text-destructive" : m.marginWarning === "warning" ? "text-primary" : "text-success" },
            { label: "Total Exposure", value: fmt(m.totalExposure, 0), color: "" },
            { label: "Realised PnL", value: `${m.realizedPnl >= 0 ? "+" : ""}${fmt(m.realizedPnl)}`, color: m.realizedPnl >= 0 ? "text-success" : "text-destructive" },
            { label: "Buying Power", value: fmt(m.availableBuyingPower), color: "" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
              <p className={`mt-1 text-lg font-bold font-mono ${item.color || "text-foreground"}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Watchlist */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-primary" /> Watchlist
          </h3>
          <WatchlistWidget
            instruments={instruments}
            watchlist={watchlist}
            onWatchlistChange={setWatchlist}
            onTrade={openTradeTicket}
          />
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <ListOrdered className="h-4 w-4 text-primary" /> Recent Orders
          </h3>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">Your simulated trades will appear here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${o.side === "Buy" ? "text-success" : "text-destructive"}`}>{o.side}</span>
                    <span className="font-mono text-foreground">{o.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{o.quantity} lot(s)</span>
                    <span className={`text-[10px] uppercase font-semibold ${o.status === "Filled" ? "text-success" : "text-primary"}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Exposures */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" /> Top Exposures
          </h3>
          {Object.keys(m.exposureByClass).length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No open exposure</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(m.exposureByClass).sort((a, b) => b[1] - a[1]).map(([cls, val]) => {
                const pct = m.totalExposure > 0 ? (val / m.totalExposure) * 100 : 0;
                return (
                  <div key={cls} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{cls}</span>
                      <span className="font-mono text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Market Movers */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" /> Market Movers
          </h3>
          <div className="space-y-1.5">
            {movers.map((mo) => {
              const up = mo.changePercent >= 0;
              return (
                <div key={mo.symbol} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-sm font-mono text-foreground">{mo.symbol}</span>
                  <span className={`text-xs font-mono flex items-center gap-1 ${up ? "text-success" : "text-destructive"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{mo.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open Positions Summary */}
        {openPositions.length > 0 && (
          <div className="glass-card rounded-xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Open Positions ({openPositions.length})
              </h3>
              <button onClick={() => navigate("/dashboard/positions")} className="text-[10px] uppercase tracking-wider font-semibold text-primary hover:underline">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    {["Symbol", "Side", "Size", "Entry", "PnL", "Margin"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openPositions.slice(0, 5).map((p) => {
                    const inst = instruments.find((i) => i.symbol === p.symbol);
                    const cp = inst ? (p.side === "Buy" ? inst.bid : inst.ask) : p.currentPrice;
                    const pnl = inst
                      ? (p.side === "Buy" ? (cp - p.entryPrice) : (p.entryPrice - cp)) * p.size * inst.lotSize
                      : p.pnl;
                    return (
                      <tr key={p.id} className="border-b border-border/20">
                        <td className="px-3 py-2 font-mono text-foreground">{p.symbol}</td>
                        <td className={`px-3 py-2 font-semibold ${p.side === "Buy" ? "text-success" : "text-destructive"}`}>{p.side}</td>
                        <td className="px-3 py-2 font-mono text-foreground">{p.size}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{p.entryPrice.toFixed(2)}</td>
                        <td className={`px-3 py-2 font-mono font-medium ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {pnl >= 0 ? "+" : ""}{fmt(pnl)}
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{fmt(p.marginUsed)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Realised PnL */}
        {closedPositions.length > 0 && (
          <div className="glass-card rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" /> Recent Realised PnL
            </h3>
            <div className="space-y-1.5">
              {closedPositions.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${p.side === "Buy" ? "text-success" : "text-destructive"}`}>{p.side}</span>
                    <span className="font-mono text-foreground">{p.symbol}</span>
                    <span className="text-muted-foreground">{p.size} lot(s)</span>
                  </div>
                  <span className={`font-mono font-medium ${(p.realizedPnl ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {(p.realizedPnl ?? 0) >= 0 ? "+" : ""}{fmt(p.realizedPnl ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Snapshot */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Performance
            </h3>
            <button onClick={() => navigate("/dashboard/performance")} className="text-[10px] uppercase tracking-wider font-semibold text-primary hover:underline">
              Details →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Win Rate</p>
              <p className={`text-lg font-bold font-mono ${perf.winRate >= 50 ? "text-success" : "text-destructive"}`}>{perf.winRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Return</p>
              <p className={`text-lg font-bold font-mono ${perf.totalReturn >= 0 ? "text-success" : "text-destructive"}`}>{perf.totalReturn >= 0 ? "+" : ""}{perf.totalReturn.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trades</p>
              <p className="text-lg font-bold font-mono text-foreground">{perf.totalTrades}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Max DD</p>
              <p className={`text-lg font-bold font-mono ${perf.maxDrawdown > 5 ? "text-destructive" : "text-foreground"}`}>{perf.maxDrawdown.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Challenge Progress */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Challenge
            </h3>
            <button onClick={() => navigate("/dashboard/challenge")} className="text-[10px] uppercase tracking-wider font-semibold text-primary hover:underline">
              Details →
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-semibold ${
                challenge.status === "passed" ? "text-success" :
                challenge.status === "failed" ? "text-destructive" :
                challenge.status === "in_progress" ? "text-primary" : "text-muted-foreground"
              }`}>
                {challenge.status === "not_started" ? "Not Started" :
                 challenge.status === "in_progress" ? "In Progress" :
                 challenge.status === "passed" ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profit Target</span>
              <span className="font-mono text-foreground">{challenge.progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
              <div className={`h-full rounded-full ${challenge.status === "passed" ? "bg-success" : challenge.status === "failed" ? "bg-destructive" : "bg-primary/60"}`} style={{ width: `${Math.min(100, challenge.progressPercent)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Trading Days</span>
              <span className="font-mono text-foreground">{challenge.tradingDays} / {challenge.rules.minTradingDays}</span>
            </div>
          </div>
        </div>
      </div>

      <TradeTicket instrument={tradeInstrument} open={ticketOpen} onOpenChange={setTicketOpen} />
    </DashboardShell>
  );
};

export default Dashboard;
