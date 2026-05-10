import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";
import {
  countActiveProjects,
  countAnonymousDonations,
  countDonors,
  donationsByMonth,
  totalDonationsCollected,
} from "@/lib/queries";

function Chart({ data }: { data: { month: string; totalCents: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.totalCents));
  return (
    <div className="mt-6 flex h-52 items-end gap-2">
      {data.map((d) => {
        const h = Math.round((d.totalCents / max) * 100);
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-fhj-gold to-fhj-gold-light"
              style={{ height: `${Math.max(d.totalCents ? 8 : 0, h)}%` }}
              title={`${d.month} : ${formatEuro(d.totalCents)}`}
            />
            <span className="max-w-[3rem] truncate text-center text-[10px] text-fhj-navy/55">{d.month.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [total, donateurs, anonymes, actifs, byMonth] = await Promise.all([
    totalDonationsCollected(),
    countDonors(),
    countAnonymousDonations(),
    countActiveProjects(),
    donationsByMonth(),
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Tableau de bord</h1>
      <p className="mt-2 text-sm text-fhj-navy/65">Vue synthétique de l’activité de la fondation.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total dons récoltés", value: formatEuro(total) },
          { label: "Donateurs (comptes)", value: String(donateurs) },
          { label: "Dons anonymes", value: String(anonymes) },
          { label: "Projets actifs", value: String(actifs) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-fhj-navy/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-fhj-navy/50">{c.label}</p>
            <p className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-fhj-navy/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-fhj-navy">Dons complétés par mois (12 derniers mois)</h2>
        <Chart data={byMonth} />
      </div>
    </div>
  );
}
