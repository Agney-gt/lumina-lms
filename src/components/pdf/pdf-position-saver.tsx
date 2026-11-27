"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";

export function PdfPositionSaver({
  pdfId,
  totalPages,
  initialPage,
}: {
  pdfId: string;
  totalPages: number;
  initialPage: number;
}) {
  const [page, setPage] = useState(String(initialPage));
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = Number(page);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > totalPages) {
      toast.error(`Enter a page between 1 and ${totalPages}`);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/pdf/${pdfId}/progress`, { page: parsed });
      toast.success(`Reading position saved at page ${parsed}`);
    } catch {
      toast.error("Could not save position");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="pdf-page" className="text-sm text-muted-foreground">
        Page
      </label>
      <Input
        id="pdf-page"
        type="number"
        min={1}
        max={totalPages}
        value={page}
        onChange={(e) => setPage(e.target.value)}
        className="w-20"
      />
      <Button onClick={save} disabled={saving} size="sm" variant="outline">
        <Bookmark className="size-4" aria-hidden="true" />
        {saving ? "Saving…" : "Save position"}
      </Button>
    </div>
  );
}
