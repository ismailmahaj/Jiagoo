"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function updateDonorProfile(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Non authentifié." };
  }
  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Vérifiez les champs obligatoires." };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      phone: parsed.data.phone?.trim() || null,
    },
  });
  revalidatePath("/espace-donateur");
  revalidatePath("/espace-donateur/profil");
  return { ok: true as const };
}
