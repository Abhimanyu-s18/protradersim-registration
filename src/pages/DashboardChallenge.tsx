import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Target, AlertTriangle, CheckCircle2, XCircle,
  Clock, TrendingUp, ShieldCheck, Activity, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/DashboardShell";
import { evaluateChallenge, ChallengeState, saveChallengeStatus } from "@/lib/analytics-engine";
import { getAccount } from "@/lib/trading-store";

const fmt = (n: number, d = 2) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;

const statusConfig = {
  not_started: { label: "Not Started", icon: Clock, color: "text-muted-foreground", bg: "bg-muted/30" },
  in_progress: { label: "In Progress", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
  passed: { label: "Passed", icon: Trophy, color: "text-success", bg: "bg-success/10" },
  failed: { label: "Failed", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const DashboardChallenge = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengeState>(evaluateChallenge);
  const account = getAccount();

  useEffect(() => {
    const interval = setInterval(() => setChallenge(evaluateChallenge()), 3000);
    return () => clearInterval(interval);
  }, []);

  const sc = statusConfig[challenge.status];
  const StatusIcon = sc.icon;

  const rules = [
    {
      label: "Profit Target",
      target: `+${challenge.rules.profitTarget}%`,
      current: `${challenge.currentReturn >= 0 ? "+" : ""}${challenge.currentReturn.toFixed(2)}%`,
      progress: challenge.progressPercent,
      ok: challenge.currentReturn >= challenge.rules.profitTarget,
      breached: false,
    },
    {
      label: "Max Daily Drawdown",
      target: `${challenge.rules.maxDailyDrawdown}%`,
      current: `${challenge.dailyDrawdown.toFixed(2)}%`,
      progress: Math.min(100, (challenge.dailyDrawdown / challenge.rules.maxDailyDrawdown) * 100),
      ok: challenge.dailyDrawdown < challenge.rules.maxDailyDrawdown,
      breached: challenge.dailyDrawdown >= challenge.rules.maxDailyDrawdown,
    },
    {
      label: "Max Total Drawdown",
      target: `${challenge.rules.maxTotalDrawdown}%`,
      current: `${challenge.currentDrawdown.toFixed(2)}%`,
      progress: Math.min(100, (challenge.currentDrawdown / challenge.rules.maxTotalDrawdown) * 100),
      ok: challenge.currentDrawdown < challenge.rules.maxTotalDrawdown,
      breached: challenge.currentDrawdown >= challenge.rules.maxTotalDrawdown,
    },
    {
      label: "Minimum Trading Days",
      target: `${challenge.rules.minTradingDays} days`,
      current: `${challenge.tradingDays} day(s)`,
      progress: Math.min(100, (challenge.tradingDays / challenge.rules.minTradingDays) * 100),
      ok: challenge.tradingDays >= challenge.rules.minTradingDays,
      breached: false,
    },
  ];

  const totalDrawdownBuffer = Math.max(0, challenge.rules.maxTotalDrawdown - challenge.currentDrawdown);
  const dailyDrawdownBuffer = Math.max(0, challenge.rules.maxDailyDrawdown - challenge.dailyDrawdown);

  return (
    <DashboardShell title="Trader Evaluation" activeItem="Challenge">
      {/* Status Banner */}
      <div className={`glass-card rounded-xl p-6 ${sc.bg} border-l-4 ${
        challenge.status === "passed" ? "border-l-success" :
        challenge.status === "failed" ? "border-l-destructive" :
        challenge.status === "in_progress" ? "border-l-primary" : "border-l-muted-foreground"
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <StatusIcon className={`h-6 w-6 ${sc.color}`} />
          <div>
            <h2 className={`text-lg font-bold ${sc.color}`}>{sc.label}</h2>
            <p className="text-xs text-muted-foreground">
              {challenge.status === "not_started" && "Begin trading to start your simulated evaluation."}
              {challenge.status === "in_progress" && "Your evaluation is active. Trade consistently to meet objectives."}
              {challenge.status === "passed" && "Congratulations! You have met all simulated challenge objectives."}
              {challenge.status === "failed" && `Evaluation breached: ${challenge.breachedRule}. Reset to try again.`}
            </p>
          </div>
        </div>
        {challenge.status !== "not_started" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress to Profit Target</span>
              <span className="font-mono text-foreground">{Math.min(100, challenge.progressPercent).toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  challenge.status === "passed" ? "bg-success" : challenge.status === "failed" ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, challenge.progressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Breach Warning */}
      {challenge.breachedRule && challenge.status === "failed" && (
        <div className="rounded-xl p-4 flex items-center gap-3 border bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Rule Violation</p>
            <p className="text-xs text-destructive/80">{challenge.breachedRule}. The simulated evaluation has been terminated.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => {
              saveChallengeStatus("not_started");
              setChallenge(evaluateChallenge());
            }}
          >
            Reset Challenge
          </Button>
        </div>
      )}

      {/* Account & Buffer */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Starting Balance", value: fmt(account.startingBalance), icon: Zap },
          { label: "Current Equity", value: fmt(account.balance), icon: TrendingUp },
          { label: "Total Drawdown Buffer", value: `${totalDrawdownBuffer.toFixed(2)}%`, icon: ShieldCheck, color: totalDrawdownBuffer < 2 ? "text-destructive" : "text-success" },
          { label: "Daily Drawdown Buffer", value: `${dailyDrawdownBuffer.toFixed(2)}%`, icon: ShieldCheck, color: dailyDrawdownBuffer < 1 ? "text-destructive" : "text-success" },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
            </div>
            <p className={`text-xl font-bold font-mono ${(item as any).color ?? "text-foreground"}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Rule Tracking */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary" /> Rule Tracking
        </h3>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {rule.breached ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : rule.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">{rule.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Target: {rule.target}</span>
                  <span className={`font-mono font-semibold ${rule.breached ? "text-destructive" : rule.ok ? "text-success" : "text-foreground"}`}>
                    {rule.current}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rule.breached ? "bg-destructive" : rule.ok ? "bg-success" : "bg-primary/60"
                  }`}
                  style={{ width: `${Math.min(100, rule.progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concentration / Consistency Note */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary" /> Evaluation Notes
        </h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• This is a simulated trader evaluation. No real capital is at risk.</p>
          <p>• The evaluation assesses your trading discipline across {challenge.rules.minTradingDays}+ trading days.</p>
          <p>• Drawdown limits are measured against your starting balance of {fmt(account.startingBalance)}.</p>
          <p>• Consistency in risk management is as important as reaching the profit target.</p>
          {challenge.status === "in_progress" && totalDrawdownBuffer < 3 && (
            <p className="text-destructive font-medium">⚠ You are approaching the maximum drawdown limit. Trade cautiously.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/performance")}>
          View Performance
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => navigate("/dashboard/positions")}>
          View Positions
        </Button>
        {(challenge.status === "failed" || challenge.status === "passed") && (
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => {
              saveChallengeStatus("not_started");
              setChallenge(evaluateChallenge());
            }}
          >
            Reset Evaluation
          </Button>
        )}
      </div>
    </DashboardShell>
  );
};

export default DashboardChallenge;
