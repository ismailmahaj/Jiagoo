import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { MobileNav } from "@/components/site-mobile-nav";
import { SiteLogo } from "@/components/site-logo";
import { HeaderNavLinks, type NavItem } from "@/components/header-nav-links";

const navItems: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/projets", label: "Projets" },
  { href: "/livres", label: "Livres" },
  { href: "/don", label: "Faire un don" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative sticky top-0 z-50 border-b border-fhj-gold/20 bg-fhj-navy shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-6 md:px-6 md:py-4">
        <SiteLogo />

        <nav className="hidden flex-1 justify-center lg:flex">
          <HeaderNavLinks items={navItems} />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link
                href="/espace-donateur"
                className="rounded-full border border-fhj-gold/50 px-4 py-2 text-sm font-medium text-fhj-gold transition-colors hover:border-fhj-gold hover:bg-fhj-gold/10"
              >
                Espace donateur
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-fhj-gold-light/90 hover:text-fhj-gold-light"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Déconnexion
              </Link>
            </>
          ) : (
            <Link
              href="/connexion"
              className="rounded-full border border-fhj-gold px-4 py-2 text-sm font-medium text-fhj-gold transition-all hover:bg-fhj-gold/10"
            >
              Se connecter
            </Link>
          )}
          <Link
            href="/don"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fhj-gold via-fhj-gold-mid to-fhj-gold-light px-5 py-2.5 text-sm font-semibold text-fhj-navy shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <Heart className="h-4 w-4 fill-fhj-navy/20" strokeWidth={2} />
            Faire un don
          </Link>
        </div>

        <MobileNav session={session} isAdmin={isAdmin} items={navItems} />
      </div>
    </header>
  );
}
