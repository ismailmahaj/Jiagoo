"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { BookBadge, BookFulfillmentStatus, BookPublicationStatus, BookType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Accès refusé");
  }
  return session.user.id;
}

const optionalUrl = z.preprocess(
  (v) => (v == null || String(v).trim() === "" ? undefined : String(v).trim()),
  z.string().url().optional(),
);

/** PDF distant (https) ou chemin serveur `uploads/books/…` (fichier non public). */
const optionalPdfRef = z.preprocess(
  (v) => (v == null || String(v).trim() === "" ? undefined : String(v).trim()),
  z
    .string()
    .refine(
      (s) => z.string().url().safeParse(s).success || /^uploads\/books\/[a-zA-Z0-9._-]+$/.test(s),
      "URL ou chemin uploads/books/…",
    )
    .optional(),
);

const bookSchema = z.object({
  title: z.string().min(2),
  author: z.string().min(1),
  shortDescription: z.string().min(5),
  longDescription: z.string().min(10),
  coverImage: z.string().url(),
  type: z.enum(["EBOOK", "PHYSICAL", "FREE"]),
  priceEuro: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  pdfUrl: optionalPdfRef,
  epubUrl: optionalUrl,
  pages: z.number().int().positive().optional(),
  language: z.string().min(1),
  category: z.string().optional(),
  badge: z.enum(["NONE", "NEW", "SOLIDARITY", "BESTSELLER"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

function parsePages(formData: FormData): number | undefined {
  const raw = formData.get("pages");
  if (raw == null || !String(raw).trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function emptyToUndef(s: unknown): string | undefined {
  const v = String(s ?? "").trim();
  return v || undefined;
}

export async function adminCreateBook(_prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    shortDescription: formData.get("shortDescription"),
    longDescription: formData.get("longDescription"),
    coverImage: formData.get("coverImage"),
    type: formData.get("type"),
    priceEuro: formData.get("priceEuro"),
    stock: formData.get("stock"),
    pdfUrl: emptyToUndef(formData.get("pdfUrl")),
    epubUrl: emptyToUndef(formData.get("epubUrl")),
    pages: parsePages(formData),
    language: formData.get("language"),
    category: emptyToUndef(formData.get("category")),
    badge: formData.get("badge"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Vérifiez les champs obligatoires et les URLs." };
  }
  const d = parsed.data;
  const type = d.type as BookType;
  const price = Math.round(d.priceEuro * 100);
  if (type === "FREE" && price !== 0) {
    return { ok: false as const, error: "Un livre gratuit doit avoir un prix de 0 €." };
  }
  if (type !== "FREE" && price < 50) {
    return { ok: false as const, error: "Prix minimum 0,50 € (contrainte Stripe)." };
  }

  let base = slugify(d.title);
  let slug = base;
  let n = 1;
  while (await prisma.book.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.book.create({
    data: {
      slug,
      title: d.title.trim(),
      author: d.author.trim(),
      shortDescription: d.shortDescription.trim(),
      longDescription: d.longDescription.trim(),
      coverImage: d.coverImage.trim(),
      type,
      price,
      stock: d.stock,
      pdfUrl: d.pdfUrl?.trim() || null,
      epubUrl: d.epubUrl?.trim() || null,
      pages: d.pages ?? null,
      language: d.language.trim(),
      category: d.category?.trim() || null,
      badge: d.badge as BookBadge,
      status: d.status as BookPublicationStatus,
    },
  });
  await prisma.adminLog.create({ data: { userId: adminId, action: "BOOK_CREATE", details: slug } });
  revalidatePath("/livres");
  revalidatePath("/admin/books");
  return { ok: true as const };
}

export async function adminUpdateBook(bookId: string, _prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    shortDescription: formData.get("shortDescription"),
    longDescription: formData.get("longDescription"),
    coverImage: formData.get("coverImage"),
    type: formData.get("type"),
    priceEuro: formData.get("priceEuro"),
    stock: formData.get("stock"),
    pdfUrl: emptyToUndef(formData.get("pdfUrl")),
    epubUrl: emptyToUndef(formData.get("epubUrl")),
    pages: parsePages(formData),
    language: formData.get("language"),
    category: emptyToUndef(formData.get("category")),
    badge: formData.get("badge"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides." };
  }
  const d = parsed.data;
  const type = d.type as BookType;
  const price = Math.round(d.priceEuro * 100);
  if (type === "FREE" && price !== 0) {
    return { ok: false as const, error: "Un livre gratuit doit avoir un prix de 0 €." };
  }
  if (type !== "FREE" && price < 50) {
    return { ok: false as const, error: "Prix minimum 0,50 €." };
  }

  const existing = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existing) return { ok: false as const, error: "Livre introuvable." };

  let slug = existing.slug;
  if (d.title.trim() !== existing.title) {
    let base = slugify(d.title);
    slug = base;
    let n = 1;
    while (await prisma.book.findFirst({ where: { slug, NOT: { id: bookId } } })) {
      slug = `${base}-${n++}`;
    }
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      slug,
      title: d.title.trim(),
      author: d.author.trim(),
      shortDescription: d.shortDescription.trim(),
      longDescription: d.longDescription.trim(),
      coverImage: d.coverImage.trim(),
      type,
      price,
      stock: d.stock,
      pdfUrl: d.pdfUrl?.trim() || null,
      epubUrl: d.epubUrl?.trim() || null,
      pages: d.pages ?? null,
      language: d.language.trim(),
      category: d.category?.trim() || null,
      badge: d.badge as BookBadge,
      status: d.status as BookPublicationStatus,
    },
  });
  await prisma.adminLog.create({ data: { userId: adminId, action: "BOOK_UPDATE", details: bookId } });
  revalidatePath("/livres");
  revalidatePath(`/livres/${slug}`);
  revalidatePath("/admin/books");
  revalidatePath(`/admin/books/${bookId}/modifier`);
  return { ok: true as const };
}

export async function adminDeleteBookFromForm(formData: FormData) {
  const adminId = await requireAdmin();
  const id = formData.get("bookId");
  if (typeof id !== "string" || !id) return;
  try {
    await prisma.book.delete({ where: { id } });
  } catch {
    return;
  }
  await prisma.adminLog.create({ data: { userId: adminId, action: "BOOK_DELETE", details: id } });
  revalidatePath("/livres");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

const orderUpdateSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function adminUpdateBookOrder(orderId: string, _prev: unknown, formData: FormData) {
  const adminId = await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    orderStatus: formData.get("orderStatus"),
    trackingNumber: emptyToUndef(formData.get("trackingNumber")),
    adminNote: emptyToUndef(formData.get("adminNote")),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Statut invalide." };
  }
  await prisma.bookOrder.update({
    where: { id: orderId },
    data: {
      orderStatus: parsed.data.orderStatus as BookFulfillmentStatus,
      trackingNumber: parsed.data.trackingNumber?.trim() || null,
      adminNote: parsed.data.adminNote?.trim() || null,
    },
  });
  await prisma.adminLog.create({
    data: { userId: adminId, action: "BOOK_ORDER_UPDATE", details: orderId },
  });
  revalidatePath("/admin/book-orders");
  revalidatePath("/espace-donateur/achats");
  return { ok: true as const };
}
