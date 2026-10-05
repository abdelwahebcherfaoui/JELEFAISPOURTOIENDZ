import type { MissionStatus } from "./types";

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  NOUVELLE_DEMANDE: "Nouvelle demande",
  DEVIS_ENVOYE: "Devis envoyé",
  CONFIRMEE: "Confirmée",
  AFFECTEE: "Affectée",
  EN_EXECUTION: "En exécution",
  PREUVES_DEPOSEES: "Preuves déposées",
  VALIDEE: "Validée",
  CONTESTEE: "Contestée",
  PAYEE: "Payée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

/** Classes Tailwind par statut — reprend les tokens de couleur déjà posés dans index.css. */
export const MISSION_STATUS_STYLES: Record<MissionStatus, string> = {
  NOUVELLE_DEMANDE: "bg-surface-2 text-ink-dim",
  DEVIS_ENVOYE: "bg-accent-2-soft text-accent-2",
  CONFIRMEE: "bg-accent-2-soft text-accent-2",
  AFFECTEE: "bg-accent-soft text-accent",
  EN_EXECUTION: "bg-accent-soft text-accent",
  PREUVES_DEPOSEES: "bg-accent-soft text-accent",
  VALIDEE: "bg-green-50 text-green-700",
  CONTESTEE: "bg-red-50 text-red-700",
  PAYEE: "bg-green-50 text-green-700",
  CLOTUREE: "bg-surface-2 text-ink-dim",
  ANNULEE: "bg-red-50 text-red-700",
};
