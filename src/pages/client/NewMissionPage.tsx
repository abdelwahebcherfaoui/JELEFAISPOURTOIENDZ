import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext";
import { listActiveCategories } from "../../lib/catalog/api";
import type { Category } from "../../lib/catalog/types";
import { createMission } from "../../lib/missions/api";
import { ApiError } from "../../lib/api";

export function NewMissionPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSlug = searchParams.get("categorie");
  // Passées par ServiceBookingAddressPage via l'URL (pas le state du routeur) pour survivre au
  // détour par /connexion si l'utilisateur n'était pas encore connecté à cette étape.
  const prefilledAddress = searchParams.get("adresse") ?? "";
  const prefilledDescription = searchParams.get("description") ?? "";
  const prefilledDate = searchParams.get("date") ?? "";
  const prefilledWilaya = searchParams.get("wilaya") ?? "";

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(prefilledDescription);
  const [addressAlgeria, setAddressAlgeria] = useState(prefilledAddress);
  const [wilaya, setWilaya] = useState(prefilledWilaya);
  const [preferredDate, setPreferredDate] = useState(prefilledDate);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listActiveCategories()
      .then((list) => {
        setCategories(list);
        const preselected = list.find((category) => category.slug === preselectedSlug);
        if (preselected) setCategoryId(preselected.id);
        else if (list.length > 0) setCategoryId(list[0].id);
      })
      .catch(() => setCategoriesFailed(true));
    // Le paramètre d'URL ne doit être appliqué qu'au premier chargement des catégories.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setError(null);
    setLoading(true);

    try {
      const mission = await createMission(
        {
          categoryId,
          title,
          description,
          addressAlgeria,
          wilaya,
          preferredDate: preferredDate || undefined,
        },
        accessToken,
      );
      navigate(`/mes-demandes/${mission.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-ink">Nouvelle demande</h1>
      <p className="mt-1 text-sm text-ink-dim">
        Décrivez ce que vous voulez faire vérifier, contrôler ou réaliser en Algérie.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink">
            Catégorie
          </label>
          {categoriesFailed ? (
            <p className="mt-1 text-sm text-red-600">Impossible de charger les catégories. Réessayez plus tard.</p>
          ) : categories === null ? (
            <p className="mt-1 text-sm text-ink-dim">Chargement des catégories...</p>
          ) : (
            <select
              id="category"
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink">
            Titre
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Vérifier l'appartement avant location"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            id="description"
            required
            minLength={10}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Détaillez votre demande (au moins 10 caractères)"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="wilaya" className="block text-sm font-medium text-ink">
              Wilaya
            </label>
            <input
              id="wilaya"
              required
              value={wilaya}
              onChange={(event) => setWilaya(event.target.value)}
              placeholder="Alger"
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
            />
          </div>
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-ink">
              Date souhaitée <span className="text-ink-dim">(optionnel)</span>
            </label>
            <input
              id="preferredDate"
              type="date"
              value={preferredDate}
              onChange={(event) => setPreferredDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-ink">
            Adresse en Algérie
          </label>
          <input
            id="address"
            required
            value={addressAlgeria}
            onChange={(event) => setAddressAlgeria(event.target.value)}
            placeholder="12 rue des Frères, Alger"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || categories === null || categories.length === 0}
          className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dim disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Envoyer ma demande"}
        </button>
      </form>
    </section>
  );
}
