import Link from "next/link";
import { AdminBookCreateForm } from "@/components/admin/admin-book-form";

export default function AdminBookNewPage() {
  return (
    <div>
      <Link href="/admin/books" className="text-sm text-fhj-navy/60 hover:text-fhj-navy">
        ← Retour aux livres
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Nouveau livre</h1>
      <p className="mt-2 text-sm text-fhj-navy/65">Renseignez les métadonnées ; vous pouvez coller l’URL d’un PDF uploadé (admin).</p>
      <div className="mt-8">
        <AdminBookCreateForm />
      </div>
    </div>
  );
}
