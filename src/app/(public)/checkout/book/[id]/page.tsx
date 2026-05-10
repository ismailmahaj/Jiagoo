import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookCheckoutForm } from "@/components/books/book-checkout-form";

export default async function CheckoutBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findFirst({
    where: { id, status: "PUBLISHED" },
  });
  if (!book || book.type === "FREE") notFound();

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-fhj-navy to-fhj-navy-deep py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Link href={`/livres/${book.slug}`} className="text-sm text-fhj-gold hover:underline">
          ← Retour au livre
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="text-white">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold">{book.title}</h1>
            <p className="mt-2 text-fhj-gold-light/90">{book.author}</p>
            <p className="mt-6 text-sm leading-relaxed text-white/75">{book.shortDescription}</p>
          </div>
          <BookCheckoutForm book={book} />
        </div>
      </div>
    </div>
  );
}
