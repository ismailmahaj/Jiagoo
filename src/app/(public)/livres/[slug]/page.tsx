import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";
import { bookBadgeLabel, bookTypeLabel } from "@/lib/books-labels";
import { BookFreeClaim } from "@/components/books/book-free-claim";
import { BookCard } from "@/components/books/book-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const b = await prisma.book.findUnique({ where: { slug, status: "PUBLISHED" } });
  if (!b) return { title: "Livre" };
  return { title: b.title, description: b.shortDescription.slice(0, 160) };
}

export default async function LivreDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await prisma.book.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!book) notFound();

  const similarWhere =
    book.category != null && book.category.trim() !== ""
      ? { status: "PUBLISHED" as const, id: { not: book.id }, category: book.category }
      : { status: "PUBLISHED" as const, id: { not: book.id } };

  const similar = await prisma.book.findMany({
    where: similarWhere,
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const badge = bookBadgeLabel(book.badge);
  const isFree = book.type === "FREE";

  return (
    <article className="bg-fhj-section pb-20">
      <div className="border-b border-fhj-navy/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16 lg:gap-16">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-fhj-navy/10 shadow-xl">
            <Image src={book.coverImage} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" priority />
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {badge && (
                <span className="rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-3 py-1 text-xs font-semibold text-fhj-navy">
                  {badge}
                </span>
              )}
              <span className="rounded-full bg-fhj-navy/10 px-3 py-1 text-xs font-medium text-fhj-navy">{bookTypeLabel(book.type)}</span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy md:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-fhj-gold-mid">{book.author}</p>
            <p className="mt-6 text-2xl font-bold text-fhj-navy">{isFree ? "Gratuit" : formatEuro(book.price)}</p>
            <ul className="mt-6 space-y-2 text-sm text-fhj-navy/75">
              <li>
                <span className="font-medium text-fhj-navy">Formats :</span>{" "}
                {book.type === "EBOOK" || book.type === "FREE" ? "PDF" : "—"}
                {book.epubUrl ? " · EPUB" : ""}
                {book.type === "PHYSICAL" ? " · Livre physique" : ""}
              </li>
              {book.pages != null && (
                <li>
                  <span className="font-medium text-fhj-navy">Pages :</span> {book.pages}
                </li>
              )}
              <li>
                <span className="font-medium text-fhj-navy">Langue :</span> {book.language}
              </li>
              {book.type === "PHYSICAL" && (
                <li>
                  <span className="font-medium text-fhj-navy">Stock :</span> {book.stock} exemplaire(s)
                </li>
              )}
            </ul>
            <p className="mt-6 rounded-xl border border-fhj-gold/25 bg-fhj-gold/10 px-4 py-3 text-sm text-fhj-navy/85">
              Une partie de cette vente soutient les bourses étudiantes de la Fondation Hassen Jiagoo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {!isFree && (
                <Link
                  href={`/checkout/book/${book.id}`}
                  className="inline-flex rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-10 py-3.5 text-sm font-semibold text-fhj-navy shadow-lg"
                >
                  Acheter maintenant
                </Link>
              )}
              <Link href="/projets" className="inline-flex items-center rounded-full border-2 border-fhj-navy/20 px-8 py-3.5 text-sm font-semibold text-fhj-navy hover:border-fhj-gold/50">
                Découvrir les projets
              </Link>
            </div>
            {isFree && (
              <div className="mt-8 max-w-md">
                <BookFreeClaim bookId={book.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-navy">Présentation</h2>
        <p className="mt-4 whitespace-pre-line text-fhj-navy/80">{book.longDescription}</p>
      </div>

      {similar.length > 0 && (
        <div className="mx-auto max-w-7xl border-t border-fhj-navy/10 px-4 pt-12 md:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Titres similaires</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
