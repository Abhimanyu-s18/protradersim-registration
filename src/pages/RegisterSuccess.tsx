import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { loadRegistration } from '@/lib/registration-store';
import {
  CheckCircle2,
  Clock,
  Mail,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHECKLIST = [
  { key: 'personal', label: 'Personal details captured' },
  { key: 'address', label: 'Address details captured' },
  { key: 'trading', label: 'Trading profile completed' },
  { key: 'declarations', label: 'Declarations accepted' },
];

const NEXT_STEPS = [
  { icon: Mail, label: 'Verify your email address' },
  { icon: Clock, label: 'Wait for account review' },
  { icon: ArrowRight, label: 'Sign in once activation is confirmed' },
];

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReturnType<typeof loadRegistration>>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.completed) {
      navigate('/register');
      return;
    }
    setData(saved);
  }, [navigate]);

  if (!data) return null;

  const refId = data.step4?.referenceId || '—';
  const emailVerified = data.step4?.emailVerificationSent;

  const handleCopy = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16 max-w-2xl">
        <div className="glass-card rounded-2xl p-6 sm:p-10 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Registration Submitted Successfully
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your ProTraderSim account setup is almost complete
          </p>

          {/* Reference ID */}
          <div className="mt-6 mx-auto max-w-sm rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Registration Reference
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-lg font-semibold text-primary tracking-wider">
                {refId}
              </span>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy reference ID"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Status checklist */}
          <div className="mt-8 text-left mx-auto max-w-sm space-y-2">
            {CHECKLIST.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-2.5',
                emailVerified
                  ? 'border-success/30 bg-success/5'
                  : 'border-primary/30 bg-primary/5'
              )}
            >
              {emailVerified ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-primary shrink-0" />
              )}
              <span className="text-sm text-foreground">
                Email verification {emailVerified ? 'sent' : 'pending'}
              </span>
            </div>
          </div>

          {/* Next steps */}
          <div className="mt-8 text-left mx-auto max-w-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Next Steps
            </h3>
            <div className="space-y-2">
              {NEXT_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/register')}
            >
              Return to Sign In
            </Button>
            <Button
              variant="gold-outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/register/review')}
            >
              Review Submitted Details
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterSuccess;
