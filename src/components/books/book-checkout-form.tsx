"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Book } from "@prisma/client";
import { formatEuro } from "@/lib/format";

const SHIPPING_LABEL = "Frais de livraison (fixe) : 6,00 €";

export function BookCheckoutForm({ book }: { book: Book }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("Maurice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhysical = book.type === "PHYSICAL";
  const unit = book.price;
  const subtotal = unit * qty;
  const shipping = isPhysical ? 600 : 0;
  const total = subtotal + shipping;

  const submit = async () => {
    setError(null);
    const fn = session?.user?.firstName || firstName.trim();
    const ln = session?.user?.lastName || lastName.trim();
    const em = session?.user?.email || email.trim();
    if (!fn || !ln || !em) {
      setError("Nom, prénom et email obligatoires.");
      return;
    }
    if (isPhysical && (!addr.trim() || !city.trim() || !postal.trim() || !country.trim())) {
      setError("Adresse de livraison complète requise.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          quantity: qty,
          firstName: fn,
          lastName: ln,
          email: em,
          phone: phone.trim() || null,
          shippingAddress: isPhysical ? addr.trim() : null,
          shippingCity: isPhysical ? city.trim() : null,
          shippingPostalCode: isPhysical ? postal.trim() : null,
          shippingCountry: isPhysical ? country.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Paiement impossible.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError("Réponse inattendue.");
    } catch {
      setError("Erreur réseau.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Commander</h2>
      <p className="mt-2 text-sm text-fhj-navy/65">{book.title}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-fhj-navy">Quantité</label>
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="mt-1 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-fhj-navy">Prénom</label>
            <input
              className="mt-1 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
              value={session?.user?.firstName ?? firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!!session?.user}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fhj-navy">Nom</label>
            <input
              className="mt-1 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
              value={session?.user?.lastName ?? lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!!session?.user}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
            value={session?.user?.email ?? email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!session?.user}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Téléphone</label>
          <input
            className="mt-1 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {isPhysical && (
          <div className="space-y-3 rounded-xl border border-fhj-gold/25 bg-fhj-cream/50 p-4">
            <p className="text-sm font-semibold text-fhj-navy">Livraison</p>
            <input placeholder="Adresse" className="w-full rounded-lg border px-3 py-2 text-sm" value={addr} onChange={(e) => setAddr(e.target.value)} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input placeholder="Ville" className="rounded-lg border px-3 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)} />
              <input placeholder="Code postal" className="rounded-lg border px-3 py-2 text-sm" value={postal} onChange={(e) => setPostal(e.target.value)} />
            </div>
            <input placeholder="Pays" className="w-full rounded-lg border px-3 py-2 text-sm" value={country} onChange={(e) => setCountry(e.target.value)} />
            <p className="text-xs text-fhj-navy/55">{SHIPPING_LABEL}</p>
          </div>
        )}

        <div className="rounded-xl bg-fhj-navy/5 p-4 text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span className="font-medium">{formatEuro(subtotal)}</span>
          </div>
          {isPhysical && (
            <div className="mt-1 flex justify-between">
              <span>Livraison</span>
              <span>{formatEuro(shipping)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-fhj-navy/10 pt-2 font-semibold text-fhj-navy">
            <span>Total</span>
            <span>{formatEuro(total)}</span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-fhj-navy/55">
          Une partie de cette vente soutient les bourses étudiantes de la Fondation Hassen Jiagoo. Paiement sécurisé par
          Stripe.
        </p>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light py-3.5 text-sm font-semibold text-fhj-navy shadow disabled:opacity-60"
        >
          {loading ? "Redirection…" : "Acheter maintenant"}
        </button>
        <button type="button" className="w-full text-sm text-fhj-navy/55 hover:text-fhj-navy" onClick={() => router.push(`/livres/${book.slug}`)}>
          Retour au livre
        </button>
      </div>
    </div>
  );
}
