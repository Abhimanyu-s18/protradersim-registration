import { BarChart3, Shield, Zap, Globe } from "lucide-react";

const benefits = [
  { icon: Globe, label: "60+ Instruments", desc: "Forex, indices, commodities & crypto" },
  { icon: Zap, label: "Up to 1:500 Leverage", desc: "Flexible simulated margin" },
  { icon: BarChart3, label: "Real-Time Prices", desc: "Live simulated market data" },
  { icon: Shield, label: "Risk Tools", desc: "Professional-grade analytics" },
];

const BenefitsPanel = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Why ProTraderSim
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {benefits.map((b) => (
          <div
            key={b.label}
            className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/30 p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <b.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsPanel;
