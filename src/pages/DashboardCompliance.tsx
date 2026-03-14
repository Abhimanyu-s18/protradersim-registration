import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DashboardShell from '@/components/DashboardShell';
import { useToast } from '@/hooks/use-toast';
import {
  getComplianceDeclarations,
  getRegistrationReferenceId,
  getVerificationStatus,
  getRegistrationSubmittedAt,
  ComplianceDeclarations,
  VerificationStatus,
} from '@/lib/account-store';
import {
  FileText,
  Shield,
  CheckCircle,
  Download,
  Clock,
  AlertCircle,
  Archive,
  Scale,
  ShieldCheck,
  ExternalLink,
  Calendar,
  Hash,
  User,
  Mail,
  Upload,
  Activity,
} from 'lucide-react';

// Format date helper
const formatDateTime = (dateString: string | null): string => {
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Document type configuration
interface DocumentConfig {
  icon: typeof FileText;
  label: string;
  description: string;
}

const documentConfig: Record<string, DocumentConfig> = {
  termsAccepted: {
    icon: FileText,
    label: 'Terms & Conditions',
    description: 'Platform usage terms and legal agreements',
  },
  privacyPolicyAccepted: {
    icon: Shield,
    label: 'Privacy Policy',
    description: 'Data handling and privacy practices',
  },
  riskDisclosureAccepted: {
    icon: AlertCircle,
    label: 'Risk Disclosure',
    description: 'Trading risks and liability acknowledgment',
  },
  suitabilityAcknowledged: {
    icon: Scale,
    label: 'Suitability Acknowledgement',
    description: 'Investment suitability confirmation',
  },
};

// Timeline event type
interface TimelineEvent {
  id: string;
  event: string;
  date: string | null;
  status: 'completed' | 'pending' | 'not_started';
  reference: string;
  icon: typeof CheckCircle;
}

export default function DashboardCompliance() {
  const { toast } = useToast();

  // State
  const [compliance, setCompliance] = useState<ComplianceDeclarations>(
    getComplianceDeclarations()
  );
  const [verification, setVerification] = useState<VerificationStatus>(
    getVerificationStatus()
  );
  const [referenceId, setReferenceId] = useState<string | null>(
    getRegistrationReferenceId()
  );
  const [submittedAt, setSubmittedAt] = useState<string | null>(
    getRegistrationSubmittedAt()
  );

  // Dialog states
  const [viewDocDialog, setViewDocDialog] = useState<{
    open: boolean;
    docType: string | null;
  }>({
    open: false,
    docType: null,
  });

  // Refresh data on mount
  useEffect(() => {
    setCompliance(getComplianceDeclarations());
    setVerification(getVerificationStatus());
    setReferenceId(getRegistrationReferenceId());
    setSubmittedAt(getRegistrationSubmittedAt());
  }, []);

  // Calculate overall compliance status
  const isFullyCompliant =
    compliance.termsAccepted.accepted &&
    compliance.privacyPolicyAccepted.accepted &&
    compliance.riskDisclosureAccepted.accepted &&
    compliance.suitabilityAcknowledged.accepted;

  // Build timeline events - uses deterministic references based on stable inputs
  const buildTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Registration Submitted
    if (submittedAt) {
      events.push({
        id: 'reg-submitted',
        event: 'Registration Submitted',
        date: submittedAt,
        status: 'completed',
        reference: referenceId || 'N/A',
        icon: Archive,
      });
    }

    // Email Verified - deterministic reference based on email verification status and timestamp
    if (verification.emailVerification === 'verified') {
      const emailTimestamp =
        compliance.termsAccepted.timestamp || submittedAt || 'pending';
      events.push({
        id: 'email-verified',
        event: 'Email Verified',
        date: compliance.termsAccepted.timestamp || submittedAt,
        status: 'completed',
        reference: `EVT-${emailTimestamp.slice(0, 8).toUpperCase()}`,
        icon: Mail,
      });
    }

    // Identity Documents - deterministic reference based on referenceId and verification status
    const idvStatus =
      verification.identityVerification === 'verified' ? 'VERIFIED' : 'PENDING';
    events.push({
      id: 'identity-docs',
      event: 'Identity Documents Uploaded',
      date:
        verification.identityVerification === 'verified' ? submittedAt : null,
      status:
        verification.identityVerification === 'verified'
          ? 'completed'
          : 'pending',
      reference: `DOC-${(referenceId || 'REF000').slice(-6)}-${idvStatus.slice(0, 3)}`,
      icon: Upload,
    });

    // Declarations Accepted - deterministic reference based on timestamp
    if (compliance.termsAccepted.accepted) {
      const declTimestamp =
        compliance.termsAccepted.timestamp || submittedAt || 'pending';
      events.push({
        id: 'declarations',
        event: 'Declaration Accepted',
        date: compliance.termsAccepted.timestamp,
        status: 'completed',
        reference: `DEC-${declTimestamp.slice(0, 8).toUpperCase()}`,
        icon: FileText,
      });
    }

    // Account Activated - deterministic reference based on referenceId and review status
    if (verification.accountReviewStatus === 'approved') {
      events.push({
        id: 'account-activated',
        event: 'Account Activated',
        date: submittedAt,
        status: 'completed',
        reference: `ACT-${(referenceId || 'REF000').slice(-8).toUpperCase()}`,
        icon: Activity,
      });
    }

    return events;
  };

  // Memoize timeline events to ensure stable references across renders
  const timelineEvents = useMemo(
    () => buildTimelineEvents(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      submittedAt,
      referenceId,
      verification.emailVerification,
      verification.identityVerification,
      verification.accountReviewStatus,
      compliance.termsAccepted.accepted,
      compliance.termsAccepted.timestamp,
    ]
  );

  // Handlers
  const handleViewDocument = (docType: string) => {
    setViewDocDialog({ open: true, docType });
  };

  // PLACEHOLDER: Download functionality not yet implemented.
  // This handler currently only shows a toast notification.
  // TODO: Implement actual download logic when backend file service is available.
  const handleDownloadRecord = (_type: string) => {
    toast({
      title: 'Download Started',
      description: `${_type} is being prepared for download.`,
    });
  };

  const getDocumentContent = (docType: string | null) => {
    switch (docType) {
      case 'termsAccepted':
        return {
          title: 'Terms & Conditions',
          content: `
TERMS AND CONDITIONS OF USE

1. ACCEPTANCE OF TERMS
By accessing and using the ProTraderSim platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

2. SIMULATION PLATFORM DISCLAIMER
ProTraderSim is a trading simulation platform. All trading activities on this platform use virtual funds only. No real money is involved in any transactions.

3. USER ELIGIBILITY
You must be at least 18 years of age to use this platform. By using ProTraderSim, you represent and warrant that you meet this requirement.

4. INTELLECTUAL PROPERTY
All content, features, and functionality on the platform are owned by ProTraderSim and are protected by international copyright, trademark, and other intellectual property laws.

5. LIMITATION OF LIABILITY
ProTraderSim shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.

6. GOVERNING LAW
These terms shall be governed by and construed in accordance with applicable laws.
          `,
        };
      case 'privacyPolicyAccepted':
        return {
          title: 'Privacy Policy',
          content: `
PRIVACY POLICY

1. INFORMATION COLLECTION
We collect personal information that you provide directly to us, including name, email address, phone number, and trading preferences.

2. USE OF INFORMATION
We use the information we collect to:
- Provide and maintain our services
- Process and complete transactions
- Send you technical notices and support messages
- Improve our platform and user experience

3. DATA SECURITY
We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.

4. DATA RETENTION
We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy.

5. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.

6. COOKIES
We use cookies to enhance your experience on our platform.
          `,
        };
      case 'riskDisclosureAccepted':
        return {
          title: 'Risk Disclosure Statement',
          content: `
RISK DISCLOSURE STATEMENT

IMPORTANT: PLEASE READ CAREFULLY

1. NATURE OF TRADING
Trading foreign exchange, CFDs, and other financial instruments carries a high level of risk and may not be suitable for all investors.

2. LEVERAGE RISK
Trading with leverage can result in large losses as well as gains. You could lose more than your initial investment.

3. MARKET RISK
Financial markets are volatile and unpredictable. Past performance is not indicative of future results.

4. SIMULATION DISCLAIMER
While this platform simulates real market conditions, actual trading may differ due to slippage, execution delays, and other factors.

5. NO GUARANTEES
There are no guarantees of profit in trading. You should only trade with funds you can afford to lose.

6. SEEK PROFESSIONAL ADVICE
We recommend seeking advice from an independent financial advisor before making any investment decisions.
          `,
        };
      case 'suitabilityAcknowledged':
        return {
          title: 'Suitability Acknowledgement',
          content: `
SUITABILITY ACKNOWLEDGEMENT

1. INVESTMENT OBJECTIVES
I confirm that I have assessed my investment objectives and risk tolerance before using this platform.

2. FINANCIAL SITUATION
I confirm that I have sufficient financial resources to engage in trading activities and that such activities are appropriate for my financial situation.

3. EXPERIENCE AND KNOWLEDGE
I confirm that I have the necessary experience and knowledge to understand the risks involved in trading financial instruments.

4. INDEPENDENT DECISION
I confirm that my decision to use this platform is made independently and based on my own judgment.

5. ONGOING ASSESSMENT
I understand that I should regularly reassess my suitability for trading based on changes in my financial situation and objectives.
          `,
        };
      default:
        return { title: '', content: '' };
    }
  };

  return (
    <DashboardShell title="Compliance & Records" activeItem="Compliance">
      <div className="space-y-6">
        {/* Compliance Status Header */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Compliance Records
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review your account declarations and regulatory documents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Overall Status:
              </span>
              {isFullyCompliant ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 text-sm border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Compliant
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 text-sm border-amber-500/30 bg-amber-500/10 text-amber-500"
                >
                  <Clock className="h-4 w-4" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Declarations Summary Card */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Declarations Summary
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(documentConfig).map(([key, config]) => {
                const declaration = compliance[
                  key as keyof ComplianceDeclarations
                ] as {
                  accepted: boolean;
                  timestamp: string | null;
                };
                const Icon = config.icon;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          declaration?.accepted
                            ? 'bg-[#2E8B57]/10 text-[#2E8B57]'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {config.label}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {declaration?.accepted
                            ? `Accepted: ${formatDateTime(declaration.timestamp)}`
                            : 'Not accepted'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(key)}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registration Record Card */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Archive className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Registration Record
              </h3>
            </div>

            <div className="space-y-4">
              {/* Registration Submitted */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Registration Submitted
                  </span>
                </div>
                <span className="text-sm font-mono text-foreground">
                  {formatDateTime(submittedAt)}
                </span>
              </div>

              {/* Reference ID */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Reference ID
                  </span>
                </div>
                <code className="text-sm font-mono px-2 py-1 rounded bg-muted/50 text-foreground">
                  {referenceId || '—'}
                </code>
              </div>

              {/* Application Status */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Application Status
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    verification.accountReviewStatus === 'approved'
                      ? 'border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]'
                      : verification.accountReviewStatus === 'in_review'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {verification.accountReviewStatus === 'approved'
                    ? 'Approved'
                    : verification.accountReviewStatus === 'in_review'
                      ? 'In Review'
                      : 'Pending'}
                </Badge>
              </div>

              {/* Review Date */}
              {verification.accountReviewStatus === 'approved' && (
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Review Date
                    </span>
                  </div>
                  <span className="text-sm font-mono text-foreground">
                    {formatDate(submittedAt)}
                  </span>
                </div>
              )}

              {/* Download Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownloadRecord('Application Summary')
                      }
                      className="w-full gap-2 mt-2"
                      disabled
                    >
                      <Download className="h-4 w-4" />
                      Download Application Summary
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download feature coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Document History Section */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Document History
            </h3>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Event
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Reference
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timelineEvents.map((event) => (
                  <TableRow key={event.id} className="border-border/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <event.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {event.event}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">
                        {formatDateTime(event.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          event.status === 'completed'
                            ? 'border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]'
                            : event.status === 'pending'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                              : 'border-muted text-muted-foreground'
                        }`}
                      >
                        {event.status === 'completed'
                          ? 'Completed'
                          : event.status === 'pending'
                            ? 'Pending'
                            : 'Not Started'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                        {event.reference}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {timelineEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <event.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {event.event}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      event.status === 'completed'
                        ? 'border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]'
                        : event.status === 'pending'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                          : 'border-muted text-muted-foreground'
                    }`}
                  >
                    {event.status === 'completed'
                      ? 'Completed'
                      : event.status === 'pending'
                        ? 'Pending'
                        : 'Not Started'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-mono text-foreground mt-0.5">
                      {formatDateTime(event.date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reference:</span>
                    <p className="font-mono text-foreground mt-0.5">
                      {event.reference}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Disclosures Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Regulatory Disclosures
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* CFD Trading Risk Warning */}
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-500 mb-1">
                    CFD Trading Risk Warning
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CFDs are complex instruments and come with a high risk of
                    losing money rapidly due to leverage. You should consider
                    whether you understand how CFDs work and whether you can
                    afford to take the high risk of losing your money.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulation Disclaimer */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-primary mb-1">
                    Simulation Disclaimer
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This is a simulation platform designed for educational
                    purposes. All trading activity uses virtual funds only. No
                    real money is involved, and no actual financial instruments
                    are traded. Performance in simulation does not guarantee
                    real-world results.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Protection Notice */}
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-500 mb-1">
                    Data Protection Notice
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your personal data is processed in accordance with
                    applicable data protection laws. We implement appropriate
                    security measures to protect your information. You have the
                    right to access, rectify, or delete your personal data.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional vs Retail Classification */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    Client Classification
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You are currently classified as a{' '}
                    <strong>Retail Client</strong>. This classification provides
                    you with the highest level of regulatory protection.
                    Professional client status may be available upon request for
                    qualified investors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Compliance Footer */}
          <div className="mt-5 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              All declarations and acknowledgements are stored securely for
              regulatory compliance purposes. Reference IDs are provided for
              audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog
        open={viewDocDialog.open}
        onOpenChange={(open) => setViewDocDialog({ open, docType: null })}
      >
        <DialogContent className="glass-card border-border/50 sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              {getDocumentContent(viewDocDialog.docType).title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Document version as accepted on{' '}
              {formatDateTime(
                viewDocDialog.docType
                  ? (
                      compliance[
                        viewDocDialog.docType as keyof ComplianceDeclarations
                      ] as { timestamp: string | null }
                    )?.timestamp
                  : null
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {getDocumentContent(viewDocDialog.docType).content}
            </pre>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewDocDialog({ open: false, docType: null })}
            >
              Close
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleDownloadRecord(
                        getDocumentContent(viewDocDialog.docType).title
                      )
                    }
                    className="gap-2 gold-gradient text-primary-foreground"
                    disabled
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download feature coming soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
