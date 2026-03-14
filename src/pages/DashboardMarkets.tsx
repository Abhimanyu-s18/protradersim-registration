import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Search, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Instrument,
  getInstruments,
  simulatePriceTick,
  getWatchlist,
  toggleWatchlist,
} from '@/lib/trading-store';
import TradeTicket from '@/components/TradeTicket';
import DashboardShell from '@/components/DashboardShell';

const ASSET_CLASSES = [
  'All',
  'Forex',
  'Commodities',
  'Indices',
  'Stocks',
  'Crypto',
] as const;

export default function DashboardMarkets() {
  const [instruments, setInstruments] = useState<Instrument[]>(getInstruments);
  const [watchlist, setWatchlist] = useState<string[]>(getWatchlist);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [tradeInstrument, setTradeInstrument] = useState<Instrument | null>(
    null
  );
  const [ticketOpen, setTicketOpen] = useState(false);

  // Price tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => simulatePriceTick(prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let list = instruments;
    if (filter !== 'All') list = list.filter((i) => i.assetClass === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [instruments, filter, search]);

  const handleStar = (symbol: string) => {
    const next = toggleWatchlist(symbol);
    setWatchlist(next);
  };

  const openTrade = (inst: Instrument) => {
    setTradeInstrument(inst);
    setTicketOpen(true);
  };

  return (
    <DashboardShell title="Markets" activeItem="Markets">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {ASSET_CLASSES.map((ac) => (
              <button
                key={ac}
                onClick={() => setFilter(ac)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === ac
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground bg-muted/30 border border-transparent'
                }`}
              >
                {ac}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search instruments…"
              className="pl-9 bg-muted/30 border-border/50 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-8"></th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden sm:table-cell">
                    Name
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Bid
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Ask
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden md:table-cell">
                    Spread
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Change
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => {
                  const up = inst.changePercent >= 0;
                  const decimals =
                    inst.pipSize < 0.001
                      ? 4
                      : inst.pipSize < 0.1
                        ? 2
                        : inst.bid > 1000
                          ? 2
                          : 4;
                  const starred = watchlist.includes(inst.symbol);
                  return (
                    <tr
                      key={inst.symbol}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => handleStar(inst.symbol)}>
                          <Star
                            className={`h-3.5 w-3.5 ${starred ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'}`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-foreground">
                        {inst.symbol}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {inst.name}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inst.bid.toFixed(decimals)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inst.ask.toFixed(decimals)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                        {inst.spread.toFixed(inst.pipSize < 0.001 ? 4 : 2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs ${up ? 'text-success' : 'text-destructive'}`}
                        >
                          {up ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {up ? '+' : ''}
                          {inst.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => openTrade(inst)}
                        >
                          Trade
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No instruments found
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          All prices are simulated and do not represent live market data.
          ProTraderSim is a training environment only.
        </p>
      </div>

      <TradeTicket
        instrument={tradeInstrument}
        open={ticketOpen}
        onOpenChange={setTicketOpen}
      />
    </DashboardShell>
  );
}
