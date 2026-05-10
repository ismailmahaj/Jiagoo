import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-fhj-navy/10 bg-fhj-navy text-fhj-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-wide text-fhj-gold">
            Fondation Hassen Jiagoo
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Nous finançons des bourses et accompagnons des étudiantes à Maurice pour leur offrir dignité et
            perspectives d’avenir.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-fhj-gold">Liens</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/a-propos" className="hover:text-white">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/projets" className="hover:text-white">
                Projets
              </Link>
            </li>
            <li>
              <Link href="/don" className="hover:text-white">
                Faire un don
              </Link>
            </li>
            <li>
              <Link href="/connexion" className="hover:text-white">
                Espace donateur
              </Link>
            </li>
            <li>
              <Link href="/actualites" className="hover:text-white">
                Actualités
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-fhj-gold">Contact</p>
          <p className="mt-4 text-sm text-white/75">
            Pour toute question sur les dons ou les bourses, écrivez-nous depuis la page de don ou contactez votre
            interlocuteur habituel auprès de la fondation.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Fondation Hassen Jiagoo — Tous droits réservés.
      </div>
    </footer>
  );
}
