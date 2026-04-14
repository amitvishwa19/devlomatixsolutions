import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/flowbite/hooks/useAuth";
import { toast } from "sonner";
import { User, Shield, Bell, Palette, Save, Loader2, LogOut } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="sm:w-48 flex sm:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileSection userId={user?.id} email={user?.email} />}
          {activeTab === "security" && <SecuritySection email={user?.email} onSignOut={signOut} />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "appearance" && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ userId, email }: { userId?: string; email?: string }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (profile) {
        const { error } = await supabase.from("profiles").update({
          display_name: displayName,
          avatar_url: avatarUrl,
        }).eq("user_id", userId!);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert({
          user_id: userId!,
          display_name: displayName,
          avatar_url: avatarUrl,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profile updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={email || ""} disabled className="mt-1 opacity-60" />
        </div>
        <div>
          <Label>Display Name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Avatar URL</Label>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="mt-1"
          />
        </div>
        {avatarUrl && (
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
        )}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function SecuritySection({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => updatePasswordMutation.mutate()}
            disabled={updatePasswordMutation.isPending || !newPassword}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Update Password
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Sign Out</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign out of your account on this device.</p>
        <Button variant="destructive" onClick={onSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [executionAlerts, setExecutionAlerts] = useState(true);
  const [errorAlerts, setErrorAlerts] = useState(true);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        {[
          { label: "Email Notifications", desc: "Receive updates via email", value: emailNotifs, set: setEmailNotifs },
          { label: "Execution Alerts", desc: "Get notified when workflows complete", value: executionAlerts, set: setExecutionAlerts },
          { label: "Error Alerts", desc: "Get notified on workflow failures", value: errorAlerts, set: setErrorAlerts },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => item.set(!item.value)}
              className={`w-10 h-6 rounded-full transition-colors relative ${item.value ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.value ? "left-5" : "left-1"}`} />
            </button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">Notification preferences are stored locally.</p>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains("dark") ? "dark" : "light");

  const setAppTheme = (t: string) => {
    setTheme(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`Theme set to ${t}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
      <div className="space-y-4">
        <div>
          <Label>Theme</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "light", label: "Light", preview: "bg-white border-gray-200" },
              { id: "dark", label: "Dark", preview: "bg-gray-900 border-gray-700" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAppTheme(t.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-full h-16 rounded-lg border ${t.preview}`} />
                <span className="text-sm font-medium text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
