"use client";

import { useActionState } from "react";
import type { Project } from "@prisma/client";
import { adminUpdateProject } from "@/app/actions/admin";

export function ProjectEditForm({ project }: { project: Project }) {
  const bound = adminUpdateProject.bind(null, project.id);
  const [state, action, pending] = useActionState(bound, null);

  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Modifier le projet</h1>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Titre</label>
        <input name="title" required defaultValue={project.title} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Description courte</label>
        <textarea name="description" required rows={3} defaultValue={project.description} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Description longue</label>
        <textarea name="longDescription" rows={5} defaultValue={project.longDescription ?? ""} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">URL de l’image principale</label>
        <input name="imageUrl" type="url" required defaultValue={project.imageUrl} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Galerie (URLs, une par ligne)</label>
        <textarea name="gallery" rows={3} defaultValue={project.gallery.join("\n")} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-fhj-navy">Objectif (€)</label>
          <input
            name="goalEuro"
            type="number"
            step="0.01"
            min="1"
            required
            defaultValue={(project.goalAmount / 100).toFixed(2)}
            className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Statut</label>
          <select name="status" defaultValue={project.status} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm">
            <option value="EN_COURS">En cours</option>
            <option value="FINANCE">Financé</option>
            <option value="TERMINE">Terminé</option>
          </select>
        </div>
      </div>
      {state && !state.ok && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Projet mis à jour.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-fhj-navy px-6 py-3 text-sm font-semibold text-white hover:bg-fhj-navy-mid disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
