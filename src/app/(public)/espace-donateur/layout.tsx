import Link from "next/link";

const tabs = [
  { href: "/espace-donateur", label: "Vue d’ensemble" },
  { href: "/espace-donateur/dons", label: "Historique des dons" },
  { href: "/espace-donateur/achats", label: "Mes achats" },
  { href: "/espace-donateur/projets", label: "Projets soutenus" },
  { href: "/espace-donateur/recus", label: "Reçus" },
  { href: "/espace-donateur/profil", label: "Mon profil" },
];

export default function DonateurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy md:text-4xl">
        Espace donateur
      </h1>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-fhj-navy/10 pb-4">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-fhj-navy/70 hover:bg-white hover:text-fhj-navy"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
