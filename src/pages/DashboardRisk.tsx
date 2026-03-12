import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/DashboardShell";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Briefcase, BarChart3,
} from "lucide-react";
import {
  Instrument, Position, getInstruments, simulatePriceTick, getPositions,
  calculateMetrics, AccountMetrics,
} from "@/lib/trading-store";

const fmt = (n: number, decimals = 2) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const pctFmt = (n: number) => (n === Infinity ? "∞" : `${n.toFixed(1)}%`);

export default function DashboardRisk() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>(getInstruments);
  const [positions, setPositions] = useState<Position[]>(getPositions);

  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => simulatePriceTick(prev));
      setPositions(getPositions());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const m = calculateMetrics(instruments, positions);
  const openPositions = positions.filter((p) => p.status === "Open");

  // Enriched positions with live PnL
  const enriched = openPositions.map((p) => {
    const inst = instruments.find((i) => i.symbol === p.symbol);
    if (!inst) return p;
    const currentPrice = p.side === "Buy" ? inst.bid : inst.ask;
    const pnl = p.side === "Buy"
      ? (currentPrice - p.entryPrice) * p.size * inst.lotSize
      : (p.entryPrice - currentPrice) * p.size * inst.lotSize;
    const notional = currentPrice * p.size * inst.lotSize;
    return { ...p, currentPrice, pnl, notional };
  });

  const marginLevelCapped = m.marginLevel === Infinity ? 100 : Math.min(m.marginLevel, 500);
  const marginBarPct = (marginLevelCapped / 500) * 100;

  // Concentration: highest single exposure as % of total
  const exposureEntries = Object.entries(m.exposureByClass).sort((a, b) => b[1] - a[1]);
  const concentrationPct = m.totalExposure > 0 && m.largestPosition
    ? ((enriched.find((p) => p.id === m.largestPosition?.id) as any)?.notional ?? 0) / m.totalExposure * 100
    : 0;

  return (
    <DashboardShell title="Risk & Exposure" activeItem="Risk">
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
              {m.marginWarning === "critical" ? "Critical: Liquidation Risk" : "Warning: Low Margin"}
            </p>
            <p className="text-xs opacity-80">
              {m.marginWarning === "critical"
                ? "Margin level is at or below 100%. Positions may be at risk of simulated liquidation."
                : "Margin level has fallen below 150%. Consider reducing exposure."
              }
            </p>
          </div>
        </div>
      )}

      {/* Account Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Balance", value: fmt(m.balance), color: "" },
          { label: "Equity", value: fmt(m.equity), color: "" },
          { label: "Unrealised PnL", value: `${m.unrealizedPnl >= 0 ? "+" : ""}${fmt(m.unrealizedPnl)}`, color: m.unrealizedPnl >= 0 ? "text-success" : "text-destructive" },
          { label: "Realised PnL", value: `${m.realizedPnl >= 0 ? "+" : ""}${fmt(m.realizedPnl)}`, color: m.realizedPnl >= 0 ? "text-success" : "text-destructive" },
          { label: "Margin Used", value: fmt(m.marginUsed), color: "" },
          { label: "Free Margin", value: fmt(m.freeMargin), color: m.freeMargin < 0 ? "text-destructive" : "" },
          { label: "Margin Level", value: pctFmt(m.marginLevel), color: m.marginWarning === "critical" ? "text-destructive" : m.marginWarning === "warning" ? "text-primary" : "text-success" },
          { label: "Total Exposure", value: fmt(m.totalExposure, 0), color: "" },
          { label: "Buying Power", value: fmt(m.availableBuyingPower), color: "" },
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
            <p className={`mt-1 text-xl font-bold font-mono ${c.color || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Margin Health Meter */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Margin Health
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Margin Level</span>
            <span className={`font-mono font-semibold ${
              m.marginWarning === "critical" ? "text-destructive" : m.marginWarning === "warning" ? "text-primary" : "text-success"
            }`}>{pctFmt(m.marginLevel)}</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                m.marginWarning === "critical" ? "bg-destructive" : m.marginWarning === "warning" ? "bg-primary" : "bg-success"
              }`}
              style={{ width: `${Math.min(marginBarPct, 100)}%` }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 h-full w-px bg-destructive/60" style={{ left: "20%" }} title="100% - Critical" />
            <div className="absolute top-0 h-full w-px bg-primary/60" style={{ left: "30%" }} title="150% - Warning" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="text-destructive">100%</span>
            <span className="text-primary">150%</span>
            <span>500%+</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Exposure by Asset Class */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Exposure by Asset Class
          </h3>
          {exposureEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No open exposure</p>
          ) : (
            <div className="space-y-3">
              {exposureEntries.map(([cls, val]) => {
                const pct = m.totalExposure > 0 ? (val / m.totalExposure) * 100 : 0;
                return (
                  <div key={cls} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{cls}</span>
                      <span className="font-mono text-muted-foreground">{fmt(val, 0)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Concentration Warnings */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Concentration & Warnings
          </h3>
          <div className="space-y-2">
            {openPositions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No active risk indicators</p>
            ) : (
              <>
                {concentrationPct > 50 && (
                  <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
                    <span className="font-semibold">High Concentration:</span> Largest position represents {concentrationPct.toFixed(1)}% of total exposure
                  </div>
                )}
                {m.marginWarning === "critical" && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                    <span className="font-semibold">Liquidation Risk:</span> Free margin is critically low. Consider closing positions.
                  </div>
                )}
                {m.freeMargin < 0 && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                    <span className="font-semibold">Negative Free Margin:</span> Account is in margin deficit of {fmt(Math.abs(m.freeMargin))}
                  </div>
                )}
                {openPositions.length > 5 && (
                  <div className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Many Positions:</span> {openPositions.length} open positions — monitor total exposure
                  </div>
                )}
                {m.marginWarning === "none" && concentrationPct <= 50 && m.freeMargin >= 0 && openPositions.length <= 5 && (
                  <div className="rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success">
                    No active warnings. Account health is within normal parameters.
                  </div>
                )}
              </>
            )}
          </div>
          {m.largestPosition && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Largest Open Position</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground">{m.largestPosition.symbol}</span>
                <span className={`text-sm font-mono font-medium ${m.largestPosition.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                  {m.largestPosition.pnl >= 0 ? "+" : ""}{fmt(m.largestPosition.pnl)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Open Positions Risk Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> Open Positions Risk
          </h3>
        </div>
        {enriched.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No open positions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Symbol", "Side", "Size", "Margin", "Exposure", "PnL", "% of Equity"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((p: any) => {
                  const pctOfEquity = m.equity > 0 ? (Math.abs(p.pnl) / m.equity) * 100 : 0;
                  return (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{p.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${p.side === "Buy" ? "text-success" : "text-destructive"}`}>{p.side}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{p.size}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{fmt(p.marginUsed)}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{fmt(p.notional || 0, 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-medium ${p.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {p.pnl >= 0 ? "+" : ""}{fmt(p.pnl)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{pctOfEquity.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
