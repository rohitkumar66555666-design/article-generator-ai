import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Send,
  HelpCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Zap,
  FileText,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

const HelpPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const faqs = [
    { q: t("help.faq1.q"), a: t("help.faq1.a"), icon: Zap },
    { q: t("help.faq2.q"), a: t("help.faq2.a"), icon: FileText },
    { q: t("help.faq3.q"), a: t("help.faq3.a"), icon: BookOpen },
    { q: t("help.faq4.q"), a: t("help.faq4.a"), icon: Shield },
    { q: t("help.faq5.q"), a: t("help.faq5.a"), icon: MessageSquare },
    { q: t("help.faq6.q"), a: t("help.faq6.a"), icon: Mail },
  ];

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = contactName.trim();
    const email = contactEmail.trim();
    const message = contactMessage.trim();

    if (!name || !email || !message) {
      toast.error(t("help.fillAll"));
      return;
    }
    if (name.length > 100 || message.length > 2000) {
      toast.error(t("help.tooLong"));
      return;
    }

    setSending(true);
    // Simulate sending — in production, wire to an edge function or email service
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(t("help.sent"));
    setContactName("");
    setContactMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-heading font-bold text-lg">{t("help.title")}</h1>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-10">
        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-bold text-xl">{t("help.faqTitle")}</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <faq.icon className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-medium text-sm">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 pl-7">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact Form */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-bold text-xl">{t("help.contactTitle")}</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-5">{t("help.contactSubtitle")}</p>
            <form onSubmit={handleContact} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="helpName">{t("help.name")}</Label>
                  <Input
                    id="helpName"
                    placeholder={t("help.namePlaceholder")}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    maxLength={100}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="helpEmail">{t("auth.email")}</Label>
                  <Input
                    id="helpEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpMessage">{t("help.message")}</Label>
                <Textarea
                  id="helpMessage"
                  placeholder={t("help.messagePlaceholder")}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {contactMessage.length}/2000
                </p>
              </div>
              <Button variant="accent" className="w-full h-11" disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? t("help.sending") : t("help.send")}
              </Button>
            </form>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-bold text-xl">{t("help.quickLinks")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-card border border-border rounded-xl p-5 text-left hover:border-accent transition-colors group"
            >
              <Zap className="h-5 w-5 text-accent mb-2" />
              <p className="font-heading font-semibold text-sm">{t("help.linkGenerate")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("help.linkGenerateDesc")}</p>
            </button>
            <button
              onClick={() => navigate("/history")}
              className="bg-card border border-border rounded-xl p-5 text-left hover:border-accent transition-colors group"
            >
              <FileText className="h-5 w-5 text-accent mb-2" />
              <p className="font-heading font-semibold text-sm">{t("help.linkHistory")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("help.linkHistoryDesc")}</p>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-card border border-border rounded-xl p-5 text-left hover:border-accent transition-colors group"
            >
              <Shield className="h-5 w-5 text-accent mb-2" />
              <p className="font-heading font-semibold text-sm">{t("help.linkProfile")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("help.linkProfileDesc")}</p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpPage;
