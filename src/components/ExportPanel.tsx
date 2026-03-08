import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Code, FileText, Tag } from "lucide-react";
import type { Article } from "@/components/ArticlePreview";
import { toast } from "sonner";

interface ExportPanelProps {
  article: Article | null;
}

const ExportPanel = ({ article }: ExportPanelProps) => {
  if (!article) return null;

  const articleText = `${article.seoTitle}\n\n${article.introduction}\n\n## Background\n${article.background}\n\n## Key Points\n${article.keyPoints.map(p => `• ${p}`).join("\n")}\n\n## Analysis\n${article.analysis}\n\n## Conclusion\n${article.conclusion}${article.examSection ? `\n\n## Exam Focus (${article.examSection.type})\n\nFacts:\n${article.examSection.facts.map(f => `→ ${f}`).join("\n")}\n\nKey Data:\n${article.examSection.keyData.map(d => `• ${d}`).join("\n")}\n\nQuestions:\n${article.examSection.questions.map((q, i) => `Q${i + 1}. ${q}`).join("\n")}` : ""}`;

  const bloggerHtml = `<h1>${article.seoTitle}</h1>
<p><em>${article.metaDescription}</em></p>
<h2>Introduction</h2>
<p>${article.introduction}</p>
<h2>Background</h2>
<p>${article.background}</p>
<h2>Key Points</h2>
<ul>${article.keyPoints.map(p => `\n  <li>${p}</li>`).join("")}
</ul>
<h2>Detailed Analysis</h2>
<p>${article.analysis}</p>
<h2>Conclusion</h2>
<p>${article.conclusion}</p>${article.examSection ? `
<h2>Exam Focus — ${article.examSection.type}</h2>
<h3>Important Facts</h3>
<ul>${article.examSection.facts.map(f => `\n  <li>${f}</li>`).join("")}
</ul>
<h3>Key Data</h3>
<ul>${article.examSection.keyData.map(d => `\n  <li>${d}</li>`).join("")}
</ul>
<h3>Possible Questions</h3>
<ol>${article.examSection.questions.map(q => `\n  <li>${q}</li>`).join("")}
</ol>` : ""}`;

  const wordpressHtml = `<!-- wp:heading {"level":1} -->
<h1>${article.seoTitle}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${article.introduction}</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Background</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>${article.background}</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Key Points</h2>
<!-- /wp:heading -->
<!-- wp:list -->
<ul>${article.keyPoints.map(p => `\n<li>${p}</li>`).join("")}
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Detailed Analysis</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>${article.analysis}</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Conclusion</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>${article.conclusion}</p>
<!-- /wp:paragraph -->`;

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">Export</h3>

      <Tabs defaultValue="article" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="article" className="text-xs gap-1"><FileText className="h-3 w-3" />Article</TabsTrigger>
          <TabsTrigger value="blogger" className="text-xs gap-1"><Code className="h-3 w-3" />Blogger</TabsTrigger>
          <TabsTrigger value="wordpress" className="text-xs gap-1"><Code className="h-3 w-3" />WordPress</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1"><Tag className="h-3 w-3" />SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="article" className="space-y-3">
          <pre className="text-xs bg-secondary p-3 rounded-lg max-h-48 overflow-auto whitespace-pre-wrap text-secondary-foreground">{articleText}</pre>
          <CopyButton text={articleText} label="Copy Article" />
        </TabsContent>

        <TabsContent value="blogger" className="space-y-3">
          <pre className="text-xs bg-secondary p-3 rounded-lg max-h-48 overflow-auto whitespace-pre-wrap text-secondary-foreground">{bloggerHtml}</pre>
          <CopyButton text={bloggerHtml} label="Copy Blogger HTML" />
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-3">
          <pre className="text-xs bg-secondary p-3 rounded-lg max-h-48 overflow-auto whitespace-pre-wrap text-secondary-foreground">{wordpressHtml}</pre>
          <CopyButton text={wordpressHtml} label="Copy WordPress HTML" />
        </TabsContent>

        <TabsContent value="seo" className="space-y-3">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Meta Description</p>
              <p className="text-sm bg-secondary p-2 rounded-lg text-secondary-foreground">{article.metaDescription}</p>
            </div>
            <CopyButton text={article.metaDescription} label="Copy Meta Description" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Tags</p>
              <p className="text-sm bg-secondary p-2 rounded-lg text-secondary-foreground">{article.tags.join(", ")}</p>
            </div>
            <CopyButton text={article.tags.join(", ")} label="Copy Tags" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="accent-outline" size="sm" onClick={handleCopy} className="w-full gap-2">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export default ExportPanel;
