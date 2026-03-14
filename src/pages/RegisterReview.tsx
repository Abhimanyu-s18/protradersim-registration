import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { loadRegistration } from '@/lib/registration-store';
import { ArrowLeft } from 'lucide-react';

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-foreground text-right break-words">
      {value || '—'}
    </span>
  </div>
);

const RegisterReview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReturnType<typeof loadRegistration>>(null);

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.completed) {
      navigate('/register');
      return;
    }
    setData(saved);
  }, [navigate]);

  if (!data) return null;
  const { step1, step2, step3, step4 } = data;

  const sections = [
    {
      title: 'Personal Details',
      rows: [
        { label: 'Name', value: `${step1.firstName} ${step1.lastName}` },
        { label: 'Email', value: step1.email },
        { label: 'Phone', value: step1.phone || 'Not provided' },
        { label: 'Date of Birth', value: step1.dateOfBirth },
        { label: 'Country', value: step1.country },
        ...(step1.ibCode ? [{ label: 'IB Code', value: step1.ibCode }] : []),
      ],
    },
    step2 && {
      title: 'Address Details',
      rows: [
        {
          label: 'Address',
          value: [step2.addressLine1, step2.addressLine2]
            .filter(Boolean)
            .join(', '),
        },
        { label: 'City', value: step2.city },
        { label: 'State / Region', value: step2.state },
        { label: 'Postal Code', value: step2.postalCode },
        { label: 'Country', value: step2.country },
      ],
    },
    step3 && {
      title: 'Trading Profile',
      rows: [
        { label: 'Employment', value: step3.employmentStatus },
        { label: 'Annual Income', value: step3.annualIncome },
        { label: 'Source of Funds', value: step3.sourceOfFunds },
        { label: 'Experience', value: step3.experienceLevel },
        {
          label: 'Products Traded',
          value: (step3.tradedProducts || []).join(', '),
        },
        { label: 'Trades (12 months)', value: step3.tradesLast12Months },
      ],
    },
  ].filter(Boolean) as {
    title: string;
    rows: { label: string; value: string }[];
  }[];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16 max-w-2xl">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Submitted Registration
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Reference:{' '}
            <span className="font-mono text-primary">
              {step4?.referenceId || '—'}
            </span>
          </p>

          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-lg border border-border/60 bg-muted/20 p-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {section.title}
                </h3>
                <div className="divide-y divide-border/30">
                  {section.rows.map((row) => (
                    <SummaryRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="gold-outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/register/success')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Confirmation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterReview;
