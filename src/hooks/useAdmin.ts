import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => {
        setIsAdmin((data?.length ?? 0) > 0);
        setLoading(false);
      });
  }, [user]);

  return { isAdmin, loading };
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  plan: string;
  status: string;
  created_at: string;
  avatar_url: string | null;
  article_count?: number;
  roles?: string[];
}

export interface AdminArticle {
  id: string;
  topic: string;
  user_id: string;
  created_at: string;
  category: string | null;
  status: string;
  featured: boolean;
  exam_mode: boolean;
  exam_type: string | null;
  article_content: any;
  user_email?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt_instruction: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  proUsers: number;
  totalArticles: number;
  todayArticles: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  examArticles: number;
  featuredArticles: number;
  dailyTrend: { date: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  topUsers: AdminUser[];
  categoryBreakdown: Record<string, number>;
  examTypeBreakdown: Record<string, number>;
  recentArticles: AdminArticle[];
  recentUsers: AdminUser[];
}

export function useAdminData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    totalUsers: 0,
    proUsers: 0,
    totalArticles: 0,
    todayArticles: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    examArticles: 0,
    featuredArticles: 0,
    dailyTrend: [],
    userGrowth: [],
    topUsers: [],
    categoryBreakdown: {},
    examTypeBreakdown: {},
    recentArticles: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-stats");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers(data.users ?? []);
      setArticles(data.articles ?? []);
      setTemplates(data.templates ?? []);
      setAnalytics(data.analytics);
    } catch (err: any) {
      console.error("Admin data fetch error:", err);
      toast.error("Failed to load admin data");
      // Fallback to direct queries
      const [profilesRes, gensRes, templatesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("article_generations").select("*").order("created_at", { ascending: false }),
        supabase.from("prompt_templates").select("*").order("created_at", { ascending: false }),
      ]);

      const profilesData = profilesRes.data ?? [];
      const articlesData = gensRes.data ?? [];

      const articleCounts: Record<string, number> = {};
      articlesData.forEach((a: any) => {
        articleCounts[a.user_id] = (articleCounts[a.user_id] || 0) + 1;
      });

      const enrichedUsers: AdminUser[] = profilesData.map((p: any) => ({
        ...p,
        article_count: articleCounts[p.user_id] || 0,
      }));

      const emailMap: Record<string, string> = {};
      profilesData.forEach((p: any) => {
        if (p.user_id && p.email) emailMap[p.user_id] = p.email;
      });

      const enrichedArticles: AdminArticle[] = articlesData.map((a: any) => ({
        ...a,
        user_email: emailMap[a.user_id] || "Unknown",
      }));

      setUsers(enrichedUsers);
      setArticles(enrichedArticles);
      setTemplates((templatesRes.data as any[]) ?? []);

      // Compute basic analytics from fallback data
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      setAnalytics({
        totalUsers: enrichedUsers.length,
        proUsers: enrichedUsers.filter((u) => u.plan === "pro").length,
        totalArticles: enrichedArticles.length,
        todayArticles: enrichedArticles.filter((a) => new Date(a.created_at) >= todayStart).length,
        activeUsers: enrichedUsers.filter((u) => u.status === "active").length,
        suspendedUsers: enrichedUsers.filter((u) => u.status === "suspended").length,
        bannedUsers: enrichedUsers.filter((u) => u.status === "banned").length,
        examArticles: enrichedArticles.filter((a) => a.exam_mode).length,
        featuredArticles: enrichedArticles.filter((a) => a.featured).length,
        dailyTrend: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(); date.setDate(date.getDate() - (6 - i)); date.setHours(0, 0, 0, 0);
          const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
          return { date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), count: enrichedArticles.filter((a) => new Date(a.created_at) >= date && new Date(a.created_at) < nextDay).length };
        }),
        userGrowth: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(); date.setDate(date.getDate() - (6 - i)); date.setHours(0, 0, 0, 0);
          const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
          return { date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), count: enrichedUsers.filter((u) => new Date(u.created_at) >= date && new Date(u.created_at) < nextDay).length };
        }),
        topUsers: [...enrichedUsers].sort((a, b) => (b.article_count || 0) - (a.article_count || 0)).slice(0, 10),
        categoryBreakdown: {},
        examTypeBreakdown: {},
        recentArticles: enrichedArticles.slice(0, 5),
        recentUsers: enrichedUsers.slice(0, 5),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // User actions
  const updatePlan = async (userId: string, newPlan: string) => {
    const { error } = await supabase.from("profiles").update({ plan: newPlan }).eq("user_id", userId);
    if (error) { toast.error("Failed to update plan"); return; }
    toast.success("Plan updated");
    await fetchData();
  };

  const updateUserStatus = async (userId: string, status: string) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("user_id", userId);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`User ${status === "active" ? "activated" : status}`);
    await fetchData();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) { toast.error("Failed to delete user"); return; }
    toast.success("User profile deleted");
    await fetchData();
  };

  // Article actions
  const toggleArticleFeatured = async (articleId: string, featured: boolean) => {
    const { error } = await supabase.from("article_generations").update({ featured }).eq("id", articleId);
    if (error) { toast.error("Failed to update article"); return; }
    toast.success(featured ? "Article featured" : "Article unfeatured");
    await fetchData();
  };

  const updateArticleStatus = async (articleId: string, status: string) => {
    const { error } = await supabase.from("article_generations").update({ status }).eq("id", articleId);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success("Article status updated");
    await fetchData();
  };

  const deleteArticle = async (articleId: string) => {
    const { error } = await supabase.from("article_generations").delete().eq("id", articleId);
    if (error) { toast.error("Failed to delete article"); return; }
    toast.success("Article deleted");
    await fetchData();
  };

  // Template actions
  const createTemplate = async (template: { name: string; prompt_instruction: string; category: string }) => {
    const { error } = await supabase.from("prompt_templates").insert(template as any);
    if (error) { toast.error("Failed to create template"); return; }
    toast.success("Template created");
    await fetchData();
  };

  const updateTemplate = async (id: string, updates: Partial<PromptTemplate>) => {
    const { error } = await supabase.from("prompt_templates").update(updates as any).eq("id", id);
    if (error) { toast.error("Failed to update template"); return; }
    toast.success("Template updated");
    await fetchData();
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("prompt_templates").delete().eq("id", id);
    if (error) { toast.error("Failed to delete template"); return; }
    toast.success("Template deleted");
    await fetchData();
  };

  return {
    users,
    articles,
    templates,
    loading,
    fetchData,
    updatePlan,
    updateUserStatus,
    deleteUser,
    toggleArticleFeatured,
    updateArticleStatus,
    deleteArticle,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    analytics,
  };
}
