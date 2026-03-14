import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';
import { loadRegistration, saveStep4 } from '@/lib/registration-store';

const AccountPending = () => {
  const reg = loadRegistration();
  const [emailSent, setEmailSent] = useState(
    reg?.step4?.emailVerificationSent ?? false
  );
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (reg?.step4) {
      saveStep4({ ...reg.step4, emailVerificationSent: true });
    }
    setEmailSent(true);
    setSending(false);
  };

  const checklist = [
    {
      label: 'Registration submitted',
      done: !!reg?.completed,
      icon: CheckCircle2,
    },
    {
      label: emailSent
        ? 'Verification email sent'
        : 'Email verification pending',
      done: emailSent,
      icon: Mail,
    },
    { label: 'Account review pending', done: false, icon: Shield },
    { label: 'Activation pending', done: false, icon: Clock },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              ProTraderSim
            </span>
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Your Account Is Pending Activation
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Your registration has been received. Please verify your email
              address to proceed with account activation.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {checklist.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${item.done ? 'text-success' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {item.label}
                </span>
                {item.done && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-success">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleResend}
              disabled={sending}
              className="flex-1 gold-gradient text-primary-foreground font-semibold"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            <Link to="/register/review" className="flex-1">
              <Button variant="outline" className="w-full">
                Review Submitted Details
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Return to Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPending;
