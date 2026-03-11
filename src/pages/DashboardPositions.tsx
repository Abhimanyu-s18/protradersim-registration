import { useState, useEffect } from "react";
import { Position, getPositions, closePosition, getBalance, setBalance, getInstruments, simulatePriceTick } from "@/lib/trading-store";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/DashboardShell";
import { Briefcase } from "lucide-react";

export default function DashboardPositions() {
  const [positions, setPositions] = useState<Position[]>(getPositions);
  const [instruments, setInstruments] = useState(getInstruments);
  const [tab, setTab] = useState<"open" | "closed">("open");

  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => simulatePriceTick(prev));
      setPositions(getPositions());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update current prices from instrument feed
  const enriched = positions.map((p) => {
    const inst = instruments.find((i) => i.symbol === p.symbol);
    if (!inst || p.status === "Closed") return p;
    const currentPrice = p.side === "Buy" ? inst.bid : inst.ask;
    const pnl = p.side === "Buy"
      ? (currentPrice - p.entryPrice) * p.size * (inst.lotSize || 1)
      : (p.entryPrice - currentPrice) * p.size * (inst.lotSize || 1);
    return { ...p, currentPrice, pnl };
  });

  const openPositions = enriched.filter((p) => p.status === "Open");
  const closedPositions = enriched.filter((p) => p.status === "Closed");
  const display = tab === "open" ? openPositions : closedPositions;

  const handleClose = (id: string) => {
    const pos = enriched.find((p) => p.id === id);
    if (!pos) return;
    closePosition(id);
    setBalance(getBalance() + pos.marginUsed + pos.pnl);
    setPositions(getPositions());
  };

  return (
    <DashboardShell title="Positions" activeItem="Positions">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["open", "closed"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground bg-muted/30 border border-transparent"
              }`}>
              {t === "open" ? `Open (${openPositions.length})` : `Closed (${closedPositions.length})`}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          {display.length === 0 ? (
            <div className="py-16 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No {tab} positions</p>
              <p className="text-xs text-muted-foreground mt-1">Execute a simulated market order to open a position</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {["Symbol", "Side", "Size", "Entry", "Current", "PnL", "Margin", ...(tab === "open" ? [""] : [])].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {display.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{p.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${p.side === "Buy" ? "text-success" : "text-destructive"}`}>{p.side}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{p.size}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{p.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{p.currentPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-medium ${p.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">${p.marginUsed.toFixed(2)}</td>
                      {tab === "open" && (
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => handleClose(p.id)}>
                            Close
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
