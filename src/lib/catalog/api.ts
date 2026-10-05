import { apiFetch } from "../api";
import type { Category } from "./types";

/**
 * GET /api/categories ne renvoie que les catégories actives (une seule au MVP) — utilisé pour le
 * formulaire de nouvelle demande, qui a besoin d'un vrai id UUID en base. Le menu "Nos services"
 * de la Navbar continue d'utiliser data/services.ts : ce sont les 5 domaines de la feuille de
 * route, y compris ceux "Bientôt" que l'API ne retourne jamais.
 */
export function listActiveCategories() {
  return apiFetch<Category[]>("/api/categories");
}
