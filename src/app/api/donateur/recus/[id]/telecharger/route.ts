import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      donation: { include: { project: true } },
      user: true,
    },
  });
  if (!receipt || receipt.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const lines = [
    "FONDATION HASSEN JIAGOO",
    "Reçu de don",
    "",
    `Numéro : ${receipt.number}`,
    `Date : ${receipt.createdAt.toLocaleString("fr-FR")}`,
    "",
    `Donateur : ${receipt.user.firstName} ${receipt.user.lastName}`,
    `Email : ${receipt.user.email}`,
    "",
    `Projet soutenu : ${receipt.donation.project.title}`,
    `Montant : ${formatEuro(receipt.donation.amount)}`,
    "",
    "Merci pour votre confiance.",
    "",
    "Ce document est généré automatiquement à titre informatif.",
    "Pour toute question : contact@fondation-jiagoo.org (à adapter).",
  ];

  const body = lines.join("\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="recu-${receipt.number}.txt"`,
    },
  });
}
