import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Activity, Eye, ShieldCheck, CheckCircle2, AlertTriangle, LineChart,
  TrendingUp, TrendingDown, ListOrdered,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import WatchlistWidget from "@/components/WatchlistWidget";
import TradeTicket from "@/components/TradeTicket";
import {
  Instrument, getInstruments, simulatePriceTick, getWatchlist,
  getPositions, getOrders, getBalance, getInstrumentBySymbol, Position, Order,
} from "@/lib/trading-store";

const Dashboard = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>(getInstruments);
  const [watchlist, setWatchlist] = useState<string[]>(getWatchlist);
  const [positions, setPositions] = useState<Position[]>(getPositions);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [balance, setBalanceState] = useState(getBalance);
  const [tradeSymbol, setTradeSymbol] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => simulatePriceTick(prev));
      setPositions(getPositions());
      setOrders(getOrders());
      setBalanceState(getBalance());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const openPositions = positions.filter((p) => p.status === "Open");
  const totalPnl = openPositions.reduce((sum, p) => {
    const inst = instruments.find((i) => i.symbol === p.symbol);
    if (!inst) return sum;
    const cp = p.side === "Buy" ? inst.bid : inst.ask;
    return sum + (p.side === "Buy" ? (cp - p.entryPrice) : (p.entryPrice - cp)) * p.size * (inst.lotSize || 1);
  }, 0);
  const marginUsed = openPositions.reduce((s, p) => s + p.marginUsed, 0);
  const equity = balance + marginUsed + totalPnl;

  const statCards = [
    { label: "Account Status", value: "Active", sub: "Simulation Mode", color: "text-success" },
    { label: "Simulated Balance", value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "Available Funds" },
    { label: "Equity", value: `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${openPositions.length} open position(s)` },
    { label: "Margin Used", value: `$${marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${(marginUsed / (balance + marginUsed) * 100).toFixed(1)}% utilisation` },
    { label: "Free Margin", value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${(balance / (balance + marginUsed) * 100).toFixed(1)}% available` },
    { label: "Daily PnL", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, sub: openPositions.length ? `${openPositions.length} active` : "No trades today", color: totalPnl >= 0 ? "text-success" : "text-destructive" },
  ];

  const openTradeTicket = (symbol: string) => {
    setTradeSymbol(symbol);
    setTicketOpen(true);
  };

  const tradeInstrument = tradeSymbol ? instruments.find((i) => i.symbol === tradeSymbol) ?? null : null;

  // Top movers
  const movers = [...instruments].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardShell title="Dashboard Overview" activeItem="Overview">
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

        {/* Market Movers */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" /> Market Movers
          </h3>
          <div className="space-y-1.5">
            {movers.map((m) => {
              const up = m.changePercent >= 0;
              return (
                <div key={m.symbol} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-sm font-mono text-foreground">{m.symbol}</span>
                  <span className={`text-xs font-mono flex items-center gap-1 ${up ? "text-success" : "text-destructive"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{m.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" /> Risk Summary
          </h3>
          <div className="space-y-3">
            {[
              { label: "Margin Level", value: marginUsed > 0 ? `${((equity / marginUsed) * 100).toFixed(1)}%` : "∞" },
              { label: "Open Exposure", value: `$${openPositions.reduce((s, p) => s + p.marginUsed * p.leverage, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: "Open Positions", value: openPositions.length.toString() },
              { label: "Unrealised PnL", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}` },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <span className="text-sm font-mono text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TradeTicket instrument={tradeInstrument} open={ticketOpen} onOpenChange={setTicketOpen} />
    </DashboardShell>
  );
};

export default Dashboard;
