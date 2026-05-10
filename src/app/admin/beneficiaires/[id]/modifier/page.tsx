import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BeneficiaryEditForm } from "@/components/admin/beneficiary-form";

export default async function AdminEditBeneficiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beneficiary = await prisma.beneficiary.findUnique({ where: { id } });
  if (!beneficiary) notFound();
  const projects = await prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Modifier la bénéficiaire</h1>
      <div className="mt-8">
        <BeneficiaryEditForm beneficiary={beneficiary} projects={projects} />
      </div>
    </div>
  );
}
