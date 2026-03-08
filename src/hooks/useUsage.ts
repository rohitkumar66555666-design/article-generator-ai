import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FREE_DAILY_LIMIT = 3;

export function useUsage() {
  const { user } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [genResult, profileResult] = await Promise.all([
      supabase
        .from("article_generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .single(),
    ]);

    setTodayCount(genResult.count ?? 0);
    setPlan(profileResult.data?.plan ?? "free");
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const remaining = plan === "pro" ? Infinity : Math.max(0, FREE_DAILY_LIMIT - todayCount);
  const canGenerate = plan === "pro" || todayCount < FREE_DAILY_LIMIT;

  const recordGeneration = async (topic: string, examMode: boolean, examType: string | null, articleContent?: any) => {
    if (!user) return;
    await supabase.from("article_generations").insert({
      user_id: user.id,
      topic,
      exam_mode: examMode,
      exam_type: examType,
      article_content: articleContent ?? null,
    } as any);
    setTodayCount((prev) => prev + 1);
  };

  return { todayCount, plan, remaining, canGenerate, recordGeneration, loading, refreshUsage: fetchUsage };
}
