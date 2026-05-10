import prisma from "@/lib/prisma";

export default async function AdminLogsPage() {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Journaux admin</h1>
      <p className="mt-1 text-sm text-fhj-navy/65">Traçabilité des actions sensibles.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Détails</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-fhj-navy/10">
                <td className="px-4 py-3 whitespace-nowrap text-fhj-navy/70">
                  {l.createdAt.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">{l.user?.email ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{l.action}</td>
                <td className="max-w-md truncate px-4 py-3 text-fhj-navy/70">{l.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
