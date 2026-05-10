import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      donations: {
        where: { status: "COMPLETED" },
        select: { amount: true },
      },
    },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Donateurs</h1>
      <p className="mt-1 text-sm text-fhj-navy/65">Comptes avec rôle donateur et total des dons complétés.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Total dons</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const total = u.donations.reduce((s, d) => s + d.amount, 0);
              return (
                <tr key={u.id} className="border-t border-fhj-navy/10">
                  <td className="px-4 py-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-fhj-navy/70">{u.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">{formatEuro(total)}</span>
                  <Link href={`/admin/utilisateurs/${u.id}`} className="ml-3 text-fhj-gold hover:underline">
                    Détails
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
