import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User } from "lucide-react";
import { toast } from "sonner";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).single();
      if (data) setDisplayName((data as any).display_name ?? "");
      setFetching(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmedName = displayName.trim();
    if (trimmedName.length > 100) {
      toast.error("Display name must be less than 100 characters");
      return;
    }
    setLoading(true);
    const { error: profileError } = await supabase.from("profiles").update({ display_name: trimmedName || null } as any).eq("user_id", user.id);
    if (profileError) { toast.error("Failed to update profile"); setLoading(false); return; }
    const trimmedEmail = email.trim();
    if (trimmedEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail });
      if (emailError) { toast.error(emailError.message); setLoading(false); return; }
      toast.success(t("profile.savedEmail"));
    } else {
      toast.success(t("profile.saved"));
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-heading font-bold text-lg">{t("profile.title")}</h1>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 py-10">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-heading font-semibold">{displayName || user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("profile.displayName")}</Label>
              <Input id="displayName" type="text" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} className="h-11" />
              <p className="text-xs text-muted-foreground">{t("profile.displayNameHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              <p className="text-xs text-muted-foreground">{t("profile.emailHint")}</p>
            </div>
            <Button variant="accent" className="w-full h-11" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? t("profile.saving") : t("profile.save")}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
