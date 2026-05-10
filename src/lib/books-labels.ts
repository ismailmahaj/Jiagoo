import type { BookBadge, BookPublicationStatus, BookType } from "@prisma/client";

export function bookTypeLabel(t: BookType): string {
  switch (t) {
    case "EBOOK":
      return "eBook";
    case "PHYSICAL":
      return "Livre physique";
    case "FREE":
      return "Gratuit";
    default:
      return t;
  }
}

export function bookBadgeLabel(b: BookBadge): string | null {
  switch (b) {
    case "NEW":
      return "Nouveau";
    case "SOLIDARITY":
      return "Solidaire";
    case "BESTSELLER":
      return "Bestseller";
    default:
      return null;
  }
}

export function bookStatusLabel(s: BookPublicationStatus): string {
  switch (s) {
    case "DRAFT":
      return "Brouillon";
    case "PUBLISHED":
      return "Publié";
    case "ARCHIVED":
      return "Archivé";
    default:
      return s;
  }
}

export function bookOrderPaymentLabel(s: string): string {
  switch (s) {
    case "PENDING":
      return "En attente";
    case "PAID":
      return "Payé";
    case "FAILED":
      return "Échoué";
    case "REFUNDED":
      return "Remboursé";
    default:
      return s;
  }
}

export function bookFulfillmentLabel(s: string): string {
  switch (s) {
    case "PENDING":
      return "En attente";
    case "PROCESSING":
      return "En préparation";
    case "SHIPPED":
      return "Expédié";
    case "DELIVERED":
      return "Livré";
    case "CANCELLED":
      return "Annulé";
    default:
      return s;
  }
}
