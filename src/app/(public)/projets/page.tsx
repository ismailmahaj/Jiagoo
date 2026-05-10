import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import prisma from "@/lib/prisma";
import { formatEuro, percent } from "@/lib/format";
import { raisedForProject } from "@/lib/queries";
import { projectStatusLabel } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Projets",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const withRaised = await Promise.all(
    projects.map(async (p) => ({ ...p, raised: await raisedForProject(p.id) })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold text-fhj-navy md:text-5xl">
        Nos projets
      </h1>
      <p className="mt-4 max-w-2xl text-fhj-navy/75">
        Découvrez les campagnes en cours et terminées. Chaque don est affecté au projet que vous choisissez lors du
        paiement.
      </p>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {withRaised.map((p) => {
          const pct = percent(p.raised, p.goalAmount);
          return (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-fhj-navy/10 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full">
                <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-fhj-navy shadow">
                  {projectStatusLabel(p.status)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">
                  {p.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-fhj-navy/70">{p.description}</p>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs text-fhj-navy/60">
                    <span>Récolté : {formatEuro(p.raised)}</span>
                    <span>Objectif : {formatEuro(p.goalAmount)}</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={`/projets/${p.slug}`} variant="ghost" className="!py-2.5">
                    Voir le projet
                  </Button>
                  <Button href={`/don?projet=${p.id}`} variant="primary" className="!py-2.5">
                    Soutenir ce projet
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {withRaised.length === 0 && (
        <p className="mt-12 text-fhj-navy/60">Aucun projet pour le moment. Revenez bientôt.</p>
      )}
    </div>
  );
}
