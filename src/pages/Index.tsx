import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TopicInput from "@/components/TopicInput";
import ArticlePreview, { type Article } from "@/components/ArticlePreview";
import ExportPanel from "@/components/ExportPanel";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const { remaining, plan, canGenerate, recordGeneration } = useUsage();
  const [article, setArticle] = useState<Article | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (topic: string, examMode: boolean, examType: string) => {
    if (!canGenerate) {
      toast.error("Daily limit reached! Upgrade to Pro for unlimited articles.");
      return;
    }

    setIsGenerating(true);
    setArticle(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { topic, examMode, examType },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setIsGenerating(false);
        return;
      }

      setArticle(data.article);
      await recordGeneration(topic, examMode, examType, data.article);
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err?.message || "Failed to generate article. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader remaining={remaining} plan={plan} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-1">Generate Article</h2>
          <p className="text-sm text-muted-foreground">
            Enter a current affairs topic and get an SEO-ready blog article instantly
          </p>
        </div>

        <TopicInput onGenerate={handleGenerate} isGenerating={isGenerating} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Article Preview
              </h3>
              <ArticlePreview article={article} isGenerating={isGenerating} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-[var(--shadow-card)] sticky top-6">
              <ExportPanel article={article} />
              {!article && !isGenerating && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Generate an article to see export options
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
