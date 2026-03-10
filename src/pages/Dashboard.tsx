import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, LayoutDashboard, BarChart3, LineChart, Briefcase,
  ListOrdered, Target, ShieldCheck, User, LogOut, Menu, X,
  Activity, Eye, AlertTriangle, CheckCircle2,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Markets", icon: BarChart3 },
  { label: "Trade Simulator", icon: LineChart },
  { label: "Positions", icon: Briefcase },
  { label: "Orders", icon: ListOrdered },
  { label: "Performance", icon: Target },
  { label: "Risk", icon: ShieldCheck },
  { label: "Profile", icon: User },
];

const statCards = [
  { label: "Account Status", value: "Active", sub: "Simulation Mode", color: "text-success" },
  { label: "Simulated Balance", value: "$100,000.00", sub: "Starting Capital" },
  { label: "Equity", value: "$100,000.00", sub: "No open positions" },
  { label: "Margin Used", value: "$0.00", sub: "0% utilisation" },
  { label: "Free Margin", value: "$100,000.00", sub: "100% available" },
  { label: "Daily PnL", value: "$0.00", sub: "No trades today", color: "text-muted-foreground" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-border/50 bg-sidebar-background transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gold-gradient">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">ProTraderSim</span>
          <button className="ml-auto lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-3">
          <button
            onClick={() => navigate("/sign-in")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Dashboard Overview</h1>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-primary">
            <Activity className="h-3 w-3" /> Simulation Mode
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
          {/* Placeholder banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Dashboard Shell — Coming Soon</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is a preview of the trading dashboard. Live data, charting, and order execution will be available in a future release.
              </p>
            </div>
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
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Watchlist
              </h3>
              <div className="mt-4 space-y-2">
                {["EUR/USD", "GBP/USD", "Gold", "S&P 500", "BTC/USD"].map((inst) => (
                  <div key={inst} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2.5">
                    <span className="text-sm text-foreground">{inst}</span>
                    <span className="text-xs text-muted-foreground font-mono">—</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Recent Activity
              </h3>
              <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Your simulated trades will appear here</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Risk Summary
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Margin Level", value: "∞" },
                  { label: "Open Exposure", value: "$0.00" },
                  { label: "Max Drawdown", value: "0.00%" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-sm font-mono text-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Compliance Status
              </h3>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Identity Verification", status: "Complete" },
                  { label: "Email Verification", status: "Pending" },
                  { label: "Suitability Assessment", status: "Complete" },
                  { label: "Account Activation", status: "Active" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2">
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                      c.status === "Complete" || c.status === "Active" ? "text-success" : "text-primary"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
