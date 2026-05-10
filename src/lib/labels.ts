import type { BeneficiaryStatus, ProjectStatus } from "@prisma/client";

export function projectStatusLabel(s: ProjectStatus): string {
  switch (s) {
    case "EN_COURS":
      return "En cours";
    case "FINANCE":
      return "Financé";
    case "TERMINE":
      return "Terminé";
    default:
      return s;
  }
}

export function beneficiaryStatusLabel(s: BeneficiaryStatus): string {
  switch (s) {
    case "EN_ATTENTE":
      return "En attente";
    case "AIDEE":
      return "Aidée";
    case "TERMINEE":
      return "Terminée";
    default:
      return s;
  }
}
