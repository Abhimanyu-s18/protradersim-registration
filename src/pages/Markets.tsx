import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  DollarSign,
  Gem,
  TrendingUp,
  BarChart3,
  Cpu,
  ArrowRight,
} from 'lucide-react';

const assetClasses = [
  {
    icon: DollarSign,
    name: 'Forex',
    instruments: [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'AUD/USD',
      'USD/CAD',
      'EUR/GBP',
    ],
    desc: 'Trade major, minor, and exotic currency pairs with tight simulated spreads and flexible leverage up to 1:500.',
  },
  {
    icon: Gem,
    name: 'Commodities',
    instruments: [
      'Gold (XAU/USD)',
      'Silver (XAG/USD)',
      'Crude Oil',
      'Natural Gas',
      'Copper',
    ],
    desc: 'Access precious metals, energy, and agricultural products with realistic market behavior.',
  },
  {
    icon: TrendingUp,
    name: 'Indices',
    instruments: [
      'S&P 500',
      'NASDAQ 100',
      'Dow Jones',
      'FTSE 100',
      'DAX 40',
      'Nikkei 225',
    ],
    desc: 'Simulate positions on global stock indices reflecting real-world market sentiment.',
  },
  {
    icon: BarChart3,
    name: 'Stocks',
    instruments: ['Apple', 'Tesla', 'Amazon', 'Microsoft', 'Google', 'Meta'],
    desc: 'CFD-style simulation on blue-chip equities from major global exchanges.',
  },
  {
    icon: Cpu,
    name: 'Crypto',
    instruments: ['BTC/USD', 'ETH/USD', 'XRP/USD', 'SOL/USD', 'ADA/USD'],
    desc: 'Practice crypto trading with 24/7 simulated pricing and volatile market conditions.',
  },
];

const Markets = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <div className="container pt-28 pb-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Simulated Markets
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          Explore 60+ instruments across five major asset classes — all with
          simulated pricing and zero real capital risk.
        </p>
      </div>

      <div className="space-y-8">
        {assetClasses.map((ac) => (
          <div key={ac.name} className="glass-card rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ac.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{ac.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{ac.desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ac.instruments.map((inst) => (
                <span
                  key={inst}
                  className="rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 font-mono text-xs text-foreground"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="mb-6 text-sm text-muted-foreground">
          All instruments shown are simulated. No real market execution occurs.
        </p>
        <Link to="/register">
          <Button
            size="lg"
            className="gold-gradient text-primary-foreground font-semibold px-8"
          >
            Start Trading <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
    <LandingFooter />
  </div>
);

export default Markets;
