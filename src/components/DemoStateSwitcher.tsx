import { useState } from "react";
import { Settings2, RotateCcw, Trash2, TrendingUp, TrendingDown, Trophy, XCircle } from "lucide-react";
import { AccountState as AuthAccountState, getDemoState, setDemoState } from "@/lib/auth-store";
import { resetAccount, clearAllData, getAccount, saveAccount } from "@/lib/trading-store";
import { resetChallenge, saveChallengeStatus } from "@/lib/analytics-engine";

const states: { value: AuthAccountState | "auto"; label: string }[] = [
  { value: "auto", label: "Auto (from registration)" },
  { value: "unregistered", label: "No Account" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "pending_review", label: "Pending Review" },
  { value: "active", label: "Active Account" },
];

const balancePresets = [1000, 5000, 10000, 50000, 100000];

const DemoStateSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<AuthAccountState | "auto">(getDemoState() ?? "auto");
  const [showSim, setShowSim] = useState(false);

  const handleChange = (val: AuthAccountState | "auto") => {
    setCurrent(val);
    setDemoState(val === "auto" ? null : val);
  };

  const handleResetAccount = (balance?: number) => {
    resetAccount(balance);
    window.location.reload();
  };

  const handleClearAll = () => {
    clearAllData();
    window.location.reload();
  };

  const handleStressMargin = () => {
    // Set balance very low to trigger margin warnings
    const account = getAccount();
    account.balance = 50;
    saveAccount(account);
  };

  const handleSeedWins = async () => {
    const { seedWinningTrades } = await import("@/lib/analytics-engine");
    seedWinningTrades();
    window.location.reload();
  };

  const handleSeedLosses = async () => {
    const { seedLosingTrades } = await import("@/lib/analytics-engine");
    seedLosingTrades();
    window.location.reload();
  };

  const handleSimChallengePass = () => {
    saveChallengeStatus("passed");
    window.location.reload();
  };

  const handleSimChallengeFail = () => {
    saveChallengeStatus("failed");
    window.location.reload();
  };

  const handleResetPerformance = () => {
    resetChallenge();
    clearAllData();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="mb-2 w-64 rounded-xl glass-card p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          {/* Auth State */}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Demo State
          </p>
          {states.map((s) => (
            <button
              key={s.value}
              onClick={() => handleChange(s.value)}
              className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                current === s.value
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {s.label}
            </button>
          ))}

          {/* Simulator Controls */}
          <button
            onClick={() => setShowSim(!showSim)}
            className="w-full text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-2 pt-2 border-t border-border/30 hover:text-foreground"
          >
            Simulator Controls {showSim ? "▾" : "▸"}
          </button>

          {showSim && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground px-1">Set Balance</p>
              <div className="flex flex-wrap gap-1">
                {balancePresets.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleResetAccount(b)}
                    className="text-[10px] px-2 py-1 rounded bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 font-mono"
                  >
                    ${b.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStressMargin}
                className="w-full flex items-center gap-2 text-left text-xs px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                <Settings2 className="h-3 w-3" /> Trigger Margin Stress
              </button>

              <button
                onClick={() => handleResetAccount()}
                className="w-full flex items-center gap-2 text-left text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset Account
              </button>

              <button
                onClick={handleClearAll}
                className="w-full flex items-center gap-2 text-left text-xs px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear All Data
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full glass-card text-muted-foreground hover:text-primary transition-colors"
        title="Demo State Switcher"
      >
        <Settings2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DemoStateSwitcher;
