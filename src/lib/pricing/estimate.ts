/**
 * MOCK — en attendant le vrai service de tarification côté backend, qui calculera la distance
 * réelle entre l'adresse choisie et la ville source (Tlemcen 13000) puis le prix en DA.
 * Le calcul ici est déterministe (basé sur le texte de l'adresse) uniquement pour afficher un
 * aperçu cohérent à l'écran ; il ne reflète aucune distance réelle. À remplacer par un appel API
 * une fois le web service de tarification disponible.
 */
export interface PriceEstimate {
  distanceKm: number;
  priceDzd: number;
}

export const PRICING_SOURCE_CITY = "Tlemcen (13000)";

const BASE_PRICE_DZD = 3000;
const PRICE_PER_KM_DZD = 40;

function hashAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function estimatePrice(address: string): PriceEstimate {
  const distanceKm = 15 + (hashAddress(address) % 450);
  const priceDzd = Math.round((BASE_PRICE_DZD + distanceKm * PRICE_PER_KM_DZD) / 100) * 100;
  return { distanceKm, priceDzd };
}

// MOCK — taux de conversion fixe en attendant un vrai taux de change. Le service a lieu en
// Algérie (coût en DA) mais le client, basé en Europe, paie en euros.
const MOCK_DZD_TO_EUR_RATE = 260;

export function formatEur(amountDzd: number): string {
  const amountEur = amountDzd / MOCK_DZD_TO_EUR_RATE;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amountEur);
}
