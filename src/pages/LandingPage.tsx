import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, BookOpen, FileText, Copy, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/contexts/I18nContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { t } = useI18n();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) toast.error(error.message);
    } catch {
      toast.error("Failed to sign in with Google");
    }
    setGoogleLoading(false);
  };

  const features = [
    { icon: Sparkles, title: t("landing.features.ai.title"), description: t("landing.features.ai.desc") },
    { icon: BookOpen, title: t("landing.features.exam.title"), description: t("landing.features.exam.desc") },
    { icon: FileText, title: t("landing.features.seo.title"), description: t("landing.features.seo.desc") },
    { icon: Copy, title: t("landing.features.export.title"), description: t("landing.features.export.desc") },
  ];

  const pricingPlans = [
    {
      name: t("landing.pricing.free"),
      price: "₹0",
      period: "forever",
      description: t("landing.pricing.free.desc"),
      features: [t("landing.pricing.f1"), t("landing.pricing.f2"), t("landing.pricing.f3"), t("landing.pricing.f4"), t("landing.pricing.f5")],
      cta: t("landing.pricing.free.cta"),
      highlighted: false,
    },
    {
      name: t("landing.pricing.pro"),
      price: "₹499",
      period: "/month",
      description: t("landing.pricing.pro.desc"),
      features: [t("landing.pricing.f6"), t("landing.pricing.f2"), t("landing.pricing.f3"), t("landing.pricing.f4"), t("landing.pricing.f5"), t("landing.pricing.f7"), t("landing.pricing.f8")],
      cta: t("landing.pricing.pro.cta"),
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-4 max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
            </div>
            <span className="font-heading font-bold text-base sm:text-lg">AI Current Affairs</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/auth")}>
              {t("landing.nav.signIn")}
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate("/auth")}>
              {t("landing.nav.getStarted")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-[0.03]" />
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {t("landing.hero.badge")}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            {t("landing.hero.title1")}{" "}
            <span className="text-accent">{t("landing.hero.title2")}</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="accent" size="lg" className="h-12 px-8 text-base gap-2" onClick={() => navigate("/auth")}>
              {t("landing.hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2" disabled={googleLoading} onClick={handleGoogleSignIn}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? t("auth.pleaseWait") : "Sign in with Google"}
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              {t("landing.hero.viewPricing")}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("landing.hero.noCreditCard")}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">{t("landing.features.heading")}</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{t("landing.features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-xl border border-border bg-background hover:shadow-[var(--shadow-elevated)] transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">{t("landing.pricing.heading")}</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{t("landing.pricing.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlighted ? "border-accent bg-card shadow-[var(--shadow-elevated)]" : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {t("landing.pricing.mostPopular")}
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-6 mb-8">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlighted ? "accent" : "outline"} className="w-full h-11 mt-8" onClick={() => navigate("/auth")}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
              <Zap className="h-3 w-3 text-accent-foreground" />
            </div>
            <span className="font-heading font-semibold text-sm">AI Current Affairs</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI Current Affairs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
