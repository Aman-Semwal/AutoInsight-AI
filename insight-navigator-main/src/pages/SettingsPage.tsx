import { useState, useEffect } from "react";
import { User, Bell, Shield, Sun, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Sync profile name when loaded
  useEffect(() => {
    if (profile?.full_name && !name) {
      setName(profile.full_name);
    }
  }, [profile]);

  const email = user?.email || "";

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your name has been saved." });
      // Invalidate all queries that use profile data so TopBar etc. update instantly
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "Your password has been changed successfully." });
      setNewPassword("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Profile</h2></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border/50 text-foreground h-10" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={email} disabled className="bg-secondary border-border/50 text-muted-foreground h-10" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving || !name.trim()} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
        </Button>
      </div>

      <div className="glass rounded-xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 mb-2">
          {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm text-foreground">Dark Mode</span>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark theme</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 mb-2"><Bell className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Notifications</h2></div>
        {["Processing complete", "Shared visualizations", "Weekly summary"].map((item) => (
          <div key={item} className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{item}</span>
            <Switch defaultChecked />
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Security</h2></div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="bg-secondary border-border/50 text-foreground h-10"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} variant="outline" className="border-border/50 text-foreground hover:bg-secondary">
            {changingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
