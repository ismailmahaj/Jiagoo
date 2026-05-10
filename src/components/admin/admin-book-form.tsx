"use client";

import { useActionState, useState } from "react";
import type { Book } from "@prisma/client";
import { adminCreateBook, adminUpdateBook } from "@/app/actions/admin-books";

export function AdminBookCreateForm() {
  const [state, action, pending] = useActionState(adminCreateBook, null);
  return <AdminBookFormInner state={state} action={action} pending={pending} />;
}

export function AdminBookEditForm({ book }: { book: Book }) {
  const bound = adminUpdateBook.bind(null, book.id);
  const [state, action, pending] = useActionState(bound, null);
  return <AdminBookFormInner state={state} action={action} pending={pending} initial={book} />;
}

function AdminBookFormInner({
  state,
  action,
  pending,
  initial,
}: {
  state: { ok: boolean; error?: string } | null;
  action: (fd: FormData) => void;
  pending: boolean;
  initial?: Book;
}) {
  const [pdfUrl, setPdfUrl] = useState(initial?.pdfUrl ?? "");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadPdf = async (file: File | null) => {
    setUploadMsg(null);
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/books/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setUploadMsg(data.error || "Échec de l’upload.");
        return;
      }
      if (data.url) {
        setPdfUrl(data.url);
        setUploadMsg("PDF enregistré — URL insérée ci-dessous.");
      }
    } catch {
      setUploadMsg("Erreur réseau.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Titre</label>
          <input name="title" required defaultValue={initial?.title} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Auteur</label>
          <input name="author" required defaultValue={initial?.author} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Langue</label>
          <input name="language" required defaultValue={initial?.language ?? "fr"} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Description courte</label>
          <textarea name="shortDescription" required rows={3} defaultValue={initial?.shortDescription} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Description longue</label>
          <textarea name="longDescription" required rows={6} defaultValue={initial?.longDescription} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">URL couverture</label>
          <input name="coverImage" type="url" required defaultValue={initial?.coverImage} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Type</label>
          <select name="type" required defaultValue={initial?.type ?? "EBOOK"} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="EBOOK">eBook</option>
            <option value="PHYSICAL">Physique</option>
            <option value="FREE">Gratuit</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Prix (€)</label>
          <input name="priceEuro" type="number" step="0.01" min={0} required defaultValue={initial ? (initial.price / 100).toFixed(2) : "9.99"} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Stock</label>
          <input name="stock" type="number" min={0} required defaultValue={initial?.stock ?? 100} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Pages</label>
          <input name="pages" type="number" min={1} defaultValue={initial?.pages ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Catégorie</label>
          <input name="category" defaultValue={initial?.category ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">URL PDF (eBook / gratuit)</label>
          <input
            name="pdfUrl"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://… ou uploads/books/… (après upload)"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-fhj-navy/15 bg-fhj-cream/40 px-3 py-2 text-xs font-medium text-fhj-navy hover:bg-fhj-cream">
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  void uploadPdf(f ?? null);
                  e.target.value = "";
                }}
                disabled={uploading}
              />
              {uploading ? "Upload…" : "Uploader un PDF (serveur)"}
            </label>
            {uploadMsg && <span className="text-xs text-fhj-navy/65">{uploadMsg}</span>}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase text-fhj-navy/55">URL EPUB (optionnel)</label>
          <input name="epubUrl" type="url" defaultValue={initial?.epubUrl ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Badge</label>
          <select name="badge" defaultValue={initial?.badge ?? "NONE"} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="NONE">Aucun</option>
            <option value="NEW">Nouveau</option>
            <option value="SOLIDARITY">Solidaire</option>
            <option value="BESTSELLER">Bestseller</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-fhj-navy/55">Statut</label>
          <select name="status" defaultValue={initial?.status ?? "DRAFT"} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>
      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm font-medium text-emerald-700">Enregistré.</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-fhj-navy px-8 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "…" : initial ? "Mettre à jour" : "Créer le livre"}
      </button>
    </form>
  );
}
