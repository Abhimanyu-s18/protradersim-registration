import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import ProgressStepper from '@/components/ProgressStepper';
import BenefitsPanel from '@/components/BenefitsPanel';
import { countries } from '@/lib/countries';
import {
  loadRegistration,
  saveStep2,
  type Step2Data,
} from '@/lib/registration-store';
import { ArrowLeft, Loader2, Search, ChevronDown, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const step2Schema = z.object({
  addressLine1: z.string().trim().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State / Province is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required'),
});

const RegisterStep2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);

  const [form, setForm] = useState<Step2Data>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Step2Data, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Step2Data, boolean>>
  >({});

  useEffect(() => {
    const saved = loadRegistration();
    if (!saved?.step1) {
      navigate('/register');
      return;
    }
    if (saved.step2) {
      setForm(saved.step2);
    } else {
      // Default country from Step 1
      setForm((f) => ({ ...f, country: saved.step1.country || '' }));
    }
  }, [navigate]);

  const filteredCountries = useMemo(
    () =>
      countries.filter((c) =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
      ),
    [countrySearch]
  );

  const update = (field: keyof Step2Data, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const validateField = (field: keyof Step2Data, value?: string) => {
    const val = value ?? form[field];
    const partial = { ...form, [field]: val };
    const result = step2Schema.safeParse({
      ...partial,
      addressLine2: partial.addressLine2 || undefined,
    });
    if (result.success) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    } else {
      const fieldError = result.error.issues.find((i) => i.path[0] === field);
      setErrors((e) => ({ ...e, [field]: fieldError?.message }));
    }
  };

  const handleBlur = (field: keyof Step2Data) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
  };

  const isValid = useMemo(() => {
    const result = step2Schema.safeParse({
      ...form,
      addressLine2: form.addressLine2 || undefined,
    });
    return result.success;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Partial<Record<keyof Step2Data, boolean>> = {
      addressLine1: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    };
    setTouched(allTouched);
    const result = step2Schema.safeParse({
      ...form,
      addressLine2: form.addressLine2 || undefined,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Step2Data, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof Step2Data;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    saveStep2(form);
    setLoading(false);
    navigate('/register/step-3');
  };

  const fieldClass = (field: keyof Step2Data) =>
    cn(
      'h-11 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30',
      touched[field] &&
        errors[field] &&
        'border-destructive focus:border-destructive focus:ring-destructive/30'
    );

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
      <Header />

      <main className="relative z-10 container pt-24 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <ProgressStepper currentStep={2} />

            <div className="mt-8 mb-6">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Address Information
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Step 2 of 4 — Residential Address
              </p>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="addressLine1"
                  className="text-sm text-foreground"
                >
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addressLine1"
                  placeholder="Street address, P.O. box"
                  value={form.addressLine1}
                  onChange={(e) => update('addressLine1', e.target.value)}
                  onBlur={() => handleBlur('addressLine1')}
                  className={fieldClass('addressLine1')}
                />
                {touched.addressLine1 && errors.addressLine1 && (
                  <p className="text-xs text-destructive">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="addressLine2"
                  className="text-sm text-foreground"
                >
                  Address Line 2{' '}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="addressLine2"
                  placeholder="Apartment, suite, unit, building, floor"
                  value={form.addressLine2}
                  onChange={(e) => update('addressLine2', e.target.value)}
                  className={fieldClass('addressLine2')}
                />
              </div>

              {/* City + State */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm text-foreground">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    className={fieldClass('city')}
                  />
                  {touched.city && errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-sm text-foreground">
                    State / Province <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="State or province"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    onBlur={() => handleBlur('state')}
                    className={fieldClass('state')}
                  />
                  {touched.state && errors.state && (
                    <p className="text-xs text-destructive">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-sm text-foreground">
                  Postal Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postalCode"
                  placeholder="e.g. 10001"
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
                  onBlur={() => handleBlur('postalCode')}
                  className={cn(fieldClass('postalCode'), 'sm:max-w-[200px]')}
                />
                {touched.postalCode && errors.postalCode && (
                  <p className="text-xs text-destructive">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">
                  Country <span className="text-destructive">*</span>
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
                            setTouched((t) => ({ ...t, country: true }));
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

              {/* Proof of Address placeholder */}
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">
                  Proof of Address
                </Label>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 opacity-60 cursor-not-allowed">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Upload proof of address in a later step
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Utility bill, bank statement, or government letter
                    </p>
                  </div>
                </div>
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
                    'Continue to Trading Profile'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="gold-outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    saveStep2(form);
                    navigate('/register');
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Personal Details
                </Button>
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
                    Secure Setup:
                  </span>{' '}
                  Your address information is encrypted and used solely for
                  account verification purposes. ProTraderSim never shares your
                  personal data.
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

export default RegisterStep2;
