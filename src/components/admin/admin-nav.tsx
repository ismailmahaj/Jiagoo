import Link from "next/link";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/dons", label: "Dons" },
  { href: "/admin/books", label: "Livres" },
  { href: "/admin/book-orders", label: "Commandes livres" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/beneficiaires", label: "Bénéficiaires" },
  { href: "/admin/logs", label: "Journaux" },
];

export function AdminNav() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-fhj-navy p-6 text-white md:h-screen md:w-64 md:border-b-0 md:border-r">
      <Link href="/" className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-white">
        ← Site public
      </Link>
      <p className="mt-2 text-xs uppercase tracking-wider text-fhj-gold">Administration</p>
      <nav className="mt-8 flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
