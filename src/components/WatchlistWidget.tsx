import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Instrument, toggleWatchlist } from '@/lib/trading-store';

interface Props {
  instruments: Instrument[];
  watchlist: string[];
  onWatchlistChange: (wl: string[]) => void;
  onTrade?: (symbol: string) => void;
  compact?: boolean;
}

export default function WatchlistWidget({
  instruments,
  watchlist,
  onWatchlistChange,
  onTrade,
  compact,
}: Props) {
  const items = instruments.filter((i) => watchlist.includes(i.symbol));

  const handleToggle = (symbol: string) => {
    const next = toggleWatchlist(symbol);
    onWatchlistChange(next);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Star className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No instruments in watchlist
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Star instruments from the Markets page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((inst) => {
        const up = inst.changePercent >= 0;
        const decimals =
          inst.pipSize < 0.001
            ? 4
            : inst.pipSize < 0.1
              ? 2
              : inst.bid > 1000
                ? 2
                : 4;
        return (
          <div
            key={inst.symbol}
            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => handleToggle(inst.symbol)}
                className="text-primary hover:text-primary/70 shrink-0"
                aria-label={`Remove ${inst.symbol} from watchlist`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-mono text-foreground truncate">
                  {inst.symbol}
                </p>
                {!compact && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {inst.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-mono text-foreground">
                  {inst.bid.toFixed(decimals)}
                </p>
                <p
                  className={`text-[10px] font-mono flex items-center gap-0.5 justify-end ${up ? 'text-success' : 'text-destructive'}`}
                >
                  {up ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {up ? '+' : ''}
                  {inst.changePercent.toFixed(2)}%
                </p>
              </div>
              {onTrade && (
                <button
                  onClick={() => onTrade(inst.symbol)}
                  className="text-[10px] uppercase tracking-wider font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Trade
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
