import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardShell from '@/components/DashboardShell';
import { useToast } from '@/hooks/use-toast';
import {
  getVerificationStatus,
  setEmailVerificationStatus,
  setIdentityVerificationStatus,
  setAddressVerificationStatus,
  setDeclarationsAccepted,
  setSuitabilityCompleted,
  setAccountReviewStatus,
  getComplianceDeclarations,
  VerificationStatus,
  ComplianceDeclarations,
} from '@/lib/account-store';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  Mail,
  User,
  MapPin,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Upload,
  RefreshCw,
  Info,
} from 'lucide-react';

// Status badge configurations
const statusConfig = {
  // Email statuses
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: Clock,
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Mail,
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle,
  },
  // Identity/Address statuses
  not_started: {
    label: 'Not Started',
    color: 'bg-muted text-muted-foreground border-border',
    icon: Circle,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Upload,
  },
  requires_action: {
    label: 'Requires Action',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: AlertCircle,
  },
  // Boolean statuses
  completed: {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle,
  },
  // Review statuses
  in_review: {
    label: 'In Review',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: AlertCircle,
  },
};

// Status Badge Component
function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: 'email' | 'identity' | 'address' | 'boolean' | 'review';
}) {
  let config = statusConfig[status as keyof typeof statusConfig];

  // Handle boolean type
  if (type === 'boolean') {
    config =
      status === 'true' || status === 'completed'
        ? statusConfig.completed
        : statusConfig.not_started;
  }

  if (!config) return null;

  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

// Timeline Connector Component
function TimelineConnector({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute left-[23px] top-12 bottom-0 w-0.5">
      <div
        className={`w-full h-full ${isActive ? 'bg-primary/30' : 'bg-border/50'}`}
      />
    </div>
  );
}

// Format date helper
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function DashboardVerification() {
  const { toast } = useToast();

  // State
  const [verification, setVerification] = useState<VerificationStatus>(
    getVerificationStatus()
  );
  const [compliance, setCompliance] = useState<ComplianceDeclarations>(
    getComplianceDeclarations()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [suitabilityDialogOpen, setSuitabilityDialogOpen] = useState(false);

  // Refresh data on mount
  useEffect(() => {
    setVerification(getVerificationStatus());
    setCompliance(getComplianceDeclarations());
  }, []);

  // Calculate overall progress
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 6;

    if (verification.emailVerification === 'verified') completed++;
    if (verification.identityVerification === 'verified') completed++;
    if (verification.addressVerification === 'verified') completed++;
    if (verification.declarationsAccepted) completed++;
    if (verification.suitabilityCompleted) completed++;
    if (verification.accountReviewStatus === 'approved') completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // Action handlers
  const handleResendEmail = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmailVerificationStatus('sent');
    setVerification(getVerificationStatus());
    setIsLoading(false);
    toast({
      title: 'Verification Email Sent',
      description: 'Please check your inbox for the verification link.',
    });
  };

  const handleStartIdentityVerification = () => {
    setIdentityDialogOpen(true);
  };

  const handleSubmitIdentity = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIdentityVerificationStatus('submitted');
    setVerification(getVerificationStatus());
    setIsLoading(false);
    setIdentityDialogOpen(false);
    toast({
      title: 'Identity Documents Submitted',
      description:
        'Your documents are under review. This may take 1-2 business days.',
    });
  };

  const handleStartAddressVerification = () => {
    setAddressDialogOpen(true);
  };

  const handleSubmitAddress = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAddressVerificationStatus('submitted');
    setVerification(getVerificationStatus());
    setIsLoading(false);
    setAddressDialogOpen(false);
    toast({
      title: 'Address Documents Submitted',
      description:
        'Your proof of address is under review. This may take 1-2 business days.',
    });
  };

  const handleCompleteSuitability = () => {
    setSuitabilityDialogOpen(true);
  };

  const handleSubmitSuitability = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuitabilityCompleted(true);
    setVerification(getVerificationStatus());
    setIsLoading(false);
    setSuitabilityDialogOpen(false);
    toast({
      title: 'Suitability Assessment Completed',
      description: 'Your trading profile has been updated.',
    });
  };

  const isDev = import.meta.env.DEV;

  // Mock function to simulate verification for testing
  const simulateVerification = isDev
    ? (type: 'email' | 'identity' | 'address') => {
        if (type === 'email') {
          setEmailVerificationStatus('verified');
        } else if (type === 'identity') {
          setIdentityVerificationStatus('verified');
        } else if (type === 'address') {
          setAddressVerificationStatus('verified');
        }
        setVerification(getVerificationStatus());
        toast({
          title: 'Status Updated',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} verification marked as complete.`,
        });
      }
    : undefined;

  return (
    <DashboardShell title="Verification Center" activeItem="Verification">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Title and Progress */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Account Verification
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete verification to unlock full platform access
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {progress}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                Complete
              </span>
            </div>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Start</span>
            <span>Documents</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Alert Banner */}
        {progress < 100 && (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">
              Verification Required
            </AlertTitle>
            <AlertDescription className="text-amber-500/80">
              Complete all verification steps to unlock live trading and higher
              withdrawal limits.
            </AlertDescription>
          </Alert>
        )}

        {progress === 100 && (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Fully Verified</AlertTitle>
            <AlertDescription className="text-green-500/80">
              Your account is fully verified. You have access to all platform
              features.
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Timeline */}
        <div className="space-y-0">
          {/* 1. Email Verification */}
          <div className="relative">
            <TimelineConnector isActive={true} />
            <Card className="glass-card border-border/50 relative z-10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.emailVerification === 'verified'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Email Verification
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Verify your email address to secure your account
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={verification.emailVerification}
                    type="email"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  {verification.emailVerification !== 'verified' ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => void handleResendEmail()}
                        disabled={isLoading}
                        className="gap-2 gold-gradient text-primary-foreground"
                        size="sm"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Resend Email
                      </Button>
                      {isDev && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => simulateVerification?.('email')}
                          className="text-xs"
                        >
                          Simulate Verified (Dev)
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Email verified successfully</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Identity Verification */}
          <div className="relative mt-4">
            <TimelineConnector
              isActive={verification.emailVerification === 'verified'}
            />
            <Card
              className={`glass-card border-border/50 relative z-10 ${
                verification.emailVerification !== 'verified'
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.identityVerification === 'verified'
                          ? 'bg-green-500/10 text-green-500'
                          : verification.identityVerification ===
                              'requires_action'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Identity Verification
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Upload government-issued ID for identity confirmation
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={verification.identityVerification}
                    type="identity"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  {verification.identityVerification === 'not_started' && (
                    <Button
                      onClick={handleStartIdentityVerification}
                      disabled={verification.emailVerification !== 'verified'}
                      className="gap-2 gold-gradient text-primary-foreground"
                      size="sm"
                    >
                      <Upload className="h-4 w-4" />
                      Start Verification
                    </Button>
                  )}
                  {verification.identityVerification === 'submitted' && (
                    <div className="flex items-center gap-2 text-sm text-blue-500">
                      <Clock className="h-4 w-4" />
                      <span>Under review • Expected: 1-2 business days</span>
                    </div>
                  )}
                  {verification.identityVerification === 'requires_action' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>Additional documents required</span>
                      </div>
                      <Button
                        onClick={handleStartIdentityVerification}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                      >
                        <Upload className="h-4 w-4" />
                        Re-submit Documents
                      </Button>
                    </div>
                  )}
                  {verification.identityVerification === 'verified' && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Identity verified</span>
                    </div>
                  )}
                  {verification.identityVerification !== 'verified' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => simulateVerification?.('identity')}
                      className="text-xs text-muted-foreground mt-2"
                    >
                      Simulate Verified (Dev)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Address Verification */}
          <div className="relative mt-4">
            <TimelineConnector
              isActive={verification.identityVerification === 'verified'}
            />
            <Card
              className={`glass-card border-border/50 relative z-10 ${
                verification.identityVerification !== 'verified'
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.addressVerification === 'verified'
                          ? 'bg-green-500/10 text-green-500'
                          : verification.addressVerification ===
                              'requires_action'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Address Verification
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Upload proof of address (utility bill, bank statement)
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={verification.addressVerification}
                    type="address"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  {verification.addressVerification === 'not_started' && (
                    <Button
                      onClick={handleStartAddressVerification}
                      disabled={
                        verification.identityVerification !== 'verified'
                      }
                      className="gap-2 gold-gradient text-primary-foreground"
                      size="sm"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Proof of Address
                    </Button>
                  )}
                  {verification.addressVerification === 'submitted' && (
                    <div className="flex items-center gap-2 text-sm text-blue-500">
                      <Clock className="h-4 w-4" />
                      <span>Under review • Expected: 1-2 business days</span>
                    </div>
                  )}
                  {verification.addressVerification === 'requires_action' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          Document rejected - please upload a clearer image
                        </span>
                      </div>
                      <Button
                        onClick={handleStartAddressVerification}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                      >
                        <Upload className="h-4 w-4" />
                        Re-upload Document
                      </Button>
                    </div>
                  )}
                  {verification.addressVerification === 'verified' && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Address verified</span>
                    </div>
                  )}
                  {verification.addressVerification !== 'verified' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => simulateVerification?.('address')}
                      className="text-xs text-muted-foreground mt-2"
                    >
                      Simulate Verified (Dev)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Declarations Accepted */}
          <div className="relative mt-4">
            <TimelineConnector
              isActive={verification.addressVerification === 'verified'}
            />
            <Card
              className={`glass-card border-border/50 relative z-10 ${
                verification.addressVerification !== 'verified'
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.declarationsAccepted
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Declarations Accepted
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Required legal and compliance agreements
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      verification.declarationsAccepted
                        ? 'completed'
                        : 'not_started'
                    }
                    type="boolean"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">
                        Terms of Service
                      </span>
                      {compliance.termsAccepted.accepted ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">
                        Privacy Policy
                      </span>
                      {compliance.privacyPolicyAccepted.accepted ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">
                        Risk Disclosure
                      </span>
                      {compliance.riskDisclosureAccepted.accepted ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">
                        Suitability Acknowledgment
                      </span>
                      {compliance.suitabilityAcknowledged.accepted ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {!verification.declarationsAccepted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeclarationsAccepted(true);
                        setVerification(getVerificationStatus());
                        toast({
                          title: 'Declarations Accepted',
                          description:
                            'All compliance declarations have been marked as accepted.',
                        });
                      }}
                      className="text-xs text-muted-foreground mt-2"
                    >
                      Simulate Accepted (Dev)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5. Suitability Assessment */}
          <div className="relative mt-4">
            <TimelineConnector isActive={verification.declarationsAccepted} />
            <Card
              className={`glass-card border-border/50 relative z-10 ${
                !verification.declarationsAccepted ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.suitabilityCompleted
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Suitability Assessment
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Complete your trading experience and risk profile
                        assessment
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      verification.suitabilityCompleted
                        ? 'completed'
                        : 'not_started'
                    }
                    type="boolean"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  {!verification.suitabilityCompleted ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        This assessment helps us understand your trading
                        experience and ensure our platform is suitable for your
                        needs.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleCompleteSuitability}
                          disabled={!verification.declarationsAccepted}
                          className="gap-2 gold-gradient text-primary-foreground"
                          size="sm"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          Complete Assessment
                        </Button>
                        {isDev && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSuitabilityCompleted(true);
                              setVerification(getVerificationStatus());
                              toast({
                                title: 'Assessment Completed',
                                description:
                                  'Your suitability assessment has been marked as complete.',
                              });
                            }}
                            className="text-xs text-muted-foreground"
                          >
                            Simulate Complete (Dev)
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Suitability assessment completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 6. Account Review */}
          <div className="relative mt-4">
            <Card
              className={`glass-card border-border/50 relative z-10 ${
                !verification.suitabilityCompleted ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        verification.accountReviewStatus === 'approved'
                          ? 'bg-green-500/10 text-green-500'
                          : verification.accountReviewStatus === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Account Review
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Final compliance review before account activation
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge
                    status={verification.accountReviewStatus}
                    type="review"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pl-[60px]">
                  {verification.accountReviewStatus === 'pending' && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Your account will be submitted for review once all
                        verification steps are complete.
                      </p>
                      <p className="mt-1">
                        Expected timeframe: 1-3 business days
                      </p>
                    </div>
                  )}
                  {verification.accountReviewStatus === 'in_review' && (
                    <div className="flex items-center gap-2 text-sm text-blue-500">
                      <Clock className="h-4 w-4" />
                      <span>Under review • Expected: 1-3 business days</span>
                    </div>
                  )}
                  {verification.accountReviewStatus === 'approved' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <span>Account approved and active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Approved on{' '}
                        {formatDate(compliance.registrationSubmittedAt)}
                      </p>
                    </div>
                  )}
                  {verification.accountReviewStatus === 'rejected' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>Account application rejected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Please contact support for more information.
                      </p>
                    </div>
                  )}

                  {verification.accountReviewStatus !== 'approved' &&
                    verification.suitabilityCompleted &&
                    isDev && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAccountReviewStatus('approved');
                          setVerification(getVerificationStatus());
                          toast({
                            title: 'Account Approved',
                            description:
                              'Your account has been marked as approved.',
                          });
                        }}
                        className="text-xs text-muted-foreground mt-2"
                      >
                        Simulate Approved (Dev)
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Identity Verification Dialog */}
      <Dialog open={identityDialogOpen} onOpenChange={setIdentityDialogOpen}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Identity Verification
            </DialogTitle>
            <DialogDescription>
              Upload a clear photo of your government-issued ID (passport,
              driver&apos;s license, or national ID).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your ID document here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Document must be valid and not expired</li>
                <li>All four corners must be visible</li>
                <li>Text must be clearly readable</li>
                <li>No glare or reflections</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIdentityDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmitIdentity()}
              disabled={isLoading}
              className="gap-2 gold-gradient text-primary-foreground"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Submit Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Verification Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address Verification
            </DialogTitle>
            <DialogDescription>
              Upload a recent proof of address document (utility bill, bank
              statement, or government letter).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your proof of address here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Document must be dated within the last 3 months</li>
                <li>Name and address must match your profile</li>
                <li>Official letterhead or logo must be visible</li>
                <li>Full page must be visible</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmitAddress()}
              disabled={isLoading}
              className="gap-2 gold-gradient text-primary-foreground"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Submit Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suitability Assessment Dialog */}
      <Dialog
        open={suitabilityDialogOpen}
        onOpenChange={setSuitabilityDialogOpen}
      >
        <DialogContent className="glass-card border-border/50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Suitability Assessment
            </DialogTitle>
            <DialogDescription>
              Please answer the following questions to help us understand your
              trading experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">
                1. How many years of trading experience do you have?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'No experience',
                  'Less than 1 year',
                  '1-3 years',
                  '3+ years',
                ].map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-auto py-2"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                2. What is your primary trading objective?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Capital growth',
                  'Income generation',
                  'Hedging',
                  'Speculation',
                ].map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-auto py-2"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                3. What percentage of your income can you afford to lose?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['Less than 5%', '5-10%', '10-20%', 'More than 20%'].map(
                  (option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuitabilityDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmitSuitability()}
              disabled={isLoading}
              className="gap-2 gold-gradient text-primary-foreground"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Complete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
