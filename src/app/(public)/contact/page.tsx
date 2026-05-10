import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fhj-gold-mid">Contact</p>
      <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold text-fhj-navy">Nous écrire</h1>
      <p className="mt-4 text-fhj-navy/70">
        Pour les questions sur les dons, les bourses ou un partenariat, merci de préciser l’objet de votre message. Une
        adresse e-mail et un formulaire dédiés pourront être ajoutés ici selon vos canaux officiels.
      </p>
      <div className="mt-10 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-fhj-navy">Île Maurice</p>
        <p className="mt-2 text-sm text-fhj-navy/65">
          Fondation Hassen Jiagoo — complétez cette section avec vos coordonnées réelles (e-mail, téléphone, siège).
        </p>
      </div>
    </div>
  );
}
