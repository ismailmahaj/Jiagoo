"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function BookFreeClaim({ bookId }: { bookId: string }) {
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const claim = async () => {
    setErr(null);
    setMsg(null);
    const fn = session?.user?.firstName || firstName.trim();
    const ln = session?.user?.lastName || lastName.trim();
    const em = session?.user?.email || email.trim();
    if (!fn || !ln || !em) {
      setErr("Renseignez nom, prénom et email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/books/free-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, firstName: fn, lastName: ln, email: em }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Erreur.");
        setLoading(false);
        return;
      }
      if (data.downloadUrl) {
        setMsg("Succès ! Téléchargement lancé…");
        window.location.href = data.downloadUrl as string;
        return;
      }
      setMsg("Un email avec le lien vous a été envoyé.");
    } catch {
      setErr("Erreur réseau.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-fhj-gold/30 bg-fhj-cream/40 p-6">
      <p className="text-sm font-semibold text-fhj-navy">Livre gratuit</p>
      <p className="mt-2 text-sm text-fhj-navy/70">Recevez le PDF par email et en téléchargement direct.</p>
      {!session?.user && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input placeholder="Prénom" className="rounded-lg border px-3 py-2 text-sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input placeholder="Nom" className="rounded-lg border px-3 py-2 text-sm" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input placeholder="Email" type="email" className="sm:col-span-2 rounded-lg border px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      {msg && <p className="mt-3 text-sm text-emerald-800">{msg}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={claim}
        className="mt-4 w-full rounded-full bg-fhj-navy py-3 text-sm font-semibold text-white hover:bg-fhj-navy-mid disabled:opacity-60"
      >
        {loading ? "Patientez…" : "Télécharger gratuitement"}
      </button>
    </div>
  );
}
