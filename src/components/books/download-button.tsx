"use client";

type Props = { href: string; label?: string; className?: string };

/** Bouton / lien de téléchargement PDF (eBook payé ou gratuit après commande). */
export function DownloadButton({ href, label = "Télécharger le PDF", className }: Props) {
  return (
    <a
      href={href}
      className={
        className ??
        "inline-flex rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-4 py-2 text-xs font-semibold text-fhj-navy shadow-sm"
      }
    >
      {label}
    </a>
  );
}
