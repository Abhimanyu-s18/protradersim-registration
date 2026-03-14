import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  getAccountSettings,
  setNotificationSettings,
  setPlatformPreferences,
  setTradingPreferences,
  NotificationSettings,
  PlatformPreferences,
  TradingPreferences,
  ThemeMode,
  NumberFormat,
} from '@/lib/account-store';
import {
  Shield,
  Bell,
  Monitor,
  TrendingUp,
  Save,
  Smartphone,
  Globe,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

// Security Settings State
interface SecurityFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
}

// Session mock data
const mockSessions = [
  {
    id: '1',
    device: 'Chrome on macOS',
    location: 'Colombo, Sri Lanka',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Colombo, Sri Lanka',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
];

const mockActivity = [
  {
    id: '1',
    action: 'Successful login',
    location: 'Colombo, Sri Lanka',
    time: 'Today, 10:30 AM',
  },
  {
    id: '2',
    action: 'Password changed',
    location: 'Colombo, Sri Lanka',
    time: 'Yesterday, 3:15 PM',
  },
  {
    id: '3',
    action: 'Successful login',
    location: 'Colombo, Sri Lanka',
    time: 'Mar 12, 9:45 AM',
  },
];

export default function DashboardSettings() {
  const { toast } = useToast();

  // Load initial settings
  const initialSettings = getAccountSettings();

  // Notification State
  const [notifications, setNotifications] = useState<NotificationSettings>(
    initialSettings.notifications
  );

  // Platform Preferences State
  const [platformPrefs, setPlatformPrefs] = useState<PlatformPreferences>(
    initialSettings.platformPreferences
  );

  // Trading Preferences State
  const [tradingPrefs, setTradingPrefs] = useState<TradingPreferences>(
    initialSettings.tradingPreferences
  );

  // Security Form State
  const [securityForm, setSecurityForm] = useState<SecurityFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  // Refresh data on mount
  useEffect(() => {
    const settings = getAccountSettings();
    setNotifications(settings.notifications);
    setPlatformPrefs(settings.platformPreferences);
    setTradingPrefs(settings.tradingPreferences);
  }, []);

  // Save Notification Settings
  const handleSaveNotifications = () => {
    setNotificationSettings(notifications);
    toast({
      title: 'Notifications Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  // Save Platform Preferences
  const handleSavePlatformPrefs = () => {
    setPlatformPreferences(platformPrefs);
    toast({
      title: 'Platform Preferences Saved',
      description: 'Your platform settings have been updated.',
    });
  };

  // Save Trading Preferences
  const handleSaveTradingPrefs = () => {
    setTradingPreferences(tradingPrefs);
    toast({
      title: 'Trading Preferences Saved',
      description: 'Your trading settings have been updated.',
    });
  };

  // Save Security Settings (mock)
  const handleSaveSecurity = () => {
    if (
      securityForm.newPassword &&
      securityForm.newPassword !== securityForm.confirmPassword
    ) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Security Settings Saved',
      description: 'Your security settings have been updated successfully.',
    });
    setSecurityForm({
      ...securityForm,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <DashboardShell title="Settings" activeItem="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Section */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Change Password */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Change Password
                </h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-xs text-muted-foreground"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={
                        securityForm.showCurrentPassword ? 'text' : 'password'
                      }
                      value={securityForm.currentPassword}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSecurityForm({
                          ...securityForm,
                          showCurrentPassword:
                            !securityForm.showCurrentPassword,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {securityForm.showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-xs text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={securityForm.showNewPassword ? 'text' : 'password'}
                      value={securityForm.newPassword}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSecurityForm({
                          ...securityForm,
                          showNewPassword: !securityForm.showNewPassword,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {securityForm.showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs text-muted-foreground"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={
                        securityForm.showConfirmPassword ? 'text' : 'password'
                      }
                      value={securityForm.confirmPassword}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSecurityForm({
                          ...securityForm,
                          showConfirmPassword:
                            !securityForm.showConfirmPassword,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {securityForm.showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <Switch
                  checked={securityForm.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSecurityForm({
                      ...securityForm,
                      twoFactorEnabled: checked,
                    })
                  }
                />
              </div>

              <Button
                size="sm"
                onClick={handleSaveSecurity}
                className="gap-1.5 gold-gradient text-primary-foreground w-full sm:w-auto"
              >
                <Save className="h-3.5 w-3.5" />
                Save Security Settings
              </Button>
            </div>

            {/* Login Sessions & Activity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Sessions
                </h4>
              </div>

              <div className="space-y-2">
                {mockSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.device}
                        {session.isCurrent && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-primary font-semibold">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {session.lastActive}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Activity
                </h4>
              </div>

              <div className="space-y-2">
                {mockActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                  >
                    <div>
                      <p className="text-sm text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {/* Master Email Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Master switch for all email notifications
                </p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    emailNotifications: checked,
                  })
                }
              />
            </div>

            {/* Individual Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Price Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when price targets are hit
                  </p>
                </div>
                <Switch
                  checked={notifications.priceAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, priceAlerts: checked })
                  }
                  disabled={!notifications.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Challenge Updates</p>
                  <p className="text-xs text-muted-foreground">
                    Progress and milestone notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.challengeUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      challengeUpdates: checked,
                    })
                  }
                  disabled={!notifications.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Security Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Login attempts and security events
                  </p>
                </div>
                <Switch
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      securityAlerts: checked,
                    })
                  }
                  disabled={!notifications.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Market News</p>
                  <p className="text-xs text-muted-foreground">
                    Daily market summaries and news
                  </p>
                </div>
                <Switch
                  checked={notifications.marketNews || false}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      marketNews: checked,
                    } as NotificationSettings)
                  }
                  disabled={!notifications.emailNotifications}
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSaveNotifications}
              className="gap-1.5 gold-gradient text-primary-foreground w-full sm:w-auto mt-2"
            >
              <Save className="h-3.5 w-3.5" />
              Save Notifications
            </Button>
          </div>
        </div>

        {/* Platform Preferences Section */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Monitor className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Platform Preferences
            </h3>
          </div>

          <div className="space-y-4">
            {/* Theme Mode */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Theme Mode
              </Label>
              <Select
                value={platformPrefs.themeMode}
                onValueChange={(value: ThemeMode) =>
                  setPlatformPrefs({ ...platformPrefs, themeMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Watchlist Layout */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Default Watchlist Layout
              </Label>
              <Select
                value={platformPrefs.defaultWatchlistLayout}
                onValueChange={(value: 'compact' | 'detailed' | 'grid') =>
                  setPlatformPrefs({
                    ...platformPrefs,
                    defaultWatchlistLayout: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Leverage */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Default Leverage
              </Label>
              <Select
                value={platformPrefs.defaultLeverage.toString()}
                onValueChange={(value) =>
                  setPlatformPrefs({
                    ...platformPrefs,
                    defaultLeverage: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="20">1:20</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                  <SelectItem value="200">1:200</SelectItem>
                  <SelectItem value="500">1:500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency Preference */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Currency Preference
              </Label>
              <Select
                value={platformPrefs.currency}
                onValueChange={(value) =>
                  setPlatformPrefs({ ...platformPrefs, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number Format */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Number Format
              </Label>
              <Select
                value={platformPrefs.numberFormat}
                onValueChange={(value: NumberFormat) =>
                  setPlatformPrefs({ ...platformPrefs, numberFormat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">1,000.00 (Standard)</SelectItem>
                  <SelectItem value="compact">1.000,00 (European)</SelectItem>
                  <SelectItem value="financial">1k (Financial)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              onClick={handleSavePlatformPrefs}
              className="gap-1.5 gold-gradient text-primary-foreground w-full sm:w-auto mt-2"
            >
              <Save className="h-3.5 w-3.5" />
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Trading Preferences Section */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Trading Preferences
            </h3>
          </div>

          <div className="space-y-4">
            {/* Default Order Size */}
            <div className="space-y-2">
              <Label
                htmlFor="defaultOrderSize"
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Default Order Size (Lots)
              </Label>
              <Input
                id="defaultOrderSize"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={tradingPrefs.defaultOrderSize}
                onChange={(e) =>
                  setTradingPrefs({
                    ...tradingPrefs,
                    defaultOrderSize: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.1"
              />
            </div>

            {/* Default Stop Loss */}
            <div className="space-y-2">
              <Label
                htmlFor="defaultStopLoss"
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Default Stop Loss (%)
              </Label>
              <Input
                id="defaultStopLoss"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={tradingPrefs.defaultStopLoss || ''}
                onChange={(e) =>
                  setTradingPrefs({
                    ...tradingPrefs,
                    defaultStopLoss: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="Optional"
              />
            </div>

            {/* Default Take Profit */}
            <div className="space-y-2">
              <Label
                htmlFor="defaultTakeProfit"
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Default Take Profit (%)
              </Label>
              <Input
                id="defaultTakeProfit"
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={tradingPrefs.defaultTakeProfit || ''}
                onChange={(e) =>
                  setTradingPrefs({
                    ...tradingPrefs,
                    defaultTakeProfit: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="Optional"
              />
            </div>

            {/* Default Timeframe */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Default Timeframe
              </Label>
              <Select
                value={tradingPrefs.defaultTimeframe || '1h'}
                onValueChange={(value) =>
                  setTradingPrefs({ ...tradingPrefs, defaultTimeframe: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confirm Before Placing Order */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Confirm Before Placing Order
                </p>
                <p className="text-xs text-muted-foreground">
                  Show confirmation dialog for each trade
                </p>
              </div>
              <Switch
                checked={tradingPrefs.confirmBeforeOrder}
                onCheckedChange={(checked) =>
                  setTradingPrefs({
                    ...tradingPrefs,
                    confirmBeforeOrder: checked,
                  })
                }
              />
            </div>

            {/* Show Position P&L in Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Show Position P&L in Header
                </p>
                <p className="text-xs text-muted-foreground">
                  Display live P&L in the top navigation
                </p>
              </div>
              <Switch
                checked={tradingPrefs.showPositionPnLInHeader || false}
                onCheckedChange={(checked) =>
                  setTradingPrefs({
                    ...tradingPrefs,
                    showPositionPnLInHeader: checked,
                  } as TradingPreferences)
                }
              />
            </div>

            <Button
              size="sm"
              onClick={handleSaveTradingPrefs}
              className="gap-1.5 gold-gradient text-primary-foreground w-full sm:w-auto mt-2"
            >
              <Save className="h-3.5 w-3.5" />
              Save Trading Preferences
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
