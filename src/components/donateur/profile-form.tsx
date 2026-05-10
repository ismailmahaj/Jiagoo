"use client";

import { useActionState } from "react";
import type { User } from "@prisma/client";
import { updateDonorProfile } from "@/app/actions/donateur";

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState(updateDonorProfile, null);

  return (
    <form action={action} className="max-w-lg space-y-5 rounded-2xl border border-fhj-navy/10 bg-white p-8 shadow-sm">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">Mes informations</h2>
      <p className="text-sm text-fhj-navy/60">
        L’email ({user.email}) sert d’identifiant de connexion et ne peut pas être modifié ici.
      </p>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Prénom</label>
        <input
          name="firstName"
          required
          defaultValue={user.firstName}
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Nom</label>
        <input
          name="lastName"
          required
          defaultValue={user.lastName}
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-fhj-navy">Téléphone (facultatif)</label>
        <input
          name="phone"
          defaultValue={user.phone ?? ""}
          className="mt-1.5 w-full rounded-xl border border-fhj-navy/15 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fhj-gold/30"
        />
      </div>
      {state && !state.ok && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Modifications enregistrées.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-fhj-gold px-6 py-3 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
