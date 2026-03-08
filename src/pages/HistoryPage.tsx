import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArticlePreview, { type Article } from "@/components/ArticlePreview";
import ExportPanel from "@/components/ExportPanel";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { format } from "date-fns";

interface HistoryEntry {
  id: string;
  topic: string;
  exam_mode: boolean;
  exam_type: string | null;
  created_at: string;
  article_content: Article | null;
}

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("article_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setEntries(
        (data ?? []).map((d: any) => ({
          ...d,
          article_content: d.article_content as Article | null,
        }))
      );
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
            <h1 className="font-heading font-bold text-lg">AI Current Affairs</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-1">{t("history.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("history.subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-4 border-muted border-t-accent animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
              <Clock className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-heading font-semibold text-lg">{t("history.empty")}</p>
            <p className="text-sm text-muted-foreground">{t("history.emptyHint")}</p>
            <Button variant="accent" className="mt-4" onClick={() => navigate("/dashboard")}>
              {t("history.generateBtn")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-border rounded-xl bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-semibold truncate">
                        {entry.article_content?.seoTitle || entry.topic}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
                        </span>
                        {entry.exam_mode && (
                          <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                            <BookOpen className="h-3 w-3" />
                            {entry.exam_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedId === entry.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {expandedId === entry.id && entry.article_content && (
                  <div className="border-t border-border p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <ArticlePreview article={entry.article_content} isGenerating={false} />
                      </div>
                      <div className="lg:col-span-1">
                        <div className="sticky top-6">
                          <ExportPanel article={entry.article_content} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {expandedId === entry.id && !entry.article_content && (
                  <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
                    {t("history.noContent")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
