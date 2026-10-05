import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action destructive (ex. annuler, supprimer) : bouton de confirmation en rouge. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Boîte de dialogue de confirmation générique — contrôlée par le composant appelant (état
 * `open` géré en dehors), pour rester réutilisable telle quelle par n'importe quelle action
 * nécessitant une confirmation (annuler une demande, supprimer, etc.), pas seulement les missions.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-ink-dim">{description}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              danger
                ? "rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                : "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
