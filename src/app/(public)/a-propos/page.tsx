import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
};

const valeurs = [
  {
    titre: "Solidarité",
    texte: "Nous croyons à la force du collectif et à la responsabilité de soutenir celles qui en ont le plus besoin.",
  },
  {
    titre: "Éducation",
    texte: "L’école et l’enseignement supérieur sont des leviers de liberté : nos bourses visent l’excellence et l’équité.",
  },
  {
    titre: "Transparence",
    texte: "Chaque projet affiche ses objectifs financiers et l’avancement des dons. Les comptes rendus nourrissent la confiance.",
  },
  {
    titre: "Dignité",
    texte: "Les bénéficiaires sont accompagnées avec respect ; leurs parcours sont valorisés, jamais réduits à un simple numéro.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-fhj-gold">La fondation</p>
      <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold text-fhj-navy md:text-5xl">
        À propos
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-fhj-navy/75">
        La Fondation Hassen Jiagoo est une organisation à but non lucratif dédiée aux personnes en situation de
        précarité à Maurice. Notre action prioritaire consiste à financer des bourses pour des étudiantes afin de
        lever les freins financiers à la poursuite d’études.
      </p>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <section className="rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Mission</h2>
          <p className="mt-4 text-fhj-navy/75">
            Mobiliser des ressources financières et humaines pour soutenir l’éducation des jeunes femmes mauriciennes,
            en partenariat avec des établissements et associations locales, avec une gouvernance rigoureuse.
          </p>
        </section>
        <section className="rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Vision</h2>
          <p className="mt-4 text-fhj-navy/75">
            Une île Maurice où chaque étudiante talentueuse puisse accéder à la formation de son choix, indépendamment
            des revenus de sa famille, et contribuer ensuite à la société avec autonomie et fierté.
          </p>
        </section>
      </div>

      <section className="mt-20">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Nos valeurs</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {valeurs.map((v) => (
            <div
              key={v.titre}
              className="rounded-2xl border border-fhj-gold/25 bg-gradient-to-br from-white to-fhj-cream p-6"
            >
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-navy">
                {v.titre}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fhj-navy/75">{v.texte}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
