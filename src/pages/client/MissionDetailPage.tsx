import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  cancelMission,
  confirmMission,
  disputeMission,
  getMission,
  listMissionUpdates,
  validateMission,
} from "../../lib/missions/api";
import type { Mission, MissionUpdate } from "../../lib/missions/types";
import { StatusBadge } from "../../components/missions/StatusBadge";
import { ApiError } from "../../lib/api";

const CANCELLABLE_STATUSES = ["NOUVELLE_DEMANDE", "DEVIS_ENVOYE", "CONFIRMEE"];
const DISPUTABLE_STATUSES = ["PREUVES_DEPOSEES", "VALIDEE"];

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [updates, setUpdates] = useState<MissionUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const load = useCallback(() => {
    if (!accessToken || !id) return;
    Promise.all([getMission(id, accessToken), listMissionUpdates(id, accessToken)])
      .then(([m, u]) => {
        setMission(m);
        setUpdates(u);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, [accessToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: () => Promise<Mission>) {
    setActionError(null);
    setActionLoading(true);
    try {
      const updated = await action();
      setMission(updated);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/mes-demandes" className="mt-4 inline-block text-accent-2 hover:underline">
          Retour à mes demandes
        </Link>
      </section>
    );
  }

  if (!mission || !accessToken || !id) {
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-dim">Chargement...</p>;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/mes-demandes" className="flex items-center gap-1 text-sm text-ink-dim hover:text-ink">
        <ArrowLeft size={16} />
        Mes demandes
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-ink-dim uppercase">{mission.categoryName}</p>
          <h1 className="text-2xl font-bold text-ink">{mission.title}</h1>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <p className="text-sm text-ink">{mission.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-dim">Adresse</dt>
            <dd className="text-ink">{mission.addressAlgeria}</dd>
          </div>
          <div>
            <dt className="text-ink-dim">Wilaya</dt>
            <dd className="text-ink">{mission.wilaya}</dd>
          </div>
          {mission.preferredDate && (
            <div>
              <dt className="text-ink-dim">Date souhaitée</dt>
              <dd className="text-ink">{mission.preferredDate}</dd>
            </div>
          )}
        </dl>

        {mission.status === "DEVIS_ENVOYE" && (
          <p className="mt-4 text-xs text-ink-dim">
            Un devis vous a été envoyé — le montant vous a été communiqué séparément par notre équipe.
          </p>
        )}

        {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {mission.status === "DEVIS_ENVOYE" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => confirmMission(id, accessToken))}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-60"
            >
              Confirmer le devis
            </button>
          )}

          {mission.status === "PREUVES_DEPOSEES" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => validateMission(id, accessToken))}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-60"
            >
              Valider
            </button>
          )}

          {DISPUTABLE_STATUSES.includes(mission.status) && !disputeOpen && (
            <button
              type="button"
              onClick={() => setDisputeOpen(true)}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-red-400 hover:text-red-600"
            >
              Contester
            </button>
          )}

          {CANCELLABLE_STATUSES.includes(mission.status) && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setCancelConfirmOpen(true)}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-red-400 hover:text-red-600 disabled:opacity-60"
            >
              Annuler
            </button>
          )}
        </div>

        <ConfirmDialog
          open={cancelConfirmOpen}
          title="Annuler définitivement cette demande ?"
          description="Cette action est irréversible."
          confirmLabel="Annuler la demande"
          cancelLabel="Retour"
          danger
          onCancel={() => setCancelConfirmOpen(false)}
          onConfirm={() => {
            setCancelConfirmOpen(false);
            runAction(() => cancelMission(id, accessToken));
          }}
        />

        {disputeOpen && (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            <label htmlFor="dispute-reason" className="block text-sm font-medium text-ink">
              Motif de la contestation
            </label>
            <textarea
              id="dispute-reason"
              rows={3}
              value={disputeReason}
              onChange={(event) => setDisputeReason(event.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={actionLoading || !disputeReason.trim()}
                onClick={() =>
                  runAction(() => disputeMission(id, { reason: disputeReason }, accessToken)).then(() => {
                    setDisputeOpen(false);
                    setDisputeReason("");
                  })
                }
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-60"
              >
                Envoyer la contestation
              </button>
              <button
                type="button"
                onClick={() => setDisputeOpen(false)}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink">Suivi</h2>
      {updates.length === 0 ? (
        <p className="mt-2 text-sm text-ink-dim">Aucune mise à jour pour l'instant.</p>
      ) : (
        <ol className="mt-4 space-y-4 border-l border-line pl-4">
          {updates.map((update) => (
            <li key={update.id}>
              <p className="text-sm text-ink">{update.message}</p>
              <p className="mt-1 text-xs text-ink-dim">
                {update.authorName} · {new Date(update.createdAt).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
