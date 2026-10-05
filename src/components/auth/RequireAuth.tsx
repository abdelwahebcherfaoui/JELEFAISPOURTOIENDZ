import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext";
import type { Role } from "../../lib/auth/types";

/**
 * Route de mise en page (utilisée avec un <Route> englobant, pas directement comme élément
 * final) : redirige vers /connexion si personne n'est connecté, ou vers l'accueil si le rôle ne
 * correspond pas à `roles`. Rend un <Outlet /> pour laisser passer les routes enfants sinon.
 */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // pathname + search (pas juste pathname) pour que les paramètres de requête (catégorie,
    // adresse pré-remplie...) survivent au détour par la connexion.
    return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
