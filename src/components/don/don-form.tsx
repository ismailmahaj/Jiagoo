"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type ProjectOption = { id: string; title: string };

const PRESETS = [
  { label: "10 €", cents: 1000 },
  { label: "25 €", cents: 2500 },
  { label: "50 €", cents: 5000 },
  { label: "100 €", cents: 10000 },
];

export function DonForm({ projects, defaultProjectId }: { projects: ProjectOption[]; defaultProjectId?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || "");
  const [amountCents, setAmountCents] = useState(2500);
  const [customEur, setCustomEur] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (cents: number) => {
    setAmountCents(cents);
    setCustomEur("");
  };

  const applyCustom = () => {
    const n = parseFloat(customEur.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setAmountCents(Math.round(n * 100));
  };

  const submit = async () => {
    setError(null);
    if (!projectId) {
      setError("Choisissez un projet.");
      return;
    }
    if (amountCents < 100) {
      setError("Montant minimum : 1 €.");
      return;
    }
    const fn = session?.user?.firstName || firstName.trim();
    const ln = session?.user?.lastName || lastName.trim();
    const em = session?.user?.email || email.trim();
    if (!fn || !ln || !em) {
      setError("Merci de renseigner nom, prénom et email (ou connectez-vous).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          amountCents,
          anonymous,
          firstName: fn,
          lastName: ln,
          email: em,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Paiement indisponible pour le moment.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError("Réponse Stripe inattendue.");
    } catch {
      setError("Erreur réseau. Réessayez.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Faire un don</h1>
      <p className="mt-2 text-sm text-fhj-navy/65">
        Paiement sécurisé par carte via{" "}
        <a href="https://stripe.com" className="font-medium text-fhj-gold underline-offset-2 hover:underline">
          Stripe
        </a>
        . Aucune donnée bancaire ne transite par nos serveurs.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-medium text-fhj-navy">Projet à soutenir</label>
          <select
            className="mt-2 w-full rounded-xl border border-fhj-navy/15 bg-fhj-cream px-4 py-3 text-sm outline-none ring-fhj-gold/30 focus:ring-2"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-fhj-navy">Montant</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.cents}
                type="button"
                onClick={() => applyPreset(p.cents)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  amountCents === p.cents && !customEur
                    ? "border-fhj-gold bg-fhj-gold/15 text-fhj-navy"
                    : "border-fhj-navy/15 text-fhj-navy/80 hover:border-fhj-gold/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Montant libre (€)"
              value={customEur}
              onChange={(e) => setCustomEur(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
            />
            <button
              type="button"
              onClick={applyCustom}
              className="shrink-0 rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm font-medium text-fhj-navy hover:bg-fhj-cream"
            >
              Appliquer
            </button>
          </div>
          <p className="mt-2 text-xs text-fhj-navy/55">Sélection actuelle : {(amountCents / 100).toFixed(2)} €</p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-fhj-navy/10 bg-fhj-cream/80 p-4">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-fhj-navy/30 text-fhj-gold focus:ring-fhj-gold"
          />
          <span className="text-sm text-fhj-navy/80">
            <span className="font-medium text-fhj-navy">Don anonyme</span> — votre nom n’apparaîtra pas publiquement
            sur les listes de contributeurs.
          </span>
        </label>

        <div className="rounded-xl border border-fhj-navy/10 bg-white p-4 text-sm text-fhj-navy/75">
          {status === "authenticated" ? (
            <p>
              Connecté en tant que <strong>{session?.user?.email}</strong>. Les informations ci-dessous sont
              préremplies ; vous pouvez les ajuster pour ce don.
            </p>
          ) : (
            <p>
              Vous pouvez donner sans compte.{" "}
              <Link href="/connexion" className="font-medium text-fhj-gold hover:underline">
                Se connecter
              </Link>{" "}
              ou{" "}
              <Link href="/inscription" className="font-medium text-fhj-gold hover:underline">
                créer un compte
              </Link>{" "}
              pour suivre vos dons et télécharger vos reçus.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-fhj-navy">Prénom</label>
            <input
              className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
              value={session?.user?.firstName && status === "authenticated" ? session.user.firstName : firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={status === "authenticated"}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fhj-navy">Nom</label>
            <input
              className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
              value={session?.user?.lastName && status === "authenticated" ? session.user.lastName : lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={status === "authenticated"}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Email</label>
          <input
            type="email"
            className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
            value={session?.user?.email && status === "authenticated" ? session.user.email || "" : email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "authenticated"}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Téléphone (facultatif)</label>
          <input
            className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full rounded-full bg-fhj-gold py-3.5 text-sm font-semibold text-fhj-navy shadow hover:bg-fhj-gold-light disabled:opacity-60"
        >
          {loading ? "Redirection vers Stripe…" : "Continuer vers le paiement"}
        </button>

        <button type="button" className="w-full text-center text-sm text-fhj-navy/55 hover:text-fhj-navy" onClick={() => router.push("/projets")}>
          Retour aux projets
        </button>
      </div>
    </div>
  );
}
