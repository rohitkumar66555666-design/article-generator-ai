import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, UserX, Ban, Trash2, CheckCircle } from "lucide-react";
import type { AdminUser } from "@/hooks/useAdmin";

interface Props {
  users: AdminUser[];
  updatePlan: (userId: string, plan: string) => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export default function AdminUsers({ users, updatePlan, updateUserStatus, deleteUser }: Props) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id.includes(search);
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      suspended: "outline",
      banned: "destructive",
    };
    return <Badge variant={map[status] || "secondary"} className="capitalize text-[10px]">{status}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">User Management</CardTitle>
          <CardDescription>{users.length} total users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-28 h-9 text-xs">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">User ID</TableHead>
                  <TableHead className="text-xs">Plan</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Articles</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm truncate max-w-40">{u.display_name || "—"}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-40">{u.email || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-[10px] text-muted-foreground">
                        {u.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={u.plan} onValueChange={(val) => updatePlan(u.user_id, val)}>
                          <SelectTrigger className="w-20 h-7 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{u.article_count}</TableCell>
                      <TableCell>{statusBadge(u.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {u.status !== "active" && (
                              <DropdownMenuItem onClick={() => updateUserStatus(u.user_id, "active")}>
                                <CheckCircle className="h-3.5 w-3.5 mr-2" /> Activate
                              </DropdownMenuItem>
                            )}
                            {u.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => updateUserStatus(u.user_id, "suspended")}>
                                <UserX className="h-3.5 w-3.5 mr-2" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {u.status !== "banned" && (
                              <DropdownMenuItem onClick={() => updateUserStatus(u.user_id, "banned")}>
                                <Ban className="h-3.5 w-3.5 mr-2" /> Ban
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(u)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile for <strong>{deleteTarget?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteUser(deleteTarget.user_id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
