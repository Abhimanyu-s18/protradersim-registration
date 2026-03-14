import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  BarChart3,
  Activity,
  Clock,
  Lightbulb,
  Search,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import {
  calculatePerformanceMetrics,
  buildEquityCurve,
  getAssetClassPerformance,
  generateInsights,
  PerformanceMetrics,
} from '@/lib/analytics-engine';
import { getPositions, Position, getInstruments } from '@/lib/trading-store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const fmt = (n: number, d = 2) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pctFmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

function formatDuration(ms: number): string {
  if (ms < 60000) return '<1m';
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  if (ms < 86400000) return `${(ms / 3600000).toFixed(1)}h`;
  return `${(ms / 86400000).toFixed(1)}d`;
}

const DashboardPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    calculatePerformanceMetrics
  );
  const [positions, setPositions] = useState<Position[]>(getPositions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>(
    'all'
  );
  const [selectedTrade, setSelectedTrade] = useState<Position | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(calculatePerformanceMetrics());
      setPositions(getPositions());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const instruments = getInstruments();
  const equityCurve = useMemo(() => buildEquityCurve(positions), [positions]);
  const classPerf = useMemo(
    () => getAssetClassPerformance(positions, instruments),
    [positions, instruments]
  );
  const insights = useMemo(
    () => generateInsights(metrics, classPerf),
    [metrics, classPerf]
  );

  const closedPositions = positions.filter((p) => p.status === 'Closed');

  const filteredTrades = closedPositions.filter((p) => {
    if (
      searchTerm &&
      !p.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (filterClass !== 'All') {
      const inst = instruments.find((i) => i.symbol === p.symbol);
      if (inst?.assetClass !== filterClass) return false;
    }
    if (filterResult === 'win' && (p.realizedPnl ?? 0) <= 0) return false;
    if (filterResult === 'loss' && (p.realizedPnl ?? 0) >= 0) return false;
    return true;
  });

  const metricCards = [
    {
      label: 'Total Return',
      value: pctFmt(metrics.totalReturn),
      color: metrics.totalReturn >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'Net PnL',
      value: fmt(metrics.netPnl),
      color: metrics.netPnl >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'Realised PnL',
      value: fmt(metrics.realizedPnl),
      color: metrics.realizedPnl >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'Unrealised PnL',
      value: fmt(metrics.unrealizedPnl),
      color: metrics.unrealizedPnl >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      color: metrics.winRate >= 50 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'Profit Factor',
      value:
        metrics.profitFactor === Infinity
          ? '∞'
          : metrics.profitFactor.toFixed(2),
      color: metrics.profitFactor >= 1 ? 'text-success' : 'text-destructive',
    },
    { label: 'Avg Win', value: fmt(metrics.avgWin), color: 'text-success' },
    {
      label: 'Avg Loss',
      value: fmt(metrics.avgLoss),
      color: 'text-destructive',
    },
    {
      label: 'Best Trade',
      value: fmt(metrics.bestTrade),
      color: 'text-success',
    },
    {
      label: 'Worst Trade',
      value: fmt(metrics.worstTrade),
      color: 'text-destructive',
    },
    {
      label: 'Total Trades',
      value: metrics.totalTrades.toString(),
      color: 'text-foreground',
    },
    {
      label: 'Avg Hold Time',
      value: formatDuration(metrics.avgHoldTimeMs),
      color: 'text-foreground',
    },
    {
      label: 'Max Drawdown',
      value: `${metrics.maxDrawdown.toFixed(2)}%`,
      color: metrics.maxDrawdown > 5 ? 'text-destructive' : 'text-primary',
    },
    {
      label: 'Current Drawdown',
      value: `${metrics.currentDrawdown.toFixed(2)}%`,
      color:
        metrics.currentDrawdown > 5 ? 'text-destructive' : 'text-foreground',
    },
    {
      label: 'Risk-Adjusted Score',
      value: metrics.riskAdjustedScore.toFixed(1),
      color: metrics.riskAdjustedScore >= 5 ? 'text-success' : 'text-primary',
    },
  ];

  // Daily PnL data
  const dailyPnl = useMemo(() => {
    const byDay: Record<string, number> = {};
    closedPositions.forEach((p) => {
      if (p.closedAt) {
        const day = new Date(p.closedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        byDay[day] = (byDay[day] ?? 0) + (p.realizedPnl ?? 0);
      }
    });
    return Object.entries(byDay).map(([day, pnl]) => ({
      day,
      pnl: parseFloat(pnl.toFixed(2)),
    }));
  }, [closedPositions]);

  // Win/loss distribution
  const winLossDist = [
    { name: 'Wins', value: metrics.winCount, fill: 'hsl(var(--success))' },
    {
      name: 'Losses',
      value: metrics.lossCount,
      fill: 'hsl(var(--destructive))',
    },
  ].filter((d) => d.value > 0);

  const assetClasses = [
    'All',
    'Forex',
    'Commodities',
    'Indices',
    'Stocks',
    'Crypto',
  ];

  const hasData = metrics.totalTrades > 0;

  return (
    <DashboardShell title="Performance Analytics" activeItem="Performance">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" /> Trading Insights
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2"
              >
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <p className="text-xs text-muted-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {metricCards.map((card) => (
          <div key={card.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {card.label}
            </p>
            <p className={`mt-1 text-lg font-bold font-mono ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {hasData ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Equity Curve */}
          <div className="glass-card rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" /> Equity Curve
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurve}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(ts: number) =>
                      new Date(ts).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(ts: number) =>
                      new Date(ts).toLocaleString()
                    }
                    formatter={(value: number) => [fmt(value), 'Equity']}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily PnL */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" /> Daily PnL
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnl}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {dailyPnl.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.pnl >= 0
                            ? 'hsl(var(--success))'
                            : 'hsl(var(--destructive))'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win/Loss Distribution */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-primary" /> Win/Loss Distribution
            </h3>
            {winLossDist.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winLossDist}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {winLossDist.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    <span className="text-muted-foreground">
                      Wins: {metrics.winCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">
                      Losses: {metrics.lossCount}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No completed trades yet
              </div>
            )}
          </div>

          {/* Asset Class Performance */}
          {classPerf.length > 0 && (
            <div className="glass-card rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-primary" /> Performance by Asset
                Class
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classPerf.map((cp) => (
                  <div
                    key={cp.assetClass}
                    className="rounded-lg bg-muted/30 p-3"
                  >
                    <p className="text-xs font-semibold text-foreground">
                      {cp.assetClass}
                    </p>
                    <p
                      className={`text-lg font-bold font-mono mt-1 ${cp.pnl >= 0 ? 'text-success' : 'text-destructive'}`}
                    >
                      {cp.pnl >= 0 ? '+' : ''}
                      {fmt(cp.pnl)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{cp.trades} trade(s)</span>
                      <span>Win rate: {cp.winRate.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No Trading History Yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete simulated trades to see your performance analytics here.
          </p>
        </div>
      )}

      {/* Trade History */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Trade History
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-36"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="h-8 px-2 rounded-lg bg-muted/50 border border-border/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {assetClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              {(['all', 'win', 'loss'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterResult(f)}
                  className={`px-2.5 py-1 text-[10px] uppercase font-semibold transition-colors ${
                    filterResult === f
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No matching trades found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  {[
                    'Symbol',
                    'Side',
                    'Size',
                    'Entry',
                    'Exit',
                    'PnL',
                    'Return',
                    'Duration',
                    'Closed',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrades.slice(0, 50).map((p) => {
                  const ret =
                    p.entryPrice > 0
                      ? ((p.realizedPnl ?? 0) / (p.entryPrice * p.size)) * 100
                      : 0;
                  const duration =
                    p.closedAt && p.openedAt ? p.closedAt - p.openedAt : 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/20 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => setSelectedTrade(p)}
                    >
                      <td className="px-3 py-2 font-mono text-foreground">
                        {p.symbol}
                      </td>
                      <td
                        className={`px-3 py-2 font-semibold ${p.side === 'Buy' ? 'text-success' : 'text-destructive'}`}
                      >
                        {p.side}
                      </td>
                      <td className="px-3 py-2 font-mono text-foreground">
                        {p.size}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {p.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {p.exitPrice?.toFixed(2) ?? '—'}
                      </td>
                      <td
                        className={`px-3 py-2 font-mono font-medium ${(p.realizedPnl ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}
                      >
                        {(p.realizedPnl ?? 0) >= 0 ? '+' : ''}
                        {fmt(p.realizedPnl ?? 0)}
                      </td>
                      <td
                        className={`px-3 py-2 font-mono ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                      >
                        {ret >= 0 ? '+' : ''}
                        {ret.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatDuration(duration)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {p.closedAt
                          ? new Date(p.closedAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Detail Dialog */}
      <Dialog
        open={!!selectedTrade}
        onOpenChange={() => setSelectedTrade(null)}
      >
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Trade Detail</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Symbol', value: selectedTrade.symbol },
                  { label: 'Side', value: selectedTrade.side },
                  { label: 'Size', value: selectedTrade.size.toString() },
                  { label: 'Leverage', value: `${selectedTrade.leverage}x` },
                  {
                    label: 'Entry Price',
                    value: selectedTrade.entryPrice.toFixed(4),
                  },
                  {
                    label: 'Exit Price',
                    value: selectedTrade.exitPrice?.toFixed(4) ?? '—',
                  },
                  {
                    label: 'Margin Used',
                    value: fmt(selectedTrade.marginUsed),
                  },
                  {
                    label: 'Duration',
                    value: formatDuration(
                      (selectedTrade.closedAt ?? 0) - selectedTrade.openedAt
                    ),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {item.label}
                    </p>
                    <p className="font-mono text-foreground mt-0.5">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Realised PnL
                </p>
                <p
                  className={`text-2xl font-bold font-mono mt-1 ${(selectedTrade.realizedPnl ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {(selectedTrade.realizedPnl ?? 0) >= 0 ? '+' : ''}
                  {fmt(selectedTrade.realizedPnl ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-border/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedTrade.realizedPnl ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold">
                      Profitable
                    </span>
                  )}
                  {(selectedTrade.realizedPnl ?? 0) < 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">
                      Loss
                    </span>
                  )}
                  {selectedTrade.leverage >= 100 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      High Leverage
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-semibold">
                    Simulated
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Ref: {selectedTrade.id} · Simulated execution
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default DashboardPerformance;
