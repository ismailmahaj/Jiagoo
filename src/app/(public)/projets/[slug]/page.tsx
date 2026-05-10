import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import prisma from "@/lib/prisma";
import { formatEuro, percent } from "@/lib/format";
import { raisedForProject } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) return { title: "Projet" };
  return { title: p.title, description: p.description.slice(0, 160) };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      donations: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });
  if (!project) notFound();

  const raised = await raisedForProject(project.id);
  const pct = percent(raised, project.goalAmount);
  const gallery = project.gallery?.length ? project.gallery : [project.imageUrl];

  return (
    <article className="pb-20">
      <div className="relative h-[min(52vh,420px)] w-full bg-fhj-navy">
        <Image src={project.imageUrl} alt="" fill className="object-cover opacity-90" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-fhj-navy via-fhj-navy/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 pb-12 md:px-6">
          <h1 className="max-w-3xl font-[family-name:var(--font-playfair)] text-4xl font-semibold text-white md:text-5xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">
              Présentation
            </h2>
            <p className="mt-4 whitespace-pre-line text-fhj-navy/75">
              {project.longDescription || project.description}
            </p>

            <h3 className="mt-12 font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-navy">
              Galerie
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {gallery.map((src, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-fhj-navy/10">
                  <Image src={src} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 33vw" />
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-2xl border border-fhj-navy/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-fhj-navy/60">Objectif financier</p>
              <p className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">
                {formatEuro(project.goalAmount)}
              </p>
              <p className="mt-4 text-sm font-medium text-fhj-navy/60">Montant récolté</p>
              <p className="mt-1 text-2xl font-semibold text-fhj-gold">{formatEuro(raised)}</p>
              <p className="mt-4 text-sm text-fhj-navy/60">Avancement</p>
              <p className="mt-1 text-xl font-semibold text-fhj-navy">{pct}%</p>
              <div className="mt-3">
                <ProgressBar value={pct} />
              </div>
              <Button href={`/don?projet=${project.id}`} variant="primary" className="mt-6 w-full !justify-center">
                Faire un don
              </Button>
            </div>

            <div className="rounded-2xl border border-fhj-navy/10 bg-fhj-cream p-6">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-fhj-navy">
                Dernières contributions
              </h3>
              <p className="mt-1 text-xs text-fhj-navy/55">Montants affichés de façon anonymisée lorsque demandé.</p>
              <ul className="mt-4 space-y-3 text-sm">
                {project.donations.length === 0 && (
                  <li className="text-fhj-navy/55">Soyez la première contribution publique sur ce projet.</li>
                )}
                {project.donations.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-2 border-b border-fhj-navy/10 pb-2 last:border-0"
                  >
                    <span className="text-fhj-navy/80">
                      {d.anonymous
                        ? "Donateur anonyme"
                        : `${d.donorFirstName ?? ""} ${(d.donorLastName ?? "").charAt(0)}.`}
                    </span>
                    <span className="shrink-0 font-medium text-fhj-navy">{formatEuro(d.amount)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/don" className="mt-4 inline-block text-xs font-medium text-fhj-gold hover:underline">
                Participer au prochain palier →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
