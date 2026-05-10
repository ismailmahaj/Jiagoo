"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/espace-donateur";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Connexion</h1>
      <p className="text-sm text-fhj-navy/65">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-fhj-gold hover:underline">
          Inscription
        </Link>
      </p>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
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
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-fhj-gold py-3 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
