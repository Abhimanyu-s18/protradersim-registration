import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, LayoutDashboard, BarChart3, LineChart, Briefcase,
  ListOrdered, Target, ShieldCheck, User, LogOut, Menu, X, Activity, Trophy,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Markets", icon: BarChart3, path: "/dashboard/markets" },
  { label: "Trade Simulator", icon: LineChart, path: "/dashboard/markets" },
  { label: "Positions", icon: Briefcase, path: "/dashboard/positions" },
  { label: "Orders", icon: ListOrdered, path: "/dashboard/orders" },
  { label: "Performance", icon: Target, path: "/dashboard" },
  { label: "Risk", icon: ShieldCheck, path: "/dashboard/risk" },
  { label: "Profile", icon: User, path: "/dashboard" },
];

interface Props {
  children: React.ReactNode;
  title: string;
  activeItem: string;
}

export default function DashboardShell({ children, title, activeItem }: Props) {
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
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeItem === item.label
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
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
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-primary">
            <Activity className="h-3 w-3" /> Simulation Mode
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
