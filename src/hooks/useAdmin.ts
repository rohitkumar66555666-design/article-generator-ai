import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export function useAdminData() {
  const [users, setUsers] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, gensRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("article_generations").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(profilesRes.data ?? []);
    setGenerations(gensRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePlan = async (userId: string, newPlan: string) => {
    await supabase.from("profiles").update({ plan: newPlan }).eq("user_id", userId);
    await fetchData();
  };

  // Analytics
  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.plan === "pro").length;
  const freeUsers = totalUsers - proUsers;
  const totalGenerations = generations.length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayGenerations = generations.filter(
    (g) => new Date(g.created_at) >= todayStart
  ).length;

  // Last 7 days trend
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = generations.filter(
      (g) => new Date(g.created_at) >= date && new Date(g.created_at) < nextDay
    ).length;
    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      count,
    };
  });

  return {
    users,
    generations,
    loading,
    updatePlan,
    fetchData,
    analytics: { totalUsers, proUsers, freeUsers, totalGenerations, todayGenerations, dailyTrend },
  };
}
