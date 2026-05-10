import Link from "next/link";
import prisma from "@/lib/prisma";
import { beneficiaryStatusLabel } from "@/lib/labels";
import { adminDeleteBeneficiaryFromForm } from "@/app/actions/admin";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-form";

export default async function AdminBeneficiariesPage() {
  const rows = await prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Bénéficiaires</h1>
          <p className="mt-1 text-sm text-fhj-navy/65">Étudiantes accompagnées par la fondation.</p>
        </div>
        <Link
          href="/admin/beneficiaires/nouveau"
          className="rounded-full bg-fhj-gold px-5 py-2.5 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light"
        >
          Ajouter une bénéficiaire
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Âge</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-fhj-navy/10">
                <td className="px-4 py-3 font-medium">
                  {b.firstName} {b.lastName}
                </td>
                <td className="px-4 py-3">{b.age}</td>
                <td className="px-4 py-3">{b.studyLevel}</td>
                <td className="px-4 py-3 text-fhj-navy/75">{b.project?.title ?? "—"}</td>
                <td className="px-4 py-3">{beneficiaryStatusLabel(b.status)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/beneficiaires/${b.id}/modifier`} className="mr-3 text-fhj-gold hover:underline">
                    Modifier
                  </Link>
                  <ConfirmSubmitForm
                    action={adminDeleteBeneficiaryFromForm}
                    confirmMessage="Supprimer cette bénéficiaire ?"
                    className="inline"
                  >
                    <input type="hidden" name="beneficiaryId" value={b.id} />
                    <button type="submit" className="text-red-700 hover:underline">
                      Supprimer
                    </button>
                  </ConfirmSubmitForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
