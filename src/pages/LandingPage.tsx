import { Button } from "@/components/ui/button";
import { Zap, Sparkles, BookOpen, FileText, Copy, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Articles",
    description: "Generate comprehensive, SEO-optimized current affairs articles in seconds using advanced AI models.",
  },
  {
    icon: BookOpen,
    title: "Exam Focus Mode",
    description: "Get UPSC, SSC & competitive exam-ready facts, key data points, and practice questions alongside every article.",
  },
  {
    icon: FileText,
    title: "SEO Metadata",
    description: "Every article comes with an optimized title, meta description, and tags — ready to publish.",
  },
  {
    icon: Copy,
    title: "One-Click Export",
    description: "Export formatted HTML for Blogger, WordPress, or copy raw article text instantly.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 articles per day",
      "All current affairs topics",
      "SEO metadata included",
      "Blogger & WordPress export",
      "Exam Focus Mode",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited articles",
      "All current affairs topics",
      "SEO metadata included",
      "Blogger & WordPress export",
      "Exam Focus Mode",
      "Priority AI generation",
      "Article history & bookmarks",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 max-w-6xl">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">AI Current Affairs</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="accent" onClick={() => navigate("/auth")}>
              Get Started
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
            Powered by AI
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Current Affairs Articles,{" "}
            <span className="text-accent">Generated in Seconds</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter any topic and get a comprehensive, SEO-optimized blog article with exam-ready insights — perfect for content creators and UPSC aspirants.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="accent"
              size="lg"
              className="h-12 px-8 text-base gap-2"
              onClick={() => navigate("/auth")}
            >
              Start Writing Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Pricing
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 3 free articles daily
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              From topic to published article in one click — with built-in exam prep and SEO optimization.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl border border-border bg-background hover:shadow-[var(--shadow-elevated)] transition-shadow"
              >
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Start free and upgrade when you need unlimited access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-accent bg-card shadow-[var(--shadow-elevated)]"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    Most Popular
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
                <Button
                  variant={plan.highlighted ? "accent" : "outline"}
                  className="w-full h-11 mt-8"
                  onClick={() => navigate("/auth")}
                >
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
