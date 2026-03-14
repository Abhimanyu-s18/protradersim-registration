import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import ProgressStepper from '@/components/ProgressStepper';
import BenefitsPanel from '@/components/BenefitsPanel';
import { countries } from '@/lib/countries';
import {
  saveStep1,
  loadRegistration,
  type Step1Data,
} from '@/lib/registration-store';
import { CalendarIcon, Loader2, Search, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const step1Schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().email('Please enter a valid email address').max(255),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  country: z.string().min(1, 'Country is required'),
  ibCode: z.string().max(30).optional(),
});

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [dobDate, setDobDate] = useState<Date | undefined>();

  const [form, setForm] = useState<Step1Data>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: '',
    ibCode: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Step1Data, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Step1Data, boolean>>
  >({});

  // Load saved data or URL params
  useEffect(() => {
    const saved = loadRegistration();
    if (saved?.step1) {
      setForm(saved.step1);
      if (saved.step1.dateOfBirth) {
        setDobDate(new Date(saved.step1.dateOfBirth));
      }
    }
    const ib = searchParams.get('ibCode');
    if (ib) setForm((f) => ({ ...f, ibCode: ib }));
  }, [searchParams]);

  const filteredCountries = useMemo(
    () =>
      countries.filter((c) =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
      ),
    [countrySearch]
  );

  const update = (field: keyof Step1Data, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const validateField = (field: keyof Step1Data, value?: string) => {
    const val = value ?? form[field];
    const partial = { ...form, [field]: val };
    const result = step1Schema.safeParse({
      ...partial,
      phone: partial.phone || undefined,
      ibCode: partial.ibCode || undefined,
    });
    if (result.success) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    } else {
      const fieldError = result.error.issues.find((i) => i.path[0] === field);
      setErrors((e) => ({ ...e, [field]: fieldError?.message }));
    }
  };

  const handleBlur = (field: keyof Step1Data) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
  };

  const isValid = useMemo(() => {
    const result = step1Schema.safeParse({
      ...form,
      phone: form.phone || undefined,
      ibCode: form.ibCode || undefined,
    });
    return result.success;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      dateOfBirth: true,
      country: true,
    });
    const result = step1Schema.safeParse({
      ...form,
      phone: form.phone || undefined,
      ibCode: form.ibCode || undefined,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Step1Data, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof Step1Data;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    saveStep1(form);
    setLoading(false);
    navigate('/register/step-2');
  };

  const handleDobSelect = (date: Date | undefined) => {
    setDobDate(date);
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      update('dateOfBirth', formatted);
    }
  };

  const fieldClass = (field: keyof Step1Data) =>
    cn(
      'h-11 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30',
      touched[field] &&
        errors[field] &&
        'border-destructive focus:border-destructive focus:ring-destructive/30'
    );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />

      <Header />

      <main className="relative z-10 container pt-24 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          {/* Form Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <ProgressStepper currentStep={1} />

            <div className="mt-8 mb-6">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Create Your Trading Account
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Step 1 of 4 — Personal Details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="firstName"
                    className="text-sm text-foreground"
                  >
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={fieldClass('firstName')}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm text-foreground">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={fieldClass('lastName')}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={fieldClass('email')}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm text-foreground">
                  Phone Number{' '}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={fieldClass('phone')}
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-11 justify-start text-left font-normal bg-muted/50 border-border/60',
                        !dobDate && 'text-muted-foreground',
                        touched.dateOfBirth &&
                          errors.dateOfBirth &&
                          'border-destructive'
                      )}
                      onBlur={() => handleBlur('dateOfBirth')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dobDate
                        ? format(dobDate, 'PPP')
                        : 'Select your date of birth'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={handleDobSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1930}
                      toYear={new Date().getFullYear() - 16}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p className="text-xs text-destructive">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">
                  Country of Residence{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full h-11 justify-between font-normal bg-muted/50 border-border/60',
                        !form.country && 'text-muted-foreground',
                        touched.country &&
                          errors.country &&
                          'border-destructive'
                      )}
                      onBlur={() => handleBlur('country')}
                    >
                      {form.country || 'Select your country'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border"
                    align="start"
                  >
                    <div className="flex items-center border-b border-border px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        className="flex h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredCountries.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No country found.
                        </p>
                      )}
                      {filteredCountries.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={cn(
                            'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                            form.country === c &&
                              'bg-primary/10 text-primary font-medium'
                          )}
                          onClick={() => {
                            update('country', c);
                            setCountryOpen(false);
                            setCountrySearch('');
                            handleBlur('country');
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {touched.country && errors.country && (
                  <p className="text-xs text-destructive">{errors.country}</p>
                )}
              </div>

              {/* IB Referral Code */}
              <div className="space-y-1.5">
                <Label htmlFor="ibCode" className="text-sm text-foreground">
                  IB Referral Code{' '}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ibCode"
                  placeholder="e.g. IB-2024-XYZ"
                  value={form.ibCode}
                  onChange={(e) => update('ibCode', e.target.value)}
                  className={fieldClass('ibCode')}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-2"
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  'Continue to Address Details'
                )}
              </Button>

              {/* Sign in link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>

              {/* Trust note */}
              <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 p-3">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account remains inactive until email verification is
                  completed. We never share your data with third parties.
                </p>
              </div>
            </form>
          </div>

          {/* Benefits sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BenefitsPanel />
              <div className="mt-6 rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Risk Notice:
                  </span>{' '}
                  ProTraderSim is a simulation platform for educational
                  purposes. No real money is at risk. Past simulated performance
                  does not guarantee future results.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile benefits */}
        <div className="mt-10 lg:hidden">
          <BenefitsPanel />
        </div>
      </main>
    </div>
  );
};

export default RegisterStep1;
