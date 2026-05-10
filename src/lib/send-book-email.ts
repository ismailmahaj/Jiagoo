/**
 * Envoi d’e-mail (confirmation / lien de téléchargement).
 * Configurez RESEND_API_KEY et RESEND_FROM pour activer Resend ; sinon log console.
 */
export async function sendBookPurchaseEmail(opts: {
  to: string;
  subject: string;
  downloadUrl?: string;
  bookTitle: string;
  orderId: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "noreply@example.com";

  const text = [
    `Merci pour votre achat : ${opts.bookTitle}.`,
    "",
    opts.downloadUrl ? `Téléchargement (lien valide 30 jours) : ${opts.downloadUrl}` : "",
    `Référence commande : ${opts.orderId}`,
    "",
    "Une partie du montant soutient les bourses de la Fondation Hassen Jiagoo.",
  ]
    .filter(Boolean)
    .join("\n");

  if (!key) {
    console.info("[email:livre]", opts.to, opts.subject, text);
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        text,
      }),
    });
  } catch (e) {
    console.error("Resend error", e);
  }
}
