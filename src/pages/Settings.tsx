import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Palette, Bell, Shield, Keyboard, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { platforms } from "@/lib/platform-config";
import { PlatformLogo } from "@/components/PlatformLogo";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

type SettingsTab = "account" | "appearance" | "notifications" | "privacy" | "shortcuts";

const tabs = [
  { id: "account" as const, label: "Account", icon: User },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "privacy" as const, label: "Privacy & Security", icon: Shield },
  { id: "shortcuts" as const, label: "Keyboard Shortcuts", icon: Keyboard },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [compactView, setCompactView] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    sound: false,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-accent/50 text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <Separator className="my-6" />

          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "account" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Account</h2>
                  <p className="text-muted-foreground">Manage your account settings and connected platforms</p>
                </div>

                {/* Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile</h3>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                </div>

                {/* Connected Platforms */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connected Platforms</h3>
                  <div className="space-y-3">
                    {Object.values(platforms).map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border"
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", platform.bgClass)}>
                          <PlatformLogo platform={platform.id} size="md" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">Connected</p>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Appearance</h2>
                  <p className="text-muted-foreground">Customize how Nexus looks on your device</p>
                </div>

                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", icon: Sun, label: "Light" },
                        { value: "dark", icon: Moon, label: "Dark" },
                        { value: "system", icon: Monitor, label: "System" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                            theme === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          <option.icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view" className="text-base font-medium">Compact View</Label>
                      <p className="text-sm text-muted-foreground">Show more messages in a smaller space</p>
                    </div>
                    <Switch
                      id="compact-view"
                      checked={compactView}
                      onCheckedChange={setCompactView}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
                  <p className="text-muted-foreground">Choose how you want to be notified</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif" className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notif" className="text-base font-medium">Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show desktop push notifications</p>
                    </div>
                    <Switch
                      id="desktop-notif"
                      checked={notifications.desktop}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-notif" className="text-base font-medium">Sound</Label>
                      <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                    </div>
                    <Switch
                      id="sound-notif"
                      checked={notifications.sound}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sound: checked }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Privacy & Security</h2>
                  <p className="text-muted-foreground">Manage your data and security settings</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Password</Label>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Active Sessions</Label>
                      <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Data Export</Label>
                      <p className="text-sm text-muted-foreground">Download a copy of your data</p>
                    </div>
                    <Button variant="outline">Export Data</Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium text-destructive">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shortcuts" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Keyboard Shortcuts</h2>
                  <p className="text-muted-foreground">Quick actions to navigate faster</p>
                </div>

                <div className="space-y-3">
                  {[
                    { keys: ["j", "k"], action: "Navigate messages" },
                    { keys: ["e"], action: "Archive message" },
                    { keys: ["s"], action: "Star/Unstar message" },
                    { keys: ["r"], action: "Reply to message" },
                    { keys: ["c"], action: "Compose new message" },
                    { keys: ["/"], action: "Search" },
                    { keys: ["?"], action: "Show shortcuts" },
                  ].map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                      <span className="text-muted-foreground">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key) => (
                          <kbd key={key} className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
