import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardShell from '@/components/DashboardShell';
import { useToast } from '@/hooks/use-toast';
import {
  getPersonalDetails,
  setPersonalDetails,
  getAddressDetails,
  setAddressDetails,
  getTradingProfile,
  setTradingProfile,
  getRegistrationReferenceId,
  getVerificationStatus,
  PersonalDetails,
  AddressDetails,
  TradingProfile,
  ExperienceLevel,
  TradingStyle,
  RiskTolerance,
} from '@/lib/account-store';
import {
  User,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Edit2,
  X,
  Save,
} from 'lucide-react';

// Helper functions for display formatting
const formatExperienceLevel = (level: ExperienceLevel): string => {
  const map: Record<ExperienceLevel, string> = {
    none: 'No Experience',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    professional: 'Professional',
  };
  return map[level] || level;
};

const formatTradingStyle = (style: TradingStyle): string => {
  const map: Record<TradingStyle, string> = {
    scalping: 'Scalping',
    day_trading: 'Day Trading',
    swing_trading: 'Swing Trading',
    position_trading: 'Position Trading',
    algorithmic: 'Algorithmic',
  };
  return map[style] || style;
};

const formatRiskTolerance = (tolerance: RiskTolerance): string => {
  const map: Record<RiskTolerance, string> = {
    conservative: 'Conservative',
    moderate: 'Moderate',
    aggressive: 'Aggressive',
    speculative: 'Speculative',
  };
  return map[tolerance] || tolerance;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function DashboardProfile() {
  const { toast } = useToast();

  // Personal Details State
  const [personalDetails, setPersonalDetailsState] =
    useState<PersonalDetails>(getPersonalDetails());
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] =
    useState<PersonalDetails>(personalDetails);

  // Address Details State
  const [addressDetails, setAddressDetailsState] =
    useState<AddressDetails>(getAddressDetails());
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] =
    useState<AddressDetails>(addressDetails);

  // Trading Profile State
  const [tradingProfile, setTradingProfileState] =
    useState<TradingProfile>(getTradingProfile());
  const [isEditingTrading, setIsEditingTrading] = useState(false);
  const [tradingForm, setTradingForm] =
    useState<TradingProfile>(tradingProfile);

  // Account Status
  const [referenceId, setReferenceId] = useState<string | null>(
    getRegistrationReferenceId()
  );
  const [verification, setVerification] = useState(getVerificationStatus());

  // Refresh data on mount
  useEffect(() => {
    setPersonalDetailsState(getPersonalDetails());
    setAddressDetailsState(getAddressDetails());
    setTradingProfileState(getTradingProfile());
    setReferenceId(getRegistrationReferenceId());
    setVerification(getVerificationStatus());
  }, []);

  // Personal Details Handlers
  const handleEditPersonal = () => {
    setPersonalForm(personalDetails);
    setIsEditingPersonal(true);
  };

  const handleSavePersonal = () => {
    const updated = setPersonalDetails(personalForm);
    setPersonalDetailsState(updated);
    setIsEditingPersonal(false);
    toast({
      title: 'Profile Updated',
      description: 'Your personal details have been saved successfully.',
    });
  };

  const handleCancelPersonal = () => {
    setPersonalForm(personalDetails);
    setIsEditingPersonal(false);
  };

  // Address Details Handlers
  const handleEditAddress = () => {
    setAddressForm(addressDetails);
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    const updated = setAddressDetails(addressForm);
    setAddressDetailsState(updated);
    setIsEditingAddress(false);
    toast({
      title: 'Address Updated',
      description: 'Your address details have been saved successfully.',
    });
  };

  const handleCancelAddress = () => {
    setAddressForm(addressDetails);
    setIsEditingAddress(false);
  };

  // Trading Profile Handlers
  const handleEditTrading = () => {
    setTradingForm(tradingProfile);
    setIsEditingTrading(true);
  };

  const handleSaveTrading = () => {
    const updated = setTradingProfile(tradingForm);
    setTradingProfileState(updated);
    setIsEditingTrading(false);
    toast({
      title: 'Trading Profile Updated',
      description: 'Your trading preferences have been saved successfully.',
    });
  };

  const handleCancelTrading = () => {
    setTradingForm(tradingProfile);
    setIsEditingTrading(false);
  };

  // Field component for read-only display
  const Field = ({
    label,
    value,
  }: {
    label: string;
    value: string | React.ReactNode;
  }) => (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm text-foreground">{value || '—'}</p>
    </div>
  );

  return (
    <DashboardShell title="Profile" activeItem="Profile">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Details Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Personal Details
              </h3>
            </div>
            {!isEditingPersonal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditPersonal}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          {isEditingPersonal ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={personalForm.firstName}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={personalForm.lastName}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={personalForm.email}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSavePersonal}
                  className="gap-1.5 gold-gradient text-primary-foreground"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelPersonal}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" value={personalDetails.firstName} />
              <Field label="Last Name" value={personalDetails.lastName} />
              <Field label="Email Address" value={personalDetails.email} />
              <Field label="Phone Number" value={personalDetails.phone} />
              <Field
                label="Date of Birth"
                value={formatDate(personalDetails.dateOfBirth)}
              />
            </div>
          )}
        </div>

        {/* Address Details Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Address Details
              </h3>
            </div>
            {!isEditingAddress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditAddress}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          {isEditingAddress ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="addressLine1"
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressLine1: e.target.value,
                    })
                  }
                  placeholder="Enter street address"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="addressLine2"
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressLine2: e.target.value,
                    })
                  }
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="postalCode"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        postalCode: e.target.value,
                      })
                    }
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        country: e.target.value,
                      })
                    }
                    placeholder="Enter country"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSaveAddress}
                  className="gap-1.5 gold-gradient text-primary-foreground"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelAddress}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Address Line 1"
                  value={addressDetails.addressLine1}
                />
                <Field
                  label="Address Line 2"
                  value={addressDetails.addressLine2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" value={addressDetails.city} />
                <Field label="State / Province" value={addressDetails.state} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Postal Code" value={addressDetails.postalCode} />
                <Field label="Country" value={addressDetails.country} />
              </div>
            </div>
          )}
        </div>

        {/* Trading Profile Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Trading Profile
              </h3>
            </div>
            {!isEditingTrading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditTrading}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          {isEditingTrading ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-semibold">
                    Experience Level
                  </Label>
                  <Select
                    value={tradingForm.experienceLevel}
                    onValueChange={(value: ExperienceLevel) =>
                      setTradingForm({ ...tradingForm, experienceLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Experience</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-semibold">
                    Trading Style
                  </Label>
                  <Select
                    value={tradingForm.tradingStyle}
                    onValueChange={(value: TradingStyle) =>
                      setTradingForm({ ...tradingForm, tradingStyle: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scalping">Scalping</SelectItem>
                      <SelectItem value="day_trading">Day Trading</SelectItem>
                      <SelectItem value="swing_trading">
                        Swing Trading
                      </SelectItem>
                      <SelectItem value="position_trading">
                        Position Trading
                      </SelectItem>
                      <SelectItem value="algorithmic">Algorithmic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-semibold">
                    Risk Tolerance
                  </Label>
                  <Select
                    value={tradingForm.riskTolerance}
                    onValueChange={(value: RiskTolerance) =>
                      setTradingForm({ ...tradingForm, riskTolerance: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="speculative">Speculative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="annualIncome"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Annual Income Range
                  </Label>
                  <Input
                    id="annualIncome"
                    value={tradingForm.annualIncome}
                    onChange={(e) =>
                      setTradingForm({
                        ...tradingForm,
                        annualIncome: e.target.value,
                      })
                    }
                    placeholder="e.g., $50,000 - $100,000"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="netWorth"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Net Worth
                  </Label>
                  <Input
                    id="netWorth"
                    value={tradingForm.netWorth}
                    onChange={(e) =>
                      setTradingForm({
                        ...tradingForm,
                        netWorth: e.target.value,
                      })
                    }
                    placeholder="e.g., $100,000 - $500,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="investmentObjectives"
                    className="text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Investment Objectives
                  </Label>
                  <Input
                    id="investmentObjectives"
                    value={tradingForm.investmentObjectives.join(', ')}
                    onChange={(e) =>
                      setTradingForm({
                        ...tradingForm,
                        investmentObjectives: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Growth, Income, Capital Preservation"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSaveTrading}
                  className="gap-1.5 gold-gradient text-primary-foreground"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelTrading}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Experience Level
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {formatExperienceLevel(tradingProfile.experienceLevel)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Trading Style
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {formatTradingStyle(tradingProfile.tradingStyle)}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Risk Tolerance
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      tradingProfile.riskTolerance === 'conservative'
                        ? 'bg-green-500/10 text-green-500'
                        : tradingProfile.riskTolerance === 'aggressive' ||
                            tradingProfile.riskTolerance === 'speculative'
                          ? 'bg-destructive/10 text-destructive'
                          : ''
                    }`}
                  >
                    {formatRiskTolerance(tradingProfile.riskTolerance)}
                  </Badge>
                </div>
                <Field
                  label="Annual Income Range"
                  value={tradingProfile.annualIncome}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Net Worth" value={tradingProfile.netWorth} />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Investment Objectives
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tradingProfile.investmentObjectives.length > 0 ? (
                      tradingProfile.investmentObjectives.map((obj, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Status Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Account Status
            </h3>
          </div>

          <div className="space-y-4">
            {/* Registration Reference ID */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Registration Reference ID
              </p>
              <code className="inline-block px-3 py-1.5 rounded bg-muted/50 text-sm font-mono text-foreground">
                {referenceId || '—'}
              </code>
            </div>

            {/* Account Badges */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Account Status
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Registered Badge */}
                <Badge
                  variant={
                    personalDetails.firstName && personalDetails.lastName
                      ? 'default'
                      : 'secondary'
                  }
                  className={`gap-1 ${
                    personalDetails.firstName && personalDetails.lastName
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : ''
                  }`}
                >
                  {personalDetails.firstName && personalDetails.lastName ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  Registered
                </Badge>

                {/* Email Verification Badge */}
                <Badge
                  variant={
                    verification.emailVerification === 'verified'
                      ? 'default'
                      : 'secondary'
                  }
                  className={`gap-1 ${
                    verification.emailVerification === 'verified'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : verification.emailVerification === 'sent'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : ''
                  }`}
                >
                  {verification.emailVerification === 'verified' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : verification.emailVerification === 'sent' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  Email{' '}
                  {verification.emailVerification === 'verified'
                    ? 'Verified'
                    : 'Pending'}
                </Badge>

                {/* Account Review Badge */}
                {verification.accountReviewStatus !== 'approved' && (
                  <Badge
                    variant="secondary"
                    className={`gap-1 ${
                      verification.accountReviewStatus === 'in_review'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : ''
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    Pending Review
                  </Badge>
                )}

                {/* Active Badge */}
                {verification.accountReviewStatus === 'approved' && (
                  <Badge
                    variant="default"
                    className="gap-1 bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                )}

                {/* Challenge Active Badge */}
                {verification.suitabilityCompleted && (
                  <Badge
                    variant="default"
                    className="gap-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <Trophy className="h-3 w-3" />
                    Challenge Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Your account is in simulation mode. All trading activity is
                virtual and does not involve real funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
