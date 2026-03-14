import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Activity,
  Target,
  BarChart3,
  Shield,
  LineChart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const platformFeatures = [
  {
    icon: Activity,
    title: 'Real-Time Price Monitoring',
    desc: 'Stream simulated price data across all asset classes with live bid/ask spreads, candlestick charting, and configurable timeframes.',
  },
  {
    icon: Target,
    title: 'Order Execution Simulation',
    desc: 'Place market, limit, stop-loss, and take-profit orders with instant simulated execution and realistic slippage modeling.',
  },
  {
    icon: BarChart3,
    title: 'Account Dashboard',
    desc: 'Monitor your balance, equity, free margin, and margin level with a professional overview matching institutional platforms.',
  },
  {
    icon: Shield,
    title: 'Risk & Margin Visibility',
    desc: 'Real-time margin usage indicators, liquidation warnings, and exposure breakdowns across your open positions.',
  },
  {
    icon: LineChart,
    title: 'Trade History & Analytics',
    desc: 'Full trade log with entry/exit prices, P&L calculations, hold duration, and performance statistics.',
  },
  {
    icon: TrendingUp,
    title: 'Challenge & Performance Tracking',
    desc: 'Set performance benchmarks, track drawdown limits, and monitor your progress toward simulated funding evaluations.',
  },
];

const Platform = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <div className="container pt-28 pb-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Platform Overview
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          A professional-grade simulated trading environment built for serious
          trader development.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {platformFeatures.map((f) => (
          <div
            key={f.title}
            className="glass-card rounded-xl p-6 transition-colors hover:border-primary/30"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mock dashboard preview */}
      <div className="mt-16 glass-card mx-auto max-w-4xl overflow-hidden rounded-2xl">
        <div className="border-b border-border/30 bg-muted/40 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-primary/60" />
            <div className="h-3 w-3 rounded-full bg-success/60" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">
              ProTraderSim Dashboard
            </span>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Balance', value: '$100,000.00' },
              { label: 'Equity', value: '$100,000.00' },
              { label: 'Margin Level', value: '—' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border/30 bg-background/50 p-4 text-center"
              >
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border/30 bg-background/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No open positions — start your first simulated trade after
              activation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Button
          asChild
          size="lg"
          className="gold-gradient text-primary-foreground font-semibold px-8"
        >
          <Link to="/register">
            Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
    <LandingFooter />
  </div>
);

export default Platform;
