import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getAccountState } from '@/lib/auth-store';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stateMessage, setStateMessage] = useState<{
    type: 'warning' | 'error';
    text: string;
    cta?: { label: string; to: string };
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state (set by ProtectedRoute)
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address.';
    if (!password.trim()) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStateMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    const state = getAccountState();

    switch (state) {
      case 'active':
        // Redirect to the originally requested page, or dashboard as default
        navigate(from);
        break;
      case 'pending_review':
      case 'pending_verification':
        navigate('/account-pending');
        break;
      case 'unregistered':
      default:
        setStateMessage({
          type: 'error',
          text: "We couldn't find an account for that email.",
          cta: { label: 'Create Account', to: '/register' },
        });
        break;
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

      <div className="relative z-10 w-full max-w-md px-4">
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
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your ProTraderSim account
          </p>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-6 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border/50"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50 border-border/50"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {stateMessage && (
              <div
                className={`rounded-lg border px-4 py-3 ${
                  stateMessage.type === 'error'
                    ? 'border-destructive/30 bg-destructive/10'
                    : 'border-primary/20 bg-primary/5'
                }`}
              >
                <p className="text-xs text-muted-foreground">
                  {stateMessage.text}
                </p>
                {stateMessage.cta && (
                  <Link
                    to={stateMessage.cta.to}
                    className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {stateMessage.cta.label} →
                  </Link>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gold-gradient text-primary-foreground font-semibold"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Get Started
            </Link>
          </p>
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

export default SignIn;
