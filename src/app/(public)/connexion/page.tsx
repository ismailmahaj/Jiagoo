import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <Suspense fallback={<p className="text-center text-sm text-fhj-navy/60">Chargement…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
