import Link from "next/link";
import Image from "next/image";
import { BookOpen, Heart, TrendingUp, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { BookCard } from "@/components/books/book-card";
import { countBeneficiaryStudents, countActiveProjects } from "@/lib/queries";
import { bookSalesStats } from "@/lib/book-queries";

export const metadata = {
  title: "Livres & eBooks solidaires",
  description: "Librairie solidaire — chaque achat soutient les bourses de la Fondation Hassen Jiagoo.",
};

export default async function LivresPage() {
  const [books, stats, etudiantes, projetsActifs] = await Promise.all([
    prisma.book.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    }),
    bookSalesStats(),
    countBeneficiaryStudents(),
    countActiveProjects(),
  ]);

  return (
    <div className="bg-fhj-section">
      <section className="relative overflow-hidden bg-gradient-to-br from-fhj-navy via-fhj-navy-mid to-fhj-navy-deep text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-fhj-gold/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fhj-gold">Librairie solidaire</p>
            <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-semibold leading-tight md:text-5xl">
              Livres & eBooks solidaires
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/85">
              Chaque livre acheté aide une étudiante à construire son avenir.
            </p>
            <p className="mt-4 max-w-lg text-sm text-white/70">
              Une partie des ventes est reversée aux projets éducatifs de la Fondation Hassen Jiagoo.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#catalogue" className="rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-8 py-3.5 text-sm font-semibold text-fhj-navy shadow-lg">
                Découvrir les livres
              </a>
              <Link href="/don" className="rounded-full border-2 border-white/80 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                Faire un don
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden max-w-md md:block">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-fhj-gold/30 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80"
                alt=""
                width={600}
                height={750}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:-mt-12 md:px-6">
        <div className="grid gap-4 rounded-2xl border border-white/20 bg-white p-6 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: "Livres vendus", value: String(stats.booksSold) },
            { icon: TrendingUp, label: "Montant généré", value: `${(stats.revenueCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}` },
            { icon: Users, label: "Étudiantes aidées", value: String(etudiantes) },
            { icon: Heart, label: "Projets actifs", value: String(projetsActifs) },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-fhj-navy/5 bg-fhj-cream/50 p-4 text-center">
              <c.icon className="mx-auto h-8 w-8 text-fhj-gold-mid" strokeWidth={1.25} />
              <p className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-bold text-fhj-navy">{c.value}</p>
              <p className="text-xs font-medium text-fhj-navy/55">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy md:text-4xl">Catalogue</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-fhj-navy/65 md:text-base">
            eBooks PDF, ouvrages papier et titres gratuits — le tout au service de l’éducation à Maurice.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
        {books.length === 0 && (
          <p className="mt-12 text-center text-fhj-navy/55">Le catalogue sera bientôt enrichi.</p>
        )}
      </section>

      <section className="border-t border-fhj-navy/10 bg-fhj-navy py-14 text-center text-white">
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">Découvrir nos projets</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">
          Les dons directs complètent les ventes de livres pour financer encore plus de bourses.
        </p>
        <Link href="/projets" className="mt-6 inline-block rounded-full border border-fhj-gold px-8 py-3 text-sm font-semibold text-fhj-gold hover:bg-fhj-gold/10">
          Voir les projets
        </Link>
      </section>
    </div>
  );
}
