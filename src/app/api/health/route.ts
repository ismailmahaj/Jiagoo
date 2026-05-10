import { NextResponse } from "next/server";

/**
 * Sonde Railway / load balancer — sans accès base de données.
 * Évite les échecs de déploiement quand la page d’accueil attend Postgres.
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
