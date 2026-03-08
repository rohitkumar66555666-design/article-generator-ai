import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Star, StarOff, Trash2, Eye, EyeOff } from "lucide-react";
import type { AdminArticle } from "@/hooks/useAdmin";

interface Props {
  articles: AdminArticle[];
  toggleArticleFeatured: (id: string, featured: boolean) => Promise<void>;
  updateArticleStatus: (id: string, status: string) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

export default function AdminArticles({ articles, toggleArticleFeatured, updateArticleStatus, deleteArticle }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminArticle | null>(null);

  const filtered = articles.filter((a) => {
    const matchSearch =
      !search ||
      a.topic.toLowerCase().includes(search.toLowerCase()) ||
      a.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Article Management</CardTitle>
          <CardDescription>{articles.length} total articles generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by topic or user email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Topic</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Author</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {a.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <span className="font-medium text-sm truncate max-w-48">{a.topic}</span>
                        </div>
                        {a.exam_mode && (
                          <span className="text-[10px] text-muted-foreground">Exam: {a.exam_type || "General"}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono truncate max-w-32">
                        {a.user_email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[10px] capitalize">{a.category || "general"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={a.status === "published" ? "default" : "outline"}
                          className="text-[10px] capitalize"
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleArticleFeatured(a.id, !a.featured)}>
                              {a.featured ? <StarOff className="h-3.5 w-3.5 mr-2" /> : <Star className="h-3.5 w-3.5 mr-2" />}
                              {a.featured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateArticleStatus(a.id, a.status === "published" ? "hidden" : "published")}>
                              {a.status === "published" ? <EyeOff className="h-3.5 w-3.5 mr-2" /> : <Eye className="h-3.5 w-3.5 mr-2" />}
                              {a.status === "published" ? "Hide" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(a)}>
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
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "<strong>{deleteTarget?.topic}</strong>". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteArticle(deleteTarget.id);
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
