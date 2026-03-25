import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, Zap, Clock, Shield, Ban, Star, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import type { AdminAnalytics } from "@/hooks/useAdmin";

interface OverviewProps {
  analytics: AdminAnalytics;
}

function StatCard({ title, value, icon: Icon, accent = false, color }: { title: string; value: number | string; icon: any; accent?: boolean; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-accent/10" : "bg-secondary"}`}>
          <Icon className={`h-5 w-5 ${color || (accent ? "text-accent" : "text-muted-foreground")}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
};

const COLORS = ["hsl(var(--accent))", "hsl(174, 60%, 50%)", "hsl(174, 50%, 60%)", "hsl(220, 20%, 65%)", "hsl(220, 14%, 75%)", "hsl(0, 84%, 60%)"];

export default function AdminOverview({ analytics }: OverviewProps) {
  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([name, value]) => ({ name, value }));
  const examTypeData = Object.entries(analytics.examTypeBreakdown || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Primary stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} accent />
        <StatCard title="Pro Users" value={analytics.proUsers} icon={Zap} accent />
        <StatCard title="Total Articles" value={analytics.totalArticles} icon={FileText} />
        <StatCard title="Today's Articles" value={analytics.todayArticles} icon={TrendingUp} accent />
      </div>

      {/* Secondary stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Active Users" value={analytics.activeUsers} icon={Shield} color="text-green-500" />
        <StatCard title="Suspended" value={analytics.suspendedUsers} icon={Ban} color="text-yellow-500" />
        <StatCard title="Banned" value={analytics.bannedUsers} icon={Ban} color="text-destructive" />
        <StatCard title="Exam Articles" value={analytics.examArticles} icon={BookOpen} />
        <StatCard title="Featured" value={analytics.featuredArticles} icon={Star} color="text-amber-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Article Generation (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Growth (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category & Exam breakdown */}
      {(categoryData.length > 0 || examTypeData.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {categoryData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Articles by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => entry.name}>
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          {examTypeData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Exam Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={examTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => entry.name}>
                        {examTypeData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top users & Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Users by Articles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Top Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics.topUsers || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              (analytics.topUsers || []).slice(0, 8).map((u: any, i: number) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-xs">{u.display_name || u.email || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge variant={u.plan === "pro" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">{u.plan}</Badge>
                    <span className="text-xs font-bold">{u.article_count}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics.recentArticles || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No articles yet</p>
            ) : (
              (analytics.recentArticles || []).slice(0, 8).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-xs">{a.topic}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.user_email} · {new Date(a.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {a.featured && <Badge variant="default" className="text-[9px] px-1 py-0">★</Badge>}
                    {a.exam_mode && <Badge variant="secondary" className="text-[9px] px-1 py-0">Exam</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics.recentUsers || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              (analytics.recentUsers || []).slice(0, 8).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-xs">{u.display_name || u.email || "—"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge variant={u.plan === "pro" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">{u.plan}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
