"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminUpdateDonation } from "@/app/actions/admin";

export type AdminDonationRowData = {
  id: string;
  amount: number;
  status: string;
  anonymous: boolean;
  createdAt: Date;
  donorFirstName: string | null;
  donorLastName: string | null;
  user: { firstName: string; lastName: string } | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-fhj-navy px-3 py-2 text-xs font-semibold text-white hover:bg-fhj-navy-mid disabled:opacity-50"
    >
      {pending ? "…" : "Enregistrer"}
    </button>
  );
}

export function AdminDonationEditRow({
  donation,
  projects,
  currentProjectId,
}: {
  donation: AdminDonationRowData;
  projects: { id: string; title: string }[];
  currentProjectId: string;
}) {
  const [state, action] = useActionState(adminUpdateDonation, null);

  const name = donation.anonymous
    ? "Anonyme"
    : donation.user
      ? `${donation.user.firstName} ${donation.user.lastName}`
      : `${donation.donorFirstName ?? ""} ${donation.donorLastName ?? ""}`.trim() || "—";

  return (
    <tr className="border-t border-fhj-navy/10 align-top">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-fhj-navy/70">
        {donation.createdAt.toLocaleString("fr-FR")}
      </td>
      <td className="px-4 py-3 text-sm">{name}</td>
      <td className="px-4 py-3" colSpan={5}>
        <form action={action} className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <input type="hidden" name="donationId" value={donation.id} />
          <label className="flex min-w-[100px] flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-fhj-navy/50">Montant (€)</span>
            <input
              name="amountEuro"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={(donation.amount / 100).toFixed(2)}
              className="rounded-lg border border-fhj-navy/15 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex min-w-[180px] flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-fhj-navy/50">Projet</span>
            <select
              name="projectId"
              defaultValue={currentProjectId}
              className="rounded-lg border border-fhj-navy/15 px-2 py-1.5 text-sm"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[140px] flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-fhj-navy/50">Statut</span>
            <select name="status" defaultValue={donation.status} className="rounded-lg border border-fhj-navy/15 px-2 py-1.5 text-sm">
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Complété</option>
              <option value="FAILED">Échoué</option>
              <option value="REFUNDED">Remboursé</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-xs text-fhj-navy/80">
            <input type="checkbox" name="anonymous" value="on" defaultChecked={donation.anonymous} className="rounded border-fhj-navy/30" />
            Anonyme
          </label>
          <SaveButton />
          {state && !state.ok && <p className="w-full text-xs text-red-600 lg:w-auto">{state.error}</p>}
          {state?.ok && (
            <p className="text-xs font-medium text-emerald-700">Modifications enregistrées.</p>
          )}
        </form>
      </td>
    </tr>
  );
}
