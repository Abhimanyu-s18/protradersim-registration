import { TrendingUp } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              ProTraderSim
            </span>
            <span className="ml-1.5 hidden text-xs font-medium text-muted-foreground sm:inline">
              Simulation Platform
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          CFD Simulation Trading
        </div>
      </div>
    </header>
  );
};

export default Header;
