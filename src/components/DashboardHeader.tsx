import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, History, UserCircle, Shield, HelpCircle, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useI18n } from "@/contexts/I18nContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardHeaderProps {
  remaining: number;
  plan: string;
  displayName?: string | null;
}

const DashboardHeader = ({ remaining, plan, displayName }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const navTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
          </div>
          <h1 className="font-heading font-bold text-base sm:text-lg">AI Current Affairs</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium capitalize">
              {plan}
            </span>
            <span>
              {plan === "pro"
                ? t("dashboard.unlimitedArticles")
                : `${remaining}/3 ${t("dashboard.articlesLeft")}`}
            </span>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-40">
            {displayName || user?.email}
          </span>
          <LanguageSelector />
          <ThemeToggle />
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} title="Admin Panel">
              <Shield className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Profile">
            <UserCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/help")} title={t("help.title")}>
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/history")} title="Article History">
            <History className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-left text-sm font-heading">Menu</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-1">
                {/* Plan badge */}
                <div className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-lg bg-secondary/50">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium capitalize">
                    {plan}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {plan === "pro"
                      ? t("dashboard.unlimitedArticles")
                      : `${remaining}/3 ${t("dashboard.articlesLeft")}`}
                  </span>
                </div>

                {/* User email */}
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                  {displayName || user?.email}
                </div>

                {/* Nav items */}
                <button
                  onClick={() => navTo("/dashboard")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <Zap className="h-4 w-4 text-accent" />
                  {t("dashboard.generate")}
                </button>
                <button
                  onClick={() => navTo("/history")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <History className="h-4 w-4 text-accent" />
                  {t("help.linkHistory")}
                </button>
                <button
                  onClick={() => navTo("/profile")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <UserCircle className="h-4 w-4 text-accent" />
                  {t("help.linkProfile")}
                </button>
                <button
                  onClick={() => navTo("/help")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-accent" />
                  {t("help.title")}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navTo("/admin")}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-accent" />
                    Admin
                  </button>
                )}

                <div className="pt-3 mt-3 border-t border-border">
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("profile.signOut")}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
