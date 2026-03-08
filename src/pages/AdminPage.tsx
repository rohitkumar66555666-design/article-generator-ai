import { useAdmin, useAdminData } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Users, FileText, Wand2, Shield } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminArticles from "@/components/admin/AdminArticles";
import AdminTemplates from "@/components/admin/AdminTemplates";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdmin();
  const navigate = useNavigate();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-accent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <AdminDashboard />;
}

function AdminDashboard() {
  const {
    users, articles, templates, loading,
    updatePlan, updateUserStatus, deleteUser,
    toggleArticleFeatured, updateArticleStatus, deleteArticle,
    createTemplate, updateTemplate, deleteTemplate,
    analytics,
  } = useAdminData();
  const navigate = useNavigate();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            <h1 className="font-heading font-bold text-lg">{t("admin.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Articles
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs">
              <Wand2 className="h-3.5 w-3.5" /> Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview analytics={analytics} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers
              users={users}
              updatePlan={updatePlan}
              updateUserStatus={updateUserStatus}
              deleteUser={deleteUser}
            />
          </TabsContent>

          <TabsContent value="articles">
            <AdminArticles
              articles={articles}
              toggleArticleFeatured={toggleArticleFeatured}
              updateArticleStatus={updateArticleStatus}
              deleteArticle={deleteArticle}
            />
          </TabsContent>

          <TabsContent value="templates">
            <AdminTemplates
              templates={templates}
              createTemplate={createTemplate}
              updateTemplate={updateTemplate}
              deleteTemplate={deleteTemplate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
