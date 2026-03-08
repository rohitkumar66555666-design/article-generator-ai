import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface Article {
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  introduction: string;
  background: string;
  keyPoints: string[];
  analysis: string;
  conclusion: string;
  examSection?: {
    type: string;
    facts: string[];
    keyData: string[];
    questions: string[];
  };
}

interface ArticlePreviewProps {
  article: Article | null;
  isGenerating: boolean;
}

const ArticlePreview = ({ article, isGenerating }: ArticlePreviewProps) => {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-accent animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">Generating your article...</p>
        <p className="text-sm text-muted-foreground">This may take a few seconds</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
          <span className="text-2xl">✍️</span>
        </div>
        <p className="font-heading font-semibold text-lg">No article yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Enter a current affairs topic and click Generate to create your SEO-ready article
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-none">
      <div className="space-y-3">
        <h1 className="text-2xl font-heading font-bold leading-tight">{article.seoTitle}</h1>
        <p className="text-sm text-muted-foreground italic">{article.metaDescription}</p>
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <section className="space-y-2">
        <h2 className="text-lg font-heading font-semibold text-accent">Introduction</h2>
        <p className="text-sm leading-relaxed text-card-foreground">{article.introduction}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-heading font-semibold text-accent">Background</h2>
        <p className="text-sm leading-relaxed text-card-foreground">{article.background}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-heading font-semibold text-accent">Key Points</h2>
        <ul className="space-y-1.5">
          {article.keyPoints.map((point, i) => (
            <li key={i} className="text-sm leading-relaxed text-card-foreground flex gap-2">
              <span className="text-accent font-bold mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-heading font-semibold text-accent">Detailed Analysis</h2>
        <p className="text-sm leading-relaxed text-card-foreground">{article.analysis}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-heading font-semibold text-accent">Conclusion</h2>
        <p className="text-sm leading-relaxed text-card-foreground">{article.conclusion}</p>
      </section>

      {article.examSection && (
        <>
          <Separator />
          <section className="space-y-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
            <h2 className="text-lg font-heading font-semibold text-accent">
              📝 Exam Focus — {article.examSection.type}
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold font-heading">Important Facts</h3>
              <ul className="space-y-1">
                {article.examSection.facts.map((f, i) => (
                  <li key={i} className="text-sm text-card-foreground flex gap-2">
                    <span className="text-accent">→</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold font-heading">Key Data</h3>
              <ul className="space-y-1">
                {article.examSection.keyData.map((d, i) => (
                  <li key={i} className="text-sm text-card-foreground flex gap-2">
                    <span className="text-accent">📊</span>{d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold font-heading">Possible Exam Questions</h3>
              <ol className="space-y-1">
                {article.examSection.questions.map((q, i) => (
                  <li key={i} className="text-sm text-card-foreground">
                    <span className="text-accent font-semibold">Q{i + 1}.</span> {q}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ArticlePreview;
