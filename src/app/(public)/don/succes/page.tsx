import Link from "next/link";

export default async function DonSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
        ✓
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy md:text-4xl">
        Merci infiniment
      </h1>
      <p className="mt-4 text-fhj-navy/75">
        Votre paiement a été enregistré. Si vous étiez connecté, un reçu est disponible dans votre espace donateur dès
        confirmation par notre banque (quelques instants).
      </p>
      {session_id && (
        <p className="mt-4 text-xs text-fhj-navy/45">Référence de session : {session_id}</p>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/espace-donateur"
          className="rounded-full bg-fhj-gold px-6 py-3 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light"
        >
          Mon espace donateur
        </Link>
        <Link
          href="/projets"
          className="rounded-full border border-fhj-navy/15 px-6 py-3 text-sm font-medium text-fhj-navy hover:bg-white"
        >
          Voir les projets
        </Link>
      </div>
    </div>
  );
}
