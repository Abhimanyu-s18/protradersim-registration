import * as React from 'react';
import {
  Mail,
  Clock,
  Trophy,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  RefreshCw,
  Shield,
  UserCircle,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAccountState } from '@/lib/auth-store';
import {
  getEmailVerificationStatus,
  getIdentityVerificationStatus,
  getAddressVerificationStatus,
  getAccountReviewStatus,
  type EmailVerificationStatus,
  type IdentityVerificationStatus,
  type AddressVerificationStatus,
} from '@/lib/account-store';

// ── Types ──

export type AccountStatusBannerVariant = 'compact' | 'full';

export type AccountStatusType =
  | 'pending_verification'
  | 'in_review'
  | 'challenge_active'
  | 'requires_action'
  | 'active';

interface AccountStatusConfig {
  type: AccountStatusType;
  priority: number;
  icon: React.ElementType;
  title: string;
  description: string;
  variant: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  timestamp?: string;
}

interface AccountStatusBannerProps {
  variant?: AccountStatusBannerVariant;
  onDismiss?: () => void;
  className?: string;
}

// ── Status Color Configurations ──

const statusColors = {
  warning: {
    border: 'border-[#D4AF37]/30',
    bg: 'bg-[#D4AF37]/10',
    text: 'text-[#D4AF37]',
    icon: 'text-[#D4AF37]',
    glow: 'shadow-[#D4AF37]/10',
  },
  info: {
    border: 'border-[hsl(210,36%,37%)]/30',
    bg: 'bg-[hsl(210,36%,37%)]/10',
    text: 'text-[hsl(210,36%,55%)]',
    icon: 'text-[hsl(210,36%,55%)]',
    glow: 'shadow-[hsl(210,36%,37%)]/10',
  },
  success: {
    border: 'border-[#2E8B57]/30',
    bg: 'bg-[#2E8B57]/10',
    text: 'text-[#2E8B57]',
    icon: 'text-[#2E8B57]',
    glow: 'shadow-[#2E8B57]/10',
  },
  destructive: {
    border: 'border-[#C75B5B]/30',
    bg: 'bg-[#C75B5B]/10',
    text: 'text-[#C75B5B]',
    icon: 'text-[#C75B5B]',
    glow: 'shadow-[#C75B5B]/10',
  },
  default: {
    border: 'border-border/50',
    bg: 'bg-card/50',
    text: 'text-foreground',
    icon: 'text-muted-foreground',
    glow: 'shadow-none',
  },
};

// ── Helper Functions ──

function getPendingVerificationBanner(
  emailStatus: EmailVerificationStatus,
  identityStatus: IdentityVerificationStatus,
  addressStatus: AddressVerificationStatus
): AccountStatusConfig {
  // Email verification takes priority if not verified
  if (emailStatus !== 'verified') {
    return {
      type: 'pending_verification',
      priority: 2,
      icon: Mail,
      title: 'Email Verification Pending',
      description:
        emailStatus === 'sent'
          ? "We've sent a verification link to your email. Please check your inbox and click the link to verify your email address."
          : 'Please verify your email address to continue. Click the button below to resend the verification email.',
      variant: 'warning',
      primaryAction: {
        label: 'Resend Email',
        onClick: () => {
          // Mock resend action
          console.log('Resending verification email...');
        },
      },
      secondaryAction:
        emailStatus === 'sent'
          ? {
              label: 'View Details',
              onClick: () => {
                window.location.href = '/dashboard';
              },
            }
          : undefined,
    };
  }

  // Identity verification is next priority
  if (identityStatus === 'pending' || identityStatus === 'not_started') {
    const identityPendingDesc = `Your identity verification documents are being reviewed. This typically takes 1-2 business days. We will notify you once the review is complete.`;
    const identityNotStartedDesc = `Please upload your identity verification documents to continue. We require a valid government-issued ID.`;

    return {
      type: 'pending_verification',
      priority: 2,
      icon: UserCircle,
      title: 'Identity Verification Pending',
      description:
        identityStatus === 'pending'
          ? identityPendingDesc
          : identityNotStartedDesc,
      variant: 'warning',
      primaryAction: {
        label:
          identityStatus === 'pending' ? 'View Status' : 'Upload Documents',
        onClick: () => {
          window.location.href = '/dashboard/verification';
        },
      },
      secondaryAction: {
        label: 'View Requirements',
        onClick: () => {
          window.location.href = '/dashboard/verification';
        },
      },
    };
  }

  // Address verification is last priority
  if (addressStatus === 'pending' || addressStatus === 'not_started') {
    const addressPendingDesc = `Your address verification documents are being reviewed. This typically takes 1-2 business days. We will notify you once the review is complete.`;
    const addressNotStartedDesc = `Please upload a proof of address document to continue. We accept utility bills or bank statements from the last 3 months.`;

    return {
      type: 'pending_verification',
      priority: 2,
      icon: Home,
      title: 'Address Verification Pending',
      description:
        addressStatus === 'pending'
          ? addressPendingDesc
          : addressNotStartedDesc,
      variant: 'warning',
      primaryAction: {
        label: addressStatus === 'pending' ? 'View Status' : 'Upload Document',
        onClick: () => {
          window.location.href = '/dashboard/verification';
        },
      },
      secondaryAction: {
        label: 'View Requirements',
        onClick: () => {
          window.location.href = '/dashboard/verification';
        },
      },
    };
  }

  // Fallback - should not reach here if called properly
  return {
    type: 'pending_verification',
    priority: 2,
    icon: Mail,
    title: 'Verification Pending',
    description:
      'Please complete your account verification to access all features.',
    variant: 'warning',
    primaryAction: {
      label: 'Complete Setup',
      onClick: () => {
        window.location.href = '/dashboard';
      },
    },
  };
}

function determineMostRelevantStatus(): AccountStatusConfig {
  const emailStatus = getEmailVerificationStatus();
  const identityStatus = getIdentityVerificationStatus();
  const addressStatus = getAddressVerificationStatus();
  const reviewStatus = getAccountReviewStatus();
  const accountState = getAccountState();

  // Check for requires_action (highest priority)
  if (
    identityStatus === 'requires_action' ||
    addressStatus === 'requires_action' ||
    reviewStatus === 'rejected'
  ) {
    return {
      type: 'requires_action',
      priority: 1,
      icon: AlertCircle,
      title: 'Verification Action Required',
      description:
        identityStatus === 'requires_action'
          ? 'Additional documentation is needed to verify your identity. Please review the requirements and resubmit.'
          : addressStatus === 'requires_action'
            ? 'Your address verification requires additional documents. Please upload a recent utility bill or bank statement.'
            : 'Your account verification was not approved. Please review the feedback and resubmit your application.',
      variant: 'destructive',
      primaryAction: {
        label: 'Complete Verification',
        onClick: () => {
          window.location.href = '/dashboard';
        },
      },
      secondaryAction: {
        label: 'View Details',
        onClick: () => {
          window.location.href = '/dashboard';
        },
      },
    };
  }

  // Check for pending_verification
  if (
    emailStatus !== 'verified' ||
    identityStatus === 'not_started' ||
    identityStatus === 'pending' ||
    addressStatus === 'not_started' ||
    addressStatus === 'pending'
  ) {
    return getPendingVerificationBanner(
      emailStatus,
      identityStatus,
      addressStatus
    );
  }

  // Check for in_review
  if (reviewStatus === 'in_review' || reviewStatus === 'pending') {
    let submittedAt: string | undefined;
    try {
      submittedAt =
        localStorage.getItem('pts_compliance_submitted_at') ?? undefined;
    } catch {
      // localStorage unavailable (SSR or restricted storage)
    }
    const timestamp = submittedAt
      ? new Date(submittedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : undefined;

    return {
      type: 'in_review',
      priority: 3,
      icon: Clock,
      title: 'Account Review in Progress',
      description:
        "Your account is currently under review by our compliance team. This process typically takes 1-2 business days. We'll notify you once the review is complete.",
      variant: 'info',
      secondaryAction: {
        label: 'View Status',
        onClick: () => {
          window.location.href = '/register-review';
        },
      },
      timestamp: timestamp ? `Submitted on ${timestamp}` : undefined,
    };
  }

  // Check for challenge_active (if account is active and has active challenge)
  if (accountState === 'active') {
    // Check if there's an active challenge (mock check)
    let hasActiveChallenge = false;
    try {
      hasActiveChallenge =
        localStorage.getItem('pts_active_challenge') === 'true';
    } catch {
      // localStorage unavailable
    }
    if (hasActiveChallenge) {
      return {
        type: 'challenge_active',
        priority: 4,
        icon: Trophy,
        title: 'Challenge Currently Active',
        description:
          "You're currently participating in a ProTrader Challenge. Complete the trading objectives to qualify for a funded account.",
        variant: 'success',
        primaryAction: {
          label: 'View Challenge',
          onClick: () => {
            window.location.href = '/dashboard/challenge';
          },
        },
        secondaryAction: {
          label: 'View Rules',
          onClick: () => {
            window.location.href = '/dashboard/challenge';
          },
        },
      };
    }

    // Account fully verified and active
    return {
      type: 'active',
      priority: 5,
      icon: CheckCircle,
      title: 'Account Verified',
      description:
        'Your account is fully verified and active. You have full access to all platform features.',
      variant: 'success',
    };
  }

  // Default fallback - treat as pending verification
  return {
    type: 'pending_verification',
    priority: 2,
    icon: Mail,
    title: 'Verification Pending',
    description:
      'Please complete your account verification to access all features.',
    variant: 'warning',
    primaryAction: {
      label: 'Complete Setup',
      onClick: () => {
        window.location.href = '/dashboard';
      },
    },
  };
}

// ── Compact Variant Component ──

function CompactBanner({
  status,
  onDismiss,
  className,
}: {
  status: AccountStatusConfig;
  onDismiss?: () => void;
  className?: string;
}) {
  const colors = statusColors[status.variant];
  const Icon = status.icon;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg border px-4 py-3 backdrop-blur-sm',
        'bg-card/80 shadow-lg transition-all duration-200',
        colors.border,
        colors.glow,
        className
      )}
    >
      <div className={cn('flex-shrink-0', colors.icon)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', colors.text)}>
          {status.title}
        </p>
      </div>

      {status.primaryAction && (
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'h-7 px-2 text-xs font-medium flex-shrink-0',
            'hover:bg-transparent hover:underline',
            colors.text
          )}
          onClick={status.primaryAction.onClick}
        >
          {status.primaryAction.label}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ── Full Variant Component ──

function FullBanner({
  status,
  onDismiss,
  className,
}: {
  status: AccountStatusConfig;
  onDismiss?: () => void;
  className?: string;
}) {
  const colors = statusColors[status.variant];
  const Icon = status.icon;

  return (
    <Alert
      className={cn(
        'relative overflow-hidden glass-card',
        'border-l-4',
        colors.border,
        colors.bg,
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 opacity-5 pointer-events-none',
          status.variant === 'warning' &&
            'bg-gradient-to-r from-[#D4AF37] to-transparent',
          status.variant === 'info' &&
            'bg-gradient-to-r from-[hsl(210,36%,37%)] to-transparent',
          status.variant === 'success' &&
            'bg-gradient-to-r from-[#2E8B57] to-transparent',
          status.variant === 'destructive' &&
            'bg-gradient-to-r from-[#C75B5B] to-transparent'
        )}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0',
            'bg-background/50 backdrop-blur-sm border',
            colors.border,
            colors.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <AlertTitle className={cn('text-base font-semibold', colors.text)}>
              {status.title}
            </AlertTitle>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
            {status.description}
          </AlertDescription>

          {/* Timestamp */}
          {status.timestamp && (
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 mt-2">
              <Clock className="h-3 w-3" />
              {status.timestamp}
            </p>
          )}

          {/* Action Buttons */}
          {(status.primaryAction || status.secondaryAction) && (
            <div className="flex items-center gap-3 pt-3">
              {status.primaryAction && (
                <Button
                  size="sm"
                  className={cn(
                    'h-8 px-4 text-xs font-medium',
                    status.variant === 'warning' &&
                      'gold-gradient text-primary-foreground',
                    status.variant === 'destructive' &&
                      'bg-[#C75B5B] hover:bg-[#C75B5B]/90 text-white',
                    status.variant === 'info' &&
                      'bg-[hsl(210,36%,37%)] hover:bg-[hsl(210,36%,45%)] text-white',
                    status.variant === 'success' &&
                      'bg-[#2E8B57] hover:bg-[#2E8B57]/90 text-white'
                  )}
                  onClick={status.primaryAction.onClick}
                >
                  {status.primaryAction.label === 'Resend Email' && (
                    <RefreshCw className="mr-1.5 h-3 w-3" />
                  )}
                  {status.primaryAction.label === 'Complete Verification' && (
                    <Shield className="mr-1.5 h-3 w-3" />
                  )}
                  {status.primaryAction.label}
                </Button>
              )}
              {status.secondaryAction && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-xs font-medium border-border/50 hover:bg-muted/50"
                  onClick={status.secondaryAction.onClick}
                >
                  {status.secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

// ── Main Component ──

export function AccountStatusBanner({
  variant = 'compact',
  onDismiss,
  className,
}: AccountStatusBannerProps) {
  const [status, setStatus] = React.useState<AccountStatusConfig | null>(null);

  React.useEffect(() => {
    // Determine status on client side only
    const currentStatus = determineMostRelevantStatus();
    setStatus(currentStatus);
  }, []);

  // Don't render if account is fully active and no dismiss handler (clean UI)
  if (!status) return null;
  if (status.type === 'active' && !onDismiss && variant === 'compact') {
    return null;
  }

  if (variant === 'compact') {
    return (
      <CompactBanner
        status={status}
        onDismiss={onDismiss}
        className={className}
      />
    );
  }

  return (
    <FullBanner status={status} onDismiss={onDismiss} className={className} />
  );
}

// ── Export Types ──

export type { AccountStatusConfig, AccountStatusBannerProps };

// ── Default Export ──

export default AccountStatusBanner;
