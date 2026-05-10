import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminBookEditForm } from "@/components/admin/admin-book-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminBookEditPage({ params }: Props) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) notFound();

  return (
    <div>
      <Link href="/admin/books" className="text-sm text-fhj-navy/60 hover:text-fhj-navy">
        ← Retour aux livres
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Modifier le livre</h1>
      <p className="mt-2 text-sm text-fhj-navy/65">{book.title}</p>
      <div className="mt-8">
        <AdminBookEditForm book={book} />
      </div>
    </div>
  );
}
