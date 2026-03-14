import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import ProgressStepper from '@/components/ProgressStepper';
import {
  loadRegistration,
  saveStep3,
  type Step3Data,
} from '@/lib/registration-store';
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  AlertTriangle,
  BookOpen,
  Shield,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const EMPLOYMENT_OPTIONS = [
  'Employed',
  'Self-Employed',
  'Student',
  'Unemployed',
  'Retired',
];
const INCOME_OPTIONS = [
  'Under $10,000',
  '$10,000 – $25,000',
  '$25,001 – $50,000',
  '$50,001 – $100,000',
  'Above $100,000',
];
const SOURCE_OPTIONS = [
  'Salary',
  'Business Income',
  'Savings',
  'Investments',
  'Family Support',
  'Other',
];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const PRODUCT_OPTIONS = [
  'Forex',
  'Commodities',
  'Indices',
  'Stocks',
  'Crypto',
  'CFDs',
  'None',
];
const TRADES_OPTIONS = ['0', '1–10', '11–50', '51–100', '100+'];

const ACKNOWLEDGMENTS = [
  {
    id: 'leverage',
    label:
      'I understand leveraged products can magnify both profits and losses',
  },
  { id: 'highrisk', label: 'I understand CFD trading is high risk' },
  {
    id: 'simulated',
    label: 'I understand this platform is for simulated trading',
  },
  { id: 'accurate', label: 'I confirm the information provided is accurate' },
];

const step3Schema = z.object({
  employmentStatus: z.string().min(1, 'Employment status is required'),
  annualIncome: z.string().min(1, 'Annual income is required'),
  sourceOfFunds: z.string().min(1, 'Source of funds is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  tradedProducts: z.array(z.string()).min(1, 'Select at least one option'),
  tradesLast12Months: z.string().min(1, 'This field is required'),
  acknowledgments: z
    .array(z.string())
    .length(4, 'All acknowledgments are required'),
});

// Reusable select dropdown component
const SelectField = ({
  label,
  required,
  value,
  options,
  placeholder,
  error,
  onSelect,
  onBlur,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  placeholder: string;
  error?: string;
  onSelect: (val: string) => void;
  onBlur?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-full h-11 justify-between font-normal bg-muted/50 border-border/60',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
            onBlur={onBlur}
          >
            {value || placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-1 bg-popover border-border"
          align="start"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                value === opt && 'bg-primary/10 text-primary font-medium'
              )}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

const RegisterStep3 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Step3Data>({
    employmentStatus: '',
    annualIncome: '',
    sourceOfFunds: '',
    experienceLevel: '',
    tradedProducts: [],
    tradesLast12Months: '',
    acknowledgments: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Step3Data, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Step3Data, boolean>>
  >({});

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.step2) {
      navigate('/register/step-2');
      return;
    }
    if (saved.step3) {
      setForm(saved.step3);
    }
  }, [navigate]);

  const update = (field: keyof Step3Data, value: string | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) {
      setTimeout(() => validateField(field, value), 0);
    }
  };

  const validateField = (field: keyof Step3Data, value?: string | string[]) => {
    const val = value ?? form[field];
    const partial = { ...form, [field]: val };
    const result = step3Schema.safeParse(partial);
    if (result.success) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    } else {
      const fieldError = result.error.issues.find((i) => i.path[0] === field);
      setErrors((e) => ({ ...e, [field]: fieldError?.message }));
    }
  };

  const handleBlur = (field: keyof Step3Data) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
  };

  const toggleProduct = (product: string) => {
    setForm((f) => {
      let next: string[];
      if (product === 'None') {
        next = f.tradedProducts.includes('None') ? [] : ['None'];
      } else {
        const without = f.tradedProducts.filter((p) => p !== 'None');
        next = without.includes(product)
          ? without.filter((p) => p !== product)
          : [...without, product];
      }
      if (touched.tradedProducts) {
        setTimeout(() => validateField('tradedProducts', next), 0);
      }
      return { ...f, tradedProducts: next };
    });
  };

  const toggleAcknowledgment = (id: string) => {
    setForm((f) => {
      const next = f.acknowledgments.includes(id)
        ? f.acknowledgments.filter((a) => a !== id)
        : [...f.acknowledgments, id];
      if (touched.acknowledgments) {
        setTimeout(() => validateField('acknowledgments', next), 0);
      }
      return { ...f, acknowledgments: next };
    });
  };

  const isValid = useMemo(() => {
    return step3Schema.safeParse(form).success;
  }, [form]);

  // Suitability indicator
  const suitabilityWarning = useMemo(() => {
    if (
      form.experienceLevel === 'Beginner' &&
      form.tradedProducts.length === 1 &&
      form.tradedProducts[0] === 'None' &&
      form.tradesLast12Months === '0'
    ) {
      return true;
    }
    return false;
  }, [form.experienceLevel, form.tradedProducts, form.tradesLast12Months]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Partial<Record<keyof Step3Data, boolean>> = {
      employmentStatus: true,
      annualIncome: true,
      sourceOfFunds: true,
      experienceLevel: true,
      tradedProducts: true,
      tradesLast12Months: true,
      acknowledgments: true,
    };
    setTouched(allTouched);
    const result = step3Schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Step3Data, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof Step3Data;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    saveStep3(form);
    setLoading(false);
    navigate('/register/step-4');
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <ProgressStepper currentStep={3} />

            <div className="mt-8 mb-6">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Trading Profile
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Step 3 of 4 — Experience and Suitability
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employment Status */}
              <SelectField
                label="Employment Status"
                required
                value={form.employmentStatus}
                options={EMPLOYMENT_OPTIONS}
                placeholder="Select employment status"
                error={
                  touched.employmentStatus ? errors.employmentStatus : undefined
                }
                onSelect={(v) => update('employmentStatus', v)}
                onBlur={() => handleBlur('employmentStatus')}
              />

              {/* Annual Income */}
              <SelectField
                label="Annual Income Range"
                required
                value={form.annualIncome}
                options={INCOME_OPTIONS}
                placeholder="Select income range"
                error={touched.annualIncome ? errors.annualIncome : undefined}
                onSelect={(v) => update('annualIncome', v)}
                onBlur={() => handleBlur('annualIncome')}
              />

              {/* Source of Funds */}
              <SelectField
                label="Source of Funds"
                required
                value={form.sourceOfFunds}
                options={SOURCE_OPTIONS}
                placeholder="Select source of funds"
                error={touched.sourceOfFunds ? errors.sourceOfFunds : undefined}
                onSelect={(v) => update('sourceOfFunds', v)}
                onBlur={() => handleBlur('sourceOfFunds')}
              />

              {/* Experience Level */}
              <SelectField
                label="Trading Experience Level"
                required
                value={form.experienceLevel}
                options={EXPERIENCE_OPTIONS}
                placeholder="Select experience level"
                error={
                  touched.experienceLevel ? errors.experienceLevel : undefined
                }
                onSelect={(v) => update('experienceLevel', v)}
                onBlur={() => handleBlur('experienceLevel')}
              />

              {/* Products traded - multi-select checkboxes */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">
                  Have you traded any of the following before?{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRODUCT_OPTIONS.map((product) => (
                    <label
                      key={product}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                        form.tradedProducts.includes(product)
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/60 bg-muted/30 hover:border-border'
                      )}
                    >
                      <Checkbox
                        checked={form.tradedProducts.includes(product)}
                        onCheckedChange={() => {
                          toggleProduct(product);
                          if (!touched.tradedProducts)
                            setTouched((t) => ({ ...t, tradedProducts: true }));
                        }}
                      />
                      <span className="text-sm text-foreground">{product}</span>
                    </label>
                  ))}
                </div>
                {touched.tradedProducts && errors.tradedProducts && (
                  <p className="text-xs text-destructive">
                    {errors.tradedProducts}
                  </p>
                )}
              </div>

              {/* Trades in last 12 months */}
              <SelectField
                label="Trades placed in the last 12 months"
                required
                value={form.tradesLast12Months}
                options={TRADES_OPTIONS}
                placeholder="Select range"
                error={
                  touched.tradesLast12Months
                    ? errors.tradesLast12Months
                    : undefined
                }
                onSelect={(v) => update('tradesLast12Months', v)}
                onBlur={() => handleBlur('tradesLast12Months')}
              />

              {/* Suitability warning */}
              {suitabilityWarning && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
                  <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Your profile suggests limited prior trading experience. You
                    may be asked to complete additional education or risk
                    acknowledgment steps.
                  </p>
                </div>
              )}

              {/* Knowledge acknowledgments */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">
                  Risk Awareness & Declarations{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {ACKNOWLEDGMENTS.map((ack) => (
                    <label
                      key={ack.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
                        form.acknowledgments.includes(ack.id)
                          ? 'border-success/40 bg-success/5'
                          : 'border-border/60 bg-muted/30 hover:border-border'
                      )}
                    >
                      <Checkbox
                        checked={form.acknowledgments.includes(ack.id)}
                        onCheckedChange={() => {
                          toggleAcknowledgment(ack.id);
                          if (!touched.acknowledgments)
                            setTouched((t) => ({
                              ...t,
                              acknowledgments: true,
                            }));
                        }}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-foreground leading-relaxed">
                        {ack.label}
                      </span>
                    </label>
                  ))}
                </div>
                {touched.acknowledgments && errors.acknowledgments && (
                  <p className="text-xs text-destructive">
                    {errors.acknowledgments}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    'Continue to Review & Verification'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="gold-outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    saveStep3(form);
                    navigate('/register/step-2');
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Address Details
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Why We Ask
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: BookOpen,
                    label: 'Tailored Experience',
                    desc: 'We calibrate your simulation based on your profile',
                  },
                  {
                    icon: Scale,
                    label: 'Suitability Assessment',
                    desc: 'Ensures the platform matches your knowledge level',
                  },
                  {
                    icon: Shield,
                    label: 'Regulatory Alignment',
                    desc: 'Mirrors real broker KYC standards for realism',
                  },
                  {
                    icon: AlertTriangle,
                    label: 'Risk Awareness',
                    desc: 'Promotes responsible simulated trading habits',
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/30 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <b.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {b.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Simulation Only:
                  </span>{' '}
                  ProTraderSim does not involve real money or financial risk.
                  Your profile data helps create a realistic educational
                  experience.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sidebar */}
        <div className="mt-10 lg:hidden">
          <div className="space-y-3">
            {[
              {
                icon: BookOpen,
                label: 'Tailored Experience',
                desc: 'We calibrate your simulation based on your profile',
              },
              {
                icon: Shield,
                label: 'Regulatory Alignment',
                desc: 'Mirrors real broker KYC standards for realism',
              },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/30 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <b.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterStep3;
