"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { BeneficiaryStatus, PaymentStatus, ProjectStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Accès refusé");
  }
  return session.user.id;
}

async function logAdmin(userId: string, action: string, details?: string) {
  await prisma.adminLog.create({
    data: { userId, action, details },
  });
}

const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  longDescription: z.string().optional(),
  imageUrl: z.string().url(),
  goalEuro: z.coerce.number().positive(),
  status: z.enum(["EN_COURS", "FINANCE", "TERMINE"]),
  gallery: z.string().optional(),
});

export async function adminCreateProject(_prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const galleryRaw = String(formData.get("gallery") || "");
  const gallery = galleryRaw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    longDescription: formData.get("longDescription") || undefined,
    imageUrl: formData.get("imageUrl"),
    goalEuro: formData.get("goalEuro"),
    status: formData.get("status"),
    gallery: galleryRaw,
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides (vérifiez l’URL de l’image et l’objectif)." };
  }

  const goalAmount = Math.round(parsed.data.goalEuro * 100);
  let base = slugify(parsed.data.title);
  let slug = base;
  let n = 1;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.project.create({
    data: {
      title: parsed.data.title.trim(),
      slug,
      description: parsed.data.description.trim(),
      longDescription: parsed.data.longDescription?.trim() || null,
      imageUrl: parsed.data.imageUrl.trim(),
      gallery,
      goalAmount,
      status: parsed.data.status as ProjectStatus,
    },
  });
  await logAdmin(adminId, "PROJECT_CREATE", slug);
  revalidatePath("/projets");
  revalidatePath("/admin/projets");
  revalidatePath("/");
  return { ok: true as const };
}

export async function adminUpdateProject(projectId: string, _prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const galleryRaw = String(formData.get("gallery") || "");
  const gallery = galleryRaw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    longDescription: formData.get("longDescription") || undefined,
    imageUrl: formData.get("imageUrl"),
    goalEuro: formData.get("goalEuro"),
    status: formData.get("status"),
    gallery: galleryRaw,
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides." };
  }

  const goalAmount = Math.round(parsed.data.goalEuro * 100);
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) return { ok: false as const, error: "Projet introuvable." };

  let slug = existing.slug;
  if (parsed.data.title.trim() !== existing.title) {
    let base = slugify(parsed.data.title);
    slug = base;
    let n = 1;
    while (await prisma.project.findFirst({ where: { slug, NOT: { id: projectId } } })) {
      slug = `${base}-${n++}`;
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title: parsed.data.title.trim(),
      slug,
      description: parsed.data.description.trim(),
      longDescription: parsed.data.longDescription?.trim() || null,
      imageUrl: parsed.data.imageUrl.trim(),
      gallery,
      goalAmount,
      status: parsed.data.status as ProjectStatus,
    },
  });
  await logAdmin(adminId, "PROJECT_UPDATE", projectId);
  revalidatePath("/projets");
  revalidatePath(`/projets/${slug}`);
  revalidatePath("/admin/projets");
  revalidatePath(`/admin/projets/${projectId}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function adminDeleteProject(projectId: string) {
  const adminId = await requireAdmin();
  await prisma.project.delete({ where: { id: projectId } });
  await logAdmin(adminId, "PROJECT_DELETE", projectId);
  revalidatePath("/projets");
  revalidatePath("/admin/projets");
  revalidatePath("/");
}

export async function adminDeleteProjectFromForm(formData: FormData) {
  const id = formData.get("projectId");
  if (typeof id !== "string" || !id) return;
  await adminDeleteProject(id);
}

const beneficiarySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.coerce.number().int().min(10).max(99),
  studyLevel: z.string().min(1),
  description: z.string().min(5),
  projectId: z.string().optional(),
  status: z.enum(["EN_ATTENTE", "AIDEE", "TERMINEE"]),
});

export async function adminCreateBeneficiary(_prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const projectRaw = String(formData.get("projectId") ?? "").trim();
  const parsed = beneficiarySchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    age: formData.get("age"),
    studyLevel: formData.get("studyLevel"),
    description: formData.get("description"),
    projectId: projectRaw || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Champs invalides." };
  }
  const projectId = parsed.data.projectId || null;
  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId } });
    if (!p) return { ok: false as const, error: "Projet invalide." };
  }

  await prisma.beneficiary.create({
    data: {
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      age: parsed.data.age,
      studyLevel: parsed.data.studyLevel.trim(),
      description: parsed.data.description.trim(),
      status: parsed.data.status as BeneficiaryStatus,
      projectId,
    },
  });
  await logAdmin(adminId, "BENEFICIARY_CREATE", parsed.data.lastName);
  revalidatePath("/admin/beneficiaires");
  return { ok: true as const };
}

export async function adminUpdateBeneficiary(id: string, _prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const projectRaw = String(formData.get("projectId") ?? "").trim();
  const parsed = beneficiarySchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    age: formData.get("age"),
    studyLevel: formData.get("studyLevel"),
    description: formData.get("description"),
    projectId: projectRaw || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Champs invalides." };
  }
  const projectId = parsed.data.projectId || null;
  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId } });
    if (!p) return { ok: false as const, error: "Projet invalide." };
  }

  await prisma.beneficiary.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      age: parsed.data.age,
      studyLevel: parsed.data.studyLevel.trim(),
      description: parsed.data.description.trim(),
      status: parsed.data.status as BeneficiaryStatus,
      projectId,
    },
  });
  await logAdmin(adminId, "BENEFICIARY_UPDATE", id);
  revalidatePath("/admin/beneficiaires");
  return { ok: true as const };
}

export async function adminDeleteBeneficiary(id: string) {
  const adminId = await requireAdmin();
  await prisma.beneficiary.delete({ where: { id } });
  await logAdmin(adminId, "BENEFICIARY_DELETE", id);
  revalidatePath("/admin/beneficiaires");
}

export async function adminDeleteBeneficiaryFromForm(formData: FormData) {
  const id = formData.get("beneficiaryId");
  if (typeof id !== "string" || !id) return;
  await adminDeleteBeneficiary(id);
}

const donationUpdateSchema = z.object({
  donationId: z.string().min(1),
  amountEuro: z.coerce.number().positive(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
  projectId: z.string().min(1),
});

export async function adminUpdateDonation(_prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const anonymous = formData.get("anonymous") === "on";
  const parsed = donationUpdateSchema.safeParse({
    donationId: formData.get("donationId"),
    amountEuro: formData.get("amountEuro"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Données du don invalides." };
  }

  const { donationId, amountEuro, status, projectId } = parsed.data;
  const amount = Math.round(amountEuro * 100);

  const existing = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { project: true },
  });
  if (!existing) {
    return { ok: false as const, error: "Don introuvable." };
  }

  const targetProject = await prisma.project.findUnique({ where: { id: projectId } });
  if (!targetProject) {
    return { ok: false as const, error: "Projet cible introuvable." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.donation.update({
      where: { id: donationId },
      data: {
        amount,
        status: status as PaymentStatus,
        projectId,
        anonymous,
      },
    });
    if (status !== "COMPLETED") {
      await tx.receipt.deleteMany({ where: { donationId } });
    }
  });

  await logAdmin(
    adminId,
    "DONATION_UPDATE",
    `${donationId} → ${amount / 100} €, ${status}, projet ${projectId}`,
  );

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/admin/dons");
  revalidatePath("/admin/projets");
  revalidatePath(`/admin/projets/${existing.projectId}`);
  revalidatePath(`/admin/projets/${projectId}`);
  revalidatePath(`/projets/${existing.project.slug}`);
  if (targetProject.slug !== existing.project.slug) {
    revalidatePath(`/projets/${targetProject.slug}`);
  }
  for (const path of ["/espace-donateur", "/espace-donateur/dons", "/espace-donateur/projets", "/espace-donateur/recus"]) {
    revalidatePath(path);
  }

  return { ok: true as const };
}
