import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectEditForm } from "@/components/admin/project-edit-form";

export default async function AdminEditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();
  return <ProjectEditForm project={project} />;
}
