import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, LANGUAGES } from "@/contexts/I18nContext";

export default function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Language" className="relative">
          <Globe className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] leading-none">
            {current?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={lang === l.code ? "bg-accent/10 font-medium" : ""}
          >
            <span className="mr-2 text-sm">{l.flag}</span>
            <span className="text-sm">{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
