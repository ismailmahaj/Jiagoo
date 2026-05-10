import prisma from "@/lib/prisma";
import { BeneficiaryCreateForm } from "@/components/admin/beneficiary-form";

export default async function AdminNewBeneficiaryPage() {
  const projects = await prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Nouvelle bénéficiaire</h1>
      <div className="mt-8">
        <BeneficiaryCreateForm projects={projects} />
      </div>
    </div>
  );
}
