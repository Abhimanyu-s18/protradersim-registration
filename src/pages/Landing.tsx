import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  TrendingUp, BarChart3, Shield, Globe, Zap, Target, BookOpen, LineChart,
  DollarSign, Gem, Layers, Cpu, ArrowRight, CheckCircle2, Activity,
  Lock, Eye, Scale, GraduationCap,
} from "lucide-react";

/* ──────── Data ──────── */
const stats = [
  { icon: Globe, value: "60+", label: "Instruments" },
  { icon: Zap, value: "1:500", label: "Leverage Simulation" },
  { icon: Activity, value: "Real-Time", label: "Price Simulation" },
  { icon: Shield, value: "Structured", label: "Risk Controls" },
];

const features = [
  { icon: Globe, title: "Multi-Asset Exposure", desc: "Trade forex, indices, commodities, stocks, and crypto in a single simulated environment." },
  { icon: BarChart3, title: "Realistic Conditions", desc: "Experience spreads, leverage, and margin requirements that mirror live broker platforms." },
  { icon: Target, title: "Guided Onboarding", desc: "A structured 4-step account setup ensures suitability and readiness before trading." },
  { icon: Shield, title: "Risk-Awareness First", desc: "Built-in suitability checks and risk disclosures at every stage of your journey." },
  { icon: LineChart, title: "Performance Tracking", desc: "Detailed trade history, P&L analytics, and progress tracking across your simulation." },
  { icon: Layers, title: "Professional Experience", desc: "Institutional-grade UI, order types, and charting tools — all in simulation mode." },
];

const markets = [
  { icon: DollarSign, name: "Forex", desc: "Major, minor, and exotic currency pairs with tight simulated spreads.", count: "30+ pairs" },
  { icon: Gem, name: "Commodities", desc: "Gold, silver, oil, and agricultural products with realistic price behavior.", count: "10+ instruments" },
  { icon: TrendingUp, name: "Indices", desc: "Global stock indices including US, EU, and Asian benchmarks.", count: "12+ indices" },
  { icon: BarChart3, name: "Stocks", desc: "Blue-chip equities from major exchanges with CFD-style simulation.", count: "15+ stocks" },
  { icon: Cpu, name: "Crypto", desc: "Bitcoin, Ethereum, and other digital asset simulations with 24/7 pricing.", count: "8+ cryptos" },
];

const steps = [
  { step: "01", title: "Create Your Account", desc: "Provide your personal and contact details in a secure onboarding flow." },
  { step: "02", title: "Complete Your Profile", desc: "Share your address, trading experience, and suitability information." },
  { step: "03", title: "Verify and Activate", desc: "Review your details, accept declarations, and verify your email address." },
  { step: "04", title: "Start Simulated Trading", desc: "Access the platform dashboard and begin placing simulated trades." },
];

const safetyItems = [
  { icon: Eye, title: "Simulated Environment", desc: "All trades, prices, and account balances are simulated. No real capital is involved." },
  { icon: Scale, title: "Risk Awareness", desc: "Leveraged CFD products are high-risk in live markets. Understand the mechanics here first." },
  { icon: Lock, title: "Suitability-First Onboarding", desc: "Our registration assesses your experience to guide you toward appropriate resources." },
  { icon: GraduationCap, title: "Educational Intent", desc: "ProTraderSim exists to educate, train, and develop disciplined trading habits." },
];

const faqs = [
  { q: "Is this live trading?", a: "No. ProTraderSim is a simulated trading environment. No real capital is at risk, and no live brokerage execution occurs." },
  { q: "What markets can I simulate?", a: "You can simulate trades across forex, commodities, indices, stocks, and cryptocurrency markets — all with realistic pricing." },
  { q: "Is leverage supported?", a: "Yes, in simulation mode. You can configure leverage ratios up to 1:500 to practice risk and margin management." },
  { q: "Do I need trading experience?", a: "No prior experience is required. The platform is designed for beginners through advanced traders. Our onboarding assesses your level." },
  { q: "What happens after registration?", a: "After completing all four registration steps, your account enters a simulated review process. You'll receive a reference ID and next-step instructions." },
  { q: "Is email verification required?", a: "Email verification is requested during registration. You can proceed without it, but activation depends on verification." },
  { q: "Can I access this on mobile?", a: "Yes. The platform is fully responsive and optimized for mobile, tablet, and desktop experiences." },
  { q: "Are there account review steps?", a: "Yes. Our suitability and review process mirrors regulated broker onboarding standards — all in simulation." },
];

/* ──────── Component ──────── */
const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative container flex flex-col items-center py-24 text-center md:py-36">
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            CFD Simulation Platform
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Train Like a Real{" "}
            <span className="text-primary">CFD Trader</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Practice multi-asset trading with realistic market conditions, professional-grade tools, and structured onboarding — all in a risk-free simulated environment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gold-gradient text-primary-foreground font-semibold px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/platform">
              <Button size="lg" variant="outline">Explore the Platform</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/60">
            ProTraderSim is a simulated trading environment. It does not provide live brokerage execution.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 -mt-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ProTraderSim ── */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Why ProTraderSim</h2>
          <p className="mt-3 text-muted-foreground">A professional simulation platform designed for serious trader development.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 transition-colors hover:border-primary/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Markets ── */}
      <section className="border-y border-border/20 bg-muted/20 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Markets Overview</h2>
            <p className="mt-3 text-muted-foreground">Explore simulated instruments across five major asset classes.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {markets.map((m) => (
              <div key={m.name} className="glass-card rounded-xl p-6 text-center transition-colors hover:border-primary/30">
                <m.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold text-foreground">{m.name}</h3>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-3 text-muted-foreground">Four structured steps from registration to simulated trading.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.step} className="relative glass-card rounded-xl p-6">
              <span className="font-mono text-3xl font-bold text-primary/20">{s.step}</span>
              <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Experience ── */}
      <section className="border-y border-border/20 bg-muted/20 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Platform Experience</h2>
            <p className="mt-3 text-muted-foreground">Professional-grade tools for simulated trading excellence.</p>
          </div>
          <div className="glass-card mx-auto max-w-4xl overflow-hidden rounded-2xl">
            {/* Mock trading dashboard */}
            <div className="border-b border-border/30 bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">ProTraderSim — Trading Dashboard</span>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              {[
                { icon: Activity, label: "Live Price Monitoring", desc: "Real-time simulated price feeds across all asset classes" },
                { icon: Target, label: "Order Execution", desc: "Market, limit, and stop orders with instant simulated fills" },
                { icon: BarChart3, label: "Account Dashboard", desc: "Balance, equity, margin usage, and P&L overview" },
                { icon: Shield, label: "Risk & Margin", desc: "Margin level indicators and liquidation warnings" },
                { icon: LineChart, label: "Trade History", desc: "Complete log of all executed simulated trades" },
                { icon: TrendingUp, label: "Challenge Tracking", desc: "Performance benchmarks and evaluation progress" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border/30 bg-background/50 p-4">
                  <item.icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety / Transparency ── */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Safety & Transparency</h2>
          <p className="mt-3 text-muted-foreground">Responsible simulation with clear disclosures at every step.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {safetyItems.map((s) => (
            <div key={s.title} className="flex gap-4 rounded-xl border border-border/40 bg-muted/20 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
                <s.icon className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-y border-border/20 bg-muted/20 py-24">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-border/30 px-6">
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container py-24 text-center">
        <div className="glass-card mx-auto max-w-2xl rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground">Ready to Start Trading?</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Create your free simulation account and experience professional CFD trading in a risk-free environment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gold-gradient text-primary-foreground font-semibold px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Landing;
