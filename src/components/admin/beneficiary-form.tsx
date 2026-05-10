"use client";

import { useActionState } from "react";
import type { Beneficiary, Project } from "@prisma/client";
import { adminCreateBeneficiary, adminUpdateBeneficiary } from "@/app/actions/admin";

export function BeneficiaryCreateForm({ projects }: { projects: Pick<Project, "id" | "title">[] }) {
  const [state, action, pending] = useActionState(adminCreateBeneficiary, null);
  return <BeneficiaryFormInner projects={projects} state={state} action={action} pending={pending} />;
}

export function BeneficiaryEditForm({
  beneficiary,
  projects,
}: {
  beneficiary: Beneficiary;
  projects: Pick<Project, "id" | "title">[];
}) {
  const bound = adminUpdateBeneficiary.bind(null, beneficiary.id);
  const [state, action, pending] = useActionState(bound, null);
  return (
    <BeneficiaryFormInner
      projects={projects}
      state={state}
      action={action}
      pending={pending}
      initial={beneficiary}
    />
  );
}

function BeneficiaryFormInner({
  projects,
  state,
  action,
  pending,
  initial,
}: {
  projects: Pick<Project, "id" | "title">[];
  state: { ok: boolean; error?: string } | null;
  action: (payload: FormData) => void;
  pending: boolean;
  initial?: Beneficiary;
}) {
  return (
    <form action={action} className="max-w-xl space-y-5 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-fhj-navy">Prénom</label>
          <input name="firstName" required defaultValue={initial?.firstName} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Nom</label>
          <input name="lastName" required defaultValue={initial?.lastName} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Âge</label>
        <input name="age" type="number" required min={10} max={99} defaultValue={initial?.age} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Niveau d’étude</label>
        <input name="studyLevel" required defaultValue={initial?.studyLevel} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Description</label>
        <textarea name="description" required rows={4} defaultValue={initial?.description} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Projet associé (facultatif)</label>
        <select name="projectId" defaultValue={initial?.projectId ?? ""} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm">
          <option value="">—</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Statut</label>
        <select name="status" defaultValue={initial?.status ?? "EN_ATTENTE"} className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm">
          <option value="EN_ATTENTE">En attente</option>
          <option value="AIDEE">Aidée</option>
          <option value="TERMINEE">Terminée</option>
        </select>
      </div>
      {state && !state.ok && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Enregistré.</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-fhj-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
