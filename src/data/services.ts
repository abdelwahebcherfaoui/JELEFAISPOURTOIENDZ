// Reprend exactement le seed backend (mission-dz-api V2__seed_categories.sql) pour rester
// cohérent avec l'API tant que la navbar n'appelle pas encore GET /api/categories.
export interface ServiceCategory {
  slug: string;
  icon: string;
  name: string;
  /** Accroche longue, utilisée dans le menu "Nos services" et en intro de la page détail. */
  description: string;
  /** Accroche courte (2-4 mots), utilisée pour les cartes de la page d'accueil. */
  tagline: string;
  /** Couleur de fond des cartes et du bandeau de la page détail. */
  color: string;
  /** 3 points forts concrets, affichés sur la page détail du service. */
  highlights: string[];
  active: boolean;
}

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "verification-inspection",
    icon: "🔍",
    name: "Vérification / Inspection",
    description:
      "Un logement pour achat ou location (Ex: vacances d'été), un véhicule, un chantier, une situation sur place — avec photos et vidéos.",
    tagline: "Maisons ou appartements pour les vacances",
    color: "#e1f6f0",
    highlights: [
      "Un agent se déplace et constate sur place",
      "Photos et vidéos horodatées, envoyées directement",
      "Devis clair avant toute intervention",
    ],
    active: true,
  },
  {
    slug: "immobilier-maison",
    icon: "🏠",
    name: "Immobilier & Maison",
    description: "Travaux, entretien, préparation de la maison avant les vacances.",
    tagline: "travaux et entretien",
    color: "#F0DCC0",
    highlights: [
      "Travaux suivis par un agent sur place",
      "Photos avant/après à chaque étape",
      "Maison prête avant votre arrivée en vacances",
    ],
    active: false,
  },
  {
    slug: "vehicule",
    icon: "🚗",
    name: "Véhicule",
    description: "Accompagnement chez un mécanicien, entretien, préparation avant l'arrivée.",
    tagline: "contrôle et entretien",
    color: "#F2C230",
    highlights: [
      "Contrôle réalisé par une personne de confiance",
      "Rapport détaillé avec photos",
      "Accompagnement chez le garagiste si besoin",
    ],
    active: false,
  },
  {
    slug: "assistance-famille",
    icon: "👴",
    name: "Assistance famille",
    description: "Livraison, courses, installation, accompagnement logistique ponctuel.",
    tagline: "livraisons et courses",
    color: "#B8DED0",
    highlights: [
      "Livraisons et courses prises en charge sur place",
      "Un proche accompagné en toute confiance",
      "Suivi de chaque étape depuis votre espace",
    ],
    active: false,
  },
  {
    slug: "documents-demarches",
    icon: "📄",
    name: "Documents",
    description: "Récupération de documents, dépôt de dossier, mise en relation avec un pro.",
    tagline: "dossiers et démarches",
    color: "#C9D6F0",
    highlights: [
      "Envoyer des documents (Réception à l'aéroport)",
      "Récupération et dépôt de documents sur place",
      "Mise en relation avec un professionnel habilité",
      "Aucune démarche nécessitant votre présence physique",
    ],
    active: false,
  },
];
