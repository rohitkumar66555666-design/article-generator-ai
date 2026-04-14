import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/contexts/I18nContext";

export interface Article {
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  introduction: string;
  background: string;
  keyPoints: string[];
  analysis: string;
  conclusion: string;
  heroImage?: string;
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
  const { t } = useI18n();

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-accent animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">Generating your article...</p>
        <p className="text-sm text-muted-foreground">This may take a moment for detailed content</p>
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
          Enter a current affairs topic and click Generate to create your detailed, engaging article
        </p>
      </div>
    );
  }

  return (
    <article className="space-y-8 max-w-none prose-sm">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-heading font-bold leading-tight tracking-tight text-foreground">
          {article.seoTitle}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground italic border-l-4 border-accent pl-4">
          {article.metaDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <Separator className="my-2" />

      {/* Introduction - styled as a lead section */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block" />
          Introduction
        </h2>
        <div className="text-base leading-[1.8] text-card-foreground whitespace-pre-line first-letter:text-3xl first-letter:font-bold first-letter:text-accent first-letter:float-left first-letter:mr-2 first-letter:leading-none">
          {article.introduction}
        </div>
      </section>

      {/* Background */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block" />
          Background & Context
        </h2>
        <div className="text-base leading-[1.8] text-card-foreground whitespace-pre-line bg-secondary/30 rounded-xl p-5 border border-border">
          {article.background}
        </div>
      </section>

      {/* Key Points - card style */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block" />
          Key Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {article.keyPoints.map((point, i) => (
            <div
              key={i}
              className="flex gap-3 p-4 rounded-xl bg-secondary/20 border border-border hover:border-accent/40 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-card-foreground">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block" />
          In-Depth Analysis
        </h2>
        <div className="text-base leading-[1.8] text-card-foreground whitespace-pre-line">
          {article.analysis}
        </div>
      </section>

      {/* Conclusion - highlighted */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block" />
          Conclusion
        </h2>
        <div className="text-base leading-[1.8] text-card-foreground whitespace-pre-line bg-accent/5 rounded-xl p-5 border-l-4 border-accent">
          {article.conclusion}
        </div>
      </section>

      {/* Exam Section */}
      {article.examSection && (
        <>
          <Separator />
          <section className="space-y-5 p-5 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
            <h2 className="text-xl font-heading font-bold text-accent flex items-center gap-2">
              📝 Exam Focus — {article.examSection.type}
            </h2>

            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-muted-foreground">
                Important Facts
              </h3>
              <ul className="space-y-2">
                {article.examSection.facts.map((f, i) => (
                  <li key={i} className="text-sm text-card-foreground flex gap-2 items-start bg-background/60 rounded-lg p-3">
                    <span className="text-accent text-lg leading-none">→</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-muted-foreground">
                Key Data & Statistics
              </h3>
              <ul className="space-y-2">
                {article.examSection.keyData.map((d, i) => (
                  <li key={i} className="text-sm text-card-foreground flex gap-2 items-start bg-background/60 rounded-lg p-3">
                    <span className="text-accent">📊</span>
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-muted-foreground">
                Possible Exam Questions
              </h3>
              <ol className="space-y-2">
                {article.examSection.questions.map((q, i) => (
                  <li key={i} className="text-sm text-card-foreground bg-background/60 rounded-lg p-3">
                    <span className="text-accent font-bold">Q{i + 1}.</span> {q}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}
    </article>
  );
};

export default ArticlePreview;
