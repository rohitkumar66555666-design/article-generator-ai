import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, BookOpen } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface TopicInputProps {
  onGenerate: (topic: string, examMode: boolean, examType: string) => void;
  isGenerating: boolean;
}

const TopicInput = ({ onGenerate, isGenerating }: TopicInputProps) => {
  const { t } = useI18n();
  const [topic, setTopic] = useState("");
  const [examMode, setExamMode] = useState(false);
  const [examType, setExamType] = useState("UPSC");

  const handleGenerate = () => {
    if (topic.trim()) {
      onGenerate(topic.trim(), examMode, examType);
    }
  };

  const suggestions = [
    "Budget 2026",
    "India-China Relations",
    "RBI Monetary Policy",
    "Global Economy Outlook",
    "Climate Change Summit",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Enter Topic
        </Label>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. Budget 2026, RBI Policy, India-China relations..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="h-12 text-base bg-card border-border font-body"
          />
          <Button
            variant="accent"
            size="lg"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="h-12 px-6 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setTopic(s)}
            className="px-3 py-1.5 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-accent" />
          <div>
            <p className="font-medium font-heading text-sm">Exam Focus Mode</p>
            <p className="text-xs text-muted-foreground">Add exam-relevant facts, data & practice questions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {examMode && (
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPSC">UPSC</SelectItem>
                <SelectItem value="SSC">SSC</SelectItem>
                <SelectItem value="General">General Awareness</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Switch checked={examMode} onCheckedChange={setExamMode} />
        </div>
      </div>
    </div>
  );
};

export default TopicInput;
