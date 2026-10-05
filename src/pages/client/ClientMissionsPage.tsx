import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { listMissions } from "../../lib/missions/api";
import type { Mission } from "../../lib/missions/types";
import { StatusBadge } from "../../components/missions/StatusBadge";
import { ApiError } from "../../lib/api";

export function ClientMissionsPage() {
  const { accessToken } = useAuth();
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    listMissions(accessToken)
      .then(setMissions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, [accessToken]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mes demandes</h1>
          <p className="mt-1 text-sm text-ink-dim">Suivez l'avancement de vos demandes en Algérie.</p>
        </div>
        <Link
          to="/mes-demandes/nouvelle"
          className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim"
        >
          <Plus size={18} />
          Nouvelle demande
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {missions === null && !error && <p className="mt-10 text-sm text-ink-dim">Chargement...</p>}

      {missions?.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-ink-dim">Vous n'avez pas encore de demande.</p>
          <Link
            to="/mes-demandes/nouvelle"
            className="mt-4 inline-block font-semibold text-accent-2 hover:underline"
          >
            Créer votre première demande
          </Link>
        </div>
      )}

      {missions && missions.length > 0 && (
        <ul className="mt-6 space-y-3">
          {missions.map((mission) => (
            <li key={mission.id}>
              <Link
                to={`/mes-demandes/${mission.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-ink-dim uppercase">
                    {mission.categoryName}
                  </p>
                  <p className="truncate font-semibold text-ink">{mission.title}</p>
                  <p className="text-sm text-ink-dim">{mission.wilaya}</p>
                </div>
                <StatusBadge status={mission.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
