import { useNavigate } from "react-router-dom";
import { loadRegistration } from "@/lib/registration-store";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProgressStepper from "@/components/ProgressStepper";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const RegisterStep3 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReturnType<typeof loadRegistration>>(null);

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.step2) {
      navigate("/register/step-2");
      return;
    }
    setData(saved);
  }, [navigate]);

  if (!data) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16 max-w-2xl">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <ProgressStepper currentStep={3} />

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Registration Step 3 Placeholder
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Next step: Trading profile and suitability
            </p>
          </div>

          {/* Step 1 Summary */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Step 1 — Personal Details
            </h3>
            <pre className="text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(data.step1, null, 2)}
            </pre>
          </div>

          {/* Step 2 Summary */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Step 2 — Address Details
            </h3>
            <pre className="text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(data.step2, null, 2)}
            </pre>
          </div>

          <Button
            variant="gold-outline"
            size="lg"
            className="mt-6 w-full"
            onClick={() => navigate("/register/step-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Address Details
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RegisterStep3;
