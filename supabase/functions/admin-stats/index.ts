import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user is admin using their JWT
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all data using service role (bypasses RLS)
    const [profilesRes, articlesRes, templatesRes, rolesRes] = await Promise.all([
      adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
      adminClient.from("article_generations").select("*").order("created_at", { ascending: false }),
      adminClient.from("prompt_templates").select("*").order("created_at", { ascending: false }),
      adminClient.from("user_roles").select("*"),
    ]);

    const profiles = profilesRes.data ?? [];
    const articles = articlesRes.data ?? [];
    const templates = templatesRes.data ?? [];
    const roles = rolesRes.data ?? [];

    // Build role map
    const roleMap: Record<string, string[]> = {};
    roles.forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    // Enrich profiles with article count and roles
    const articleCounts: Record<string, number> = {};
    articles.forEach((a: any) => {
      articleCounts[a.user_id] = (articleCounts[a.user_id] || 0) + 1;
    });

    const enrichedUsers = profiles.map((p: any) => ({
      ...p,
      article_count: articleCounts[p.user_id] || 0,
      roles: roleMap[p.user_id] || [],
    }));

    // Enrich articles with user email
    const emailMap: Record<string, string> = {};
    profiles.forEach((p: any) => {
      if (p.user_id && p.email) emailMap[p.user_id] = p.email;
    });

    const enrichedArticles = articles.map((a: any) => ({
      ...a,
      user_email: emailMap[a.user_id] || "Unknown",
    }));

    // Compute analytics
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const totalUsers = profiles.length;
    const proUsers = profiles.filter((p: any) => p.plan === "pro").length;
    const totalArticles = articles.length;
    const todayArticles = articles.filter((a: any) => new Date(a.created_at) >= todayStart).length;
    const activeUsers = profiles.filter((p: any) => p.status === "active").length;
    const suspendedUsers = profiles.filter((p: any) => p.status === "suspended").length;
    const bannedUsers = profiles.filter((p: any) => p.status === "banned").length;
    const examArticles = articles.filter((a: any) => a.exam_mode).length;
    const featuredArticles = articles.filter((a: any) => a.featured).length;

    // Last 30 days trend
    const dailyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = articles.filter(
        (a: any) => new Date(a.created_at) >= date && new Date(a.created_at) < nextDay
      ).length;
      return {
        date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        count,
      };
    });

    // User growth last 30 days
    const userGrowth = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = profiles.filter(
        (p: any) => new Date(p.created_at) >= date && new Date(p.created_at) < nextDay
      ).length;
      return {
        date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        count,
      };
    });

    // Top users by article count
    const topUsers = [...enrichedUsers]
      .sort((a: any, b: any) => b.article_count - a.article_count)
      .slice(0, 10);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    articles.forEach((a: any) => {
      const cat = a.category || "general";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Exam type breakdown
    const examTypeBreakdown: Record<string, number> = {};
    articles.filter((a: any) => a.exam_mode).forEach((a: any) => {
      const type = a.exam_type || "General";
      examTypeBreakdown[type] = (examTypeBreakdown[type] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        users: enrichedUsers,
        articles: enrichedArticles,
        templates,
        analytics: {
          totalUsers,
          proUsers,
          totalArticles,
          todayArticles,
          activeUsers,
          suspendedUsers,
          bannedUsers,
          examArticles,
          featuredArticles,
          dailyTrend,
          userGrowth,
          topUsers,
          categoryBreakdown,
          examTypeBreakdown,
          recentArticles: enrichedArticles.slice(0, 10),
          recentUsers: enrichedUsers.slice(0, 10),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("admin-stats error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
