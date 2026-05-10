"use client";

import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Session } from "next-auth";
import type { NavItem } from "@/components/header-nav-links";

export function MobileNav({
  session,
  isAdmin,
  items,
}: {
  session: Session | null;
  isAdmin: boolean;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 md:hidden">
      <Link
        href="/don"
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-3 py-2 text-xs font-semibold text-fhj-navy"
      >
        <Heart className="h-3.5 w-3.5" />
        Don
      </Link>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="rounded-lg border border-fhj-gold/40 p-2 text-fhj-gold"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute left-2 right-2 top-[calc(100%+8px)] z-50 flex max-h-[85vh] flex-col gap-1 overflow-y-auto rounded-xl border border-fhj-gold/20 bg-fhj-navy-deep p-4 shadow-2xl">
          {items.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-fhj-gold/15 text-fhj-gold-light" : "text-white/85 hover:bg-white/5"
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          {session ? (
            <>
              <Link
                href="/espace-donateur"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fhj-gold hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Espace donateur
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-fhj-gold-light"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="rounded-lg px-3 py-2.5 text-sm text-white/60"
                onClick={() => setOpen(false)}
              >
                Déconnexion
              </Link>
            </>
          ) : (
            <Link
              href="/connexion"
              className="mt-1 rounded-lg border border-fhj-gold/50 px-3 py-2.5 text-center text-sm font-medium text-fhj-gold"
              onClick={() => setOpen(false)}
            >
              Se connecter
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
