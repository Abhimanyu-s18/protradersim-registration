import { useState } from "react";
import { Settings2 } from "lucide-react";
import { AccountState, getDemoState, setDemoState } from "@/lib/auth-store";

const states: { value: AccountState | "auto"; label: string }[] = [
  { value: "auto", label: "Auto (from registration)" },
  { value: "unregistered", label: "No Account" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "pending_review", label: "Pending Review" },
  { value: "active", label: "Active Account" },
];

const DemoStateSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<AccountState | "auto">(getDemoState() ?? "auto");

  const handleChange = (val: AccountState | "auto") => {
    setCurrent(val);
    setDemoState(val === "auto" ? null : val);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="mb-2 w-56 rounded-xl glass-card p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
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
