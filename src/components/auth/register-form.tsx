"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Impossible de créer le compte.");
      setLoading(false);
      return;
    }
    const sign = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (sign?.error) {
      router.push("/connexion");
      return;
    }
    router.push("/espace-donateur");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Inscription</h1>
      <p className="text-sm text-fhj-navy/65">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-fhj-gold hover:underline">
          Connexion
        </Link>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-fhj-navy">Prénom</label>
          <input
            required
            className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-fhj-navy">Nom</label>
          <input
            required
            className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Email</label>
        <input
          type="email"
          required
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-xs text-fhj-navy/50">Au moins 8 caractères.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-fhj-gold py-3 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light disabled:opacity-60"
      >
        {loading ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
