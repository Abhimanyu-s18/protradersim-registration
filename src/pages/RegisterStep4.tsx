import { useNavigate } from 'react-router-dom';
import { loadRegistration } from '@/lib/registration-store';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProgressStepper from '@/components/ProgressStepper';
import { ArrowLeft, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

const RegisterStep4 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReturnType<typeof loadRegistration>>(null);

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.step3) {
      navigate('/register/step-3');
      return;
    }
    setData(saved);
  }, [navigate]);

  if (!data) return null;

  const sections = [
    { title: 'Step 1 — Personal Details', payload: data.step1 },
    { title: 'Step 2 — Address Details', payload: data.step2 },
    { title: 'Step 3 — Trading Profile', payload: data.step3 },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16 max-w-2xl">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <ProgressStepper currentStep={4} />

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Registration Step 4 Placeholder
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Final review, email verification, and declarations
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-border/60 bg-muted/30 p-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {s.title}
                </h3>
                <pre className="text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(s.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 p-3">
            <Lock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Email verification and final regulatory declarations will be
              completed in this step. Your account will be activated upon
              successful verification.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              variant="gold"
              size="lg"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              Complete Registration
            </Button>
            <Button
              variant="gold-outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/register/step-3')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trading Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterStep4;
