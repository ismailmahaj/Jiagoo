import prisma from "@/lib/prisma";

export async function raisedForProject(projectId: string): Promise<number> {
  const agg = await prisma.donation.aggregate({
    where: { projectId, status: "COMPLETED" },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export async function totalDonationsCollected(): Promise<number> {
  const agg = await prisma.donation.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export async function countDonors(): Promise<number> {
  return prisma.user.count({
    where: { donations: { some: { status: "COMPLETED" } } },
  });
}

export async function countAnonymousDonations(): Promise<number> {
  return prisma.donation.count({
    where: { status: "COMPLETED", anonymous: true },
  });
}

export async function countActiveProjects(): Promise<number> {
  return prisma.project.count({ where: { status: "EN_COURS" } });
}

export async function countBeneficiaryStudents(): Promise<number> {
  return prisma.beneficiary.count({ where: { status: "AIDEE" } });
}

/** Donateurs avec compte + dons marqués anonymes (approximation des « soutiens »). */
export async function countEngagedSupporters(): Promise<number> {
  const [registered, anonymousCompleted] = await Promise.all([
    prisma.user.count({
      where: { donations: { some: { status: "COMPLETED" } } },
    }),
    prisma.donation.count({
      where: { status: "COMPLETED", anonymous: true },
    }),
  ]);
  return registered + anonymousCompleted;
}

/** Agrégat des dons complétés par mois (12 derniers mois). */
export async function donationsByMonth(): Promise<{ month: string; totalCents: number }[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.donation.findMany({
    where: { status: "COMPLETED", createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }

  const out: { month: string; totalCents: number }[] = [];
  const d = new Date(since);
  for (let i = 0; i < 12; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      month: key,
      totalCents: map.get(key) ?? 0,
    });
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}
