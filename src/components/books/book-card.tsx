import Image from "next/image";
import Link from "next/link";
import type { Book } from "@prisma/client";
import { formatEuro } from "@/lib/format";
import { bookBadgeLabel, bookTypeLabel } from "@/lib/books-labels";

export function BookCard({ book }: { book: Book }) {
  const badge = bookBadgeLabel(book.badge);
  const isFree = book.type === "FREE";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg transition-shadow hover:shadow-xl">
      <Link href={`/livres/${book.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-fhj-navy/5">
        <Image
          src={book.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 50vw, 280px"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-3 py-1 text-xs font-semibold text-fhj-navy">
              {badge}
            </span>
          )}
          <span className="rounded-full bg-fhj-navy/90 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {bookTypeLabel(book.type)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/livres/${book.slug}`}>
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-fhj-navy group-hover:text-fhj-gold-mid">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-fhj-gold-mid">{book.author}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-fhj-navy/70">{book.shortDescription}</p>
        <p className="mt-4 font-[family-name:var(--font-playfair)] text-xl font-bold text-fhj-navy">
          {isFree ? "Gratuit" : formatEuro(book.price)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/livres/${book.slug}`}
            className="flex-1 rounded-full border border-fhj-navy/15 py-2.5 text-center text-sm font-medium text-fhj-navy hover:border-fhj-gold/50"
          >
            Voir le livre
          </Link>
          <Link
            href={isFree ? `/livres/${book.slug}` : `/checkout/book/${book.id}`}
            className="flex-1 rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light py-2.5 text-center text-sm font-semibold text-fhj-navy hover:opacity-95"
          >
            {isFree ? "Obtenir" : "Acheter"}
          </Link>
        </div>
      </div>
    </article>
  );
}
