import { DonForm } from "@/components/don/don-form";
import prisma from "@/lib/prisma";

export default async function DonPage({
  searchParams,
}: {
  searchParams: Promise<{ projet?: string }>;
}) {
  const { projet } = await searchParams;
  const projects = await prisma.project.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  const defaultProjectId = projet && projects.some((p) => p.id === projet) ? projet : projects[0]?.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <DonForm projects={projects} defaultProjectId={defaultProjectId} />
    </div>
  );
}
