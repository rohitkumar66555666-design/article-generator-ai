import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, Zap, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface OverviewProps {
  analytics: {
    totalUsers: number;
    proUsers: number;
    totalArticles: number;
    todayArticles: number;
    dailyTrend: { date: string; count: number }[];
    userGrowth: { date: string; count: number }[];
    recentArticles: any[];
    recentUsers: any[];
  };
}

function StatCard({ title, value, icon: Icon, accent = false }: { title: string; value: number | string; icon: any; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-accent/10" : "bg-secondary"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-muted-foreground"}`} />
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

export default function AdminOverview({ analytics }: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} accent />
        <StatCard title="Pro Users" value={analytics.proUsers} icon={Zap} accent />
        <StatCard title="Total Articles" value={analytics.totalArticles} icon={FileText} />
        <StatCard title="Today's Articles" value={analytics.todayArticles} icon={TrendingUp} accent />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Article Generation (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">User Growth (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No articles yet</p>
            ) : (
              analytics.recentArticles.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{a.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.user_email} · {new Date(a.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {a.featured && <Badge variant="default" className="text-[10px] px-1.5 py-0">Featured</Badge>}
                    {a.exam_mode && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Exam</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              analytics.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{u.display_name || u.email || "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge variant={u.plan === "pro" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">{u.plan}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-IN")}</span>
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
