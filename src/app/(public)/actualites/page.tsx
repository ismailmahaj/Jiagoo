import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités",
};

export default function ActualitesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fhj-gold-mid">Actualités</p>
      <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold text-fhj-navy">
        Bientôt disponible
      </h1>
      <p className="mt-4 text-fhj-navy/70">
        Retrouvez ici prochainement les nouvelles de la fondation, les lancements de campagnes et les témoignages des
        bénéficiaires.
      </p>
    </div>
  );
}
