import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, GraduationCap, Heart, HeartHandshake, Users } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import prisma from "@/lib/prisma";
import { formatEuro, percent } from "@/lib/format";
import {
  countActiveProjects,
  countBeneficiaryStudents,
  countEngagedSupporters,
  raisedForProject,
  totalDonationsCollected,
} from "@/lib/queries";
import { projectStatusLabel } from "@/lib/labels";

/** Bannière hero — fichier dans /public (remplacer hero-banner.png pour changer l’image). */
const HERO_IMAGE = "/hero-banner.png";

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof HeartHandshake;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-2 py-2 text-center sm:flex-row sm:text-left">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-fhj-gold-mid shadow-inner">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-fhj-navy md:text-[1.65rem]">{value}</p>
        <p className="text-xs font-medium text-fhj-navy/60 md:text-sm">{label}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [totalCents, etudiantes, actifs, donateursEngages, projects] = await Promise.all([
    totalDonationsCollected(),
    countBeneficiaryStudents(),
    countActiveProjects(),
    countEngagedSupporters(),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const withRaised = await Promise.all(
    projects.map(async (p) => ({
      ...p,
      raised: await raisedForProject(p.id),
    })),
  );

  const projectCards = withRaised.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-fhj-navy">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2 lg:min-h-[520px]">
          <div className="relative z-10 flex flex-col justify-center px-4 py-14 md:px-8 md:py-20 lg:py-24 lg:pl-10 lg:pr-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-fhj-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fhj-gold md:text-sm">
                Fondation Hassen Jiagoo
              </p>
            </div>
            <h1 className="max-w-xl font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-[1.15] text-white md:text-4xl lg:text-[2.75rem]">
              Ensemble, offrons un avenir aux étudiantes de l’île Maurice
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
              Nous croyons en l’éducation comme levier de changement. Votre don aujourd’hui, leur avenir demain.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/don"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fhj-gold via-fhj-gold-mid to-fhj-gold-light px-7 py-3.5 text-sm font-semibold text-fhj-navy shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Heart className="h-4 w-4 fill-fhj-navy/15" strokeWidth={2} />
                Faire un don
              </Link>
              <Link
                href="/projets"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Découvrir nos projets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full">
            <div className="pointer-events-none absolute -right-16 top-0 z-20 hidden h-40 w-40 rounded-full border-4 border-fhj-gold/30 lg:block" />
            <Image
              src={HERO_IMAGE}
              alt="Étudiante sur un campus, souriante, avec des livres et un sac à dos"
              fill
              className="object-cover object-[52%_30%] md:object-[58%_28%] lg:object-[62%_center]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fhj-navy from-0% via-fhj-navy/45 via-35% to-transparent to-100% lg:via-fhj-navy/25" />
            <div className="absolute bottom-6 left-4 right-4 z-10 md:left-8 md:right-8 lg:bottom-10 lg:left-10 lg:max-w-md">
              <blockquote className="rounded-2xl border border-fhj-gold/25 bg-fhj-navy-deep/92 p-5 shadow-2xl backdrop-blur-sm md:p-6">
                <span className="font-[family-name:var(--font-playfair)] text-4xl leading-none text-fhj-gold">“</span>
                <p className="mt-2 text-sm leading-relaxed text-white/95 md:text-base">
                  L’éducation est l’arme la plus puissante qu’on puisse utiliser pour changer le monde.
                </p>
                <footer className="mt-4 text-sm font-medium text-fhj-gold">— Nelson Mandela</footer>
                <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-fhj-gold to-fhj-gold-light" />
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — barre flottante */}
      <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-4 md:-mt-14 md:px-6">
        <div className="rounded-2xl border border-fhj-navy/5 bg-white px-4 py-8 shadow-xl md:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
            <StatCard icon={HeartHandshake} value={formatEuro(totalCents)} label="Dons récoltés" />
            <StatCard icon={GraduationCap} value={String(etudiantes)} label="Étudiantes aidées" />
            <StatCard icon={Users} value={String(donateursEngages)} label="Donateurs engagés" />
            <StatCard icon={BookOpen} value={String(actifs)} label="Projets actifs" />
          </div>
        </div>
      </div>

      {/* Projets */}
      <section className="bg-fhj-section pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4 lg:pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fhj-gold-mid">Nos projets</p>
              <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-tight text-fhj-navy md:text-4xl">
                Agir aujourd’hui pour changer demain
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-fhj-navy/70 md:text-base">
                Chaque campagne finance des bourses et du matériel pour des étudiantes à Maurice. Suivez l’avancement et
                choisissez l’impact que vous voulez soutenir.
              </p>
              <Link
                href="/projets"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fhj-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fhj-navy-mid"
              >
                Voir tous les projets
                <ArrowRight className="h-4 w-4 text-fhj-gold" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 xl:col-span-6 xl:grid-cols-3">
              {projectCards.map((p) => {
                const pct = percent(p.raised, p.goalAmount);
                return (
                  <article
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-fhj-navy/8 bg-white shadow-md transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/projets/${p.slug}`} className="block flex flex-1 flex-col">
                      <div className="relative aspect-[16/11] w-full overflow-hidden">
                        <Image src={p.imageUrl} alt="" fill className="object-cover transition-transform hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 280px" />
                        <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-3 py-1 text-xs font-semibold text-fhj-navy shadow">
                          {projectStatusLabel(p.status)}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-fhj-navy hover:text-fhj-gold-mid">
                          {p.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-fhj-navy/65">{p.description}</p>
                        <div className="mt-4">
                          <div className="mb-2 flex justify-between text-xs font-medium text-fhj-navy/55">
                            <span>{formatEuro(p.raised)}</span>
                            <span>{formatEuro(p.goalAmount)}</span>
                          </div>
                          <ProgressBar value={pct} />
                          <p className="mt-2 text-right text-xs font-semibold text-fhj-navy">{pct}%</p>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="lg:col-span-3 xl:col-span-2">
              <div className="flex h-full min-h-[340px] flex-col justify-between rounded-2xl bg-gradient-to-b from-fhj-navy to-fhj-navy-deep p-8 text-center shadow-xl lg:text-left">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fhj-gold/15 text-fhj-gold lg:mx-0">
                    <HeartHandshake className="h-8 w-8" strokeWidth={1.25} />
                  </div>
                  <h3 className="mt-6 font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-gold md:text-2xl">
                    Chaque don fait la différence
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/80">
                    Votre générosité peut changer le parcours d’une étudiante. Les paiements sont sécurisés ; vous
                    choisissez le projet à soutenir.
                  </p>
                </div>
                <Link
                  href="/don"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fhj-gold via-fhj-gold-mid to-fhj-gold-light px-6 py-3.5 text-sm font-semibold text-fhj-navy shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <Heart className="h-4 w-4 fill-fhj-navy/15" />
                  Faire un don
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
