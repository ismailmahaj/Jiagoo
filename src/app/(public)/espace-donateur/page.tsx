import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";
import Link from "next/link";

export default async function DonateurHomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, totalDon, count] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.donation.aggregate({
      where: { userId: session.user.id, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { userId: session.user.id, status: "COMPLETED" } }),
  ]);

  const total = totalDon._sum.amount ?? 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="rounded-2xl border border-fhj-navy/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-fhj-navy/60">Profil</p>
        <p className="mt-2 text-xl font-semibold text-fhj-navy">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-sm text-fhj-navy/65">{user?.email}</p>
        <Link href="/espace-donateur/profil" className="mt-4 inline-block text-sm font-medium text-fhj-gold hover:underline">
          Modifier mes informations →
        </Link>
      </div>
      <div className="rounded-2xl border border-fhj-navy/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-fhj-navy/60">Total de vos dons complétés</p>
        <p className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-gold">
          {formatEuro(total)}
        </p>
        <p className="mt-1 text-sm text-fhj-navy/60">{count} don{count > 1 ? "s" : ""}</p>
        <Link href="/don" className="mt-4 inline-block rounded-full bg-fhj-navy px-5 py-2 text-sm font-medium text-white hover:bg-fhj-navy-mid">
          Nouveau don
        </Link>
      </div>
    </div>
  );
}
