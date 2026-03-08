import { Button } from "@/components/ui/button";
import { Zap, User } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="h-4 w-4 text-accent-foreground" />
          </div>
          <h1 className="font-heading font-bold text-lg">AI Current Affairs</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium">Free</span>
            <span>3/3 articles left today</span>
          </div>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
