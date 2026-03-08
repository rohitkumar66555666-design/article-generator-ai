import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import type { PromptTemplate } from "@/hooks/useAdmin";

const CATEGORIES = ["general", "blog-post", "seo-article", "product-review", "news-article", "exam-prep"];

interface Props {
  templates: PromptTemplate[];
  createTemplate: (t: { name: string; prompt_instruction: string; category: string }) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

interface FormState {
  name: string;
  prompt_instruction: string;
  category: string;
}

const emptyForm: FormState = { name: "", prompt_instruction: "", category: "general" };

export default function AdminTemplates({ templates, createTemplate, updateTemplate, deleteTemplate }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: PromptTemplate) => {
    setEditingId(t.id);
    setForm({ name: t.name, prompt_instruction: t.prompt_instruction, category: t.category });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.prompt_instruction.trim()) return;
    if (editingId) {
      await updateTemplate(editingId, form);
    } else {
      await createTemplate(form);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Prompt Templates</CardTitle>
              <CardDescription>{templates.length} templates</CardDescription>
            </div>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No templates yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => (
                <Card key={t.id} className="relative">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <Badge variant="secondary" className="text-[10px] capitalize mt-1">{t.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={t.is_active}
                          onCheckedChange={(val) => updateTemplate(t.id, { is_active: val })}
                          className="scale-75"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{t.prompt_instruction}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Updated: {new Date(t.updated_at).toLocaleDateString("en-IN")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g. Blog Post Generator"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Prompt Instruction</label>
              <Textarea
                placeholder="Write the AI prompt instruction..."
                rows={5}
                value={form.prompt_instruction}
                onChange={(e) => setForm({ ...form, prompt_instruction: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.prompt_instruction.trim()}>
              {editingId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "<strong>{deleteTarget?.name}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteTemplate(deleteTarget.id);
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
