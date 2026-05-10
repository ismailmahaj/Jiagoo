import Link from "next/link";
import type { Book } from "@prisma/client";
import { bookStatusLabel, bookTypeLabel } from "@/lib/books-labels";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-form";
import { adminDeleteBookFromForm } from "@/app/actions/admin-books";

export function AdminBookTable({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return <p className="rounded-2xl border border-fhj-navy/10 bg-white p-8 text-center text-sm text-fhj-navy/55">Aucun livre.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/60">
          <tr>
            <th className="px-4 py-3">Titre</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Prix</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className="border-t border-fhj-navy/10">
              <td className="px-4 py-3">
                <div className="font-medium text-fhj-navy">{b.title}</div>
                <div className="text-xs text-fhj-navy/55">{b.author}</div>
              </td>
              <td className="px-4 py-3">{bookTypeLabel(b.type)}</td>
              <td className="px-4 py-3">{(b.price / 100).toFixed(2)} €</td>
              <td className="px-4 py-3">{b.stock}</td>
              <td className="px-4 py-3 text-xs">{bookStatusLabel(b.status)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/livres/${b.slug}`}
                    className="rounded-full border border-fhj-navy/15 px-3 py-1 text-xs font-medium text-fhj-navy hover:bg-fhj-navy/5"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/books/${b.id}/modifier`}
                    className="rounded-full bg-fhj-navy px-3 py-1 text-xs font-semibold text-white"
                  >
                    Modifier
                  </Link>
                  <ConfirmSubmitForm
                    action={adminDeleteBookFromForm}
                    confirmMessage="Supprimer ce livre ? Les commandes associées peuvent empêcher la suppression."
                    className="inline"
                  >
                    <input type="hidden" name="bookId" value={b.id} />
                    <button type="submit" className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50">
                      Supprimer
                    </button>
                  </ConfirmSubmitForm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
