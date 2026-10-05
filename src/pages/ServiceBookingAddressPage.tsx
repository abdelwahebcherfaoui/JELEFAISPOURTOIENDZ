import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "../components/layout/Logo";
import { serviceCategories } from "../data/services";
import { useAuth } from "../lib/auth/AuthContext";

/**
 * Étape minimale avant la connexion (comme wecasa.fr) : juste l'adresse, pour rester à faible
 * friction. Volontairement en dehors de SiteLayout (pas de navbar/footer) — un seul focus.
 * L'adresse voyage ensuite via l'URL (?adresse=...), pas le state du routeur, pour survivre au
 * détour par /connexion si besoin (voir RequireAuth).
 */
export function ServiceBookingAddressPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const service = serviceCategories.find((item) => item.slug === slug);
  const [address, setAddress] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [complementAdresse, setComplementAdresse] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [description, setDescription] = useState("");

  if (!service) return <Navigate to="/" replace />;
  if (!service.active) return <Navigate to={`/services/${slug}`} replace />;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      categorie: service!.slug,
      adresse: address,
      wilaya,
      description,
    });
    if (ville) params.set("ville", ville);
    if (codePostal) params.set("codePostal", codePostal);
    if (complementAdresse) params.set("complementAdresse", complementAdresse);
    if (preferredDate) params.set("date", preferredDate);
    navigate(`/services/${service!.slug}/recapitulatif?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={`/services/${service.slug}`}
          className="flex items-center gap-1 text-sm font-semibold text-ink hover:text-ink/70"
        >
          <ChevronLeft size={18} />
          Retour
        </Link>
        <Logo />
        {user ? (
          <span className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Bonjour {user.name ?? "!"}
          </span>
        ) : (
          <Link
            to="/connexion"
            state={{ from: `/services/${service.slug}/reserver` }}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            Me connecter
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Où aura lieu votre demande ?</h1>
        <p className="mt-3 text-sm text-ink-dim">
          📍 Cette adresse nous permet d'organiser « {service.name} » sur place, en Algérie.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="address" className="block text-xs font-medium text-ink-dim">
            Votre adresse complète
          </label>
          <input
            id="address"
            required
            autoFocus
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="12 rue des Frères, Alger"
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="wilaya" className="mt-5 block text-xs font-medium text-ink-dim">
            Wilaya
          </label>
          <input
            id="wilaya"
            required
            value={wilaya}
            onChange={(event) => setWilaya(event.target.value)}
            placeholder="Alger"
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="ville" className="mt-5 block text-xs font-medium text-ink-dim">
            Ville <span className="text-ink-dim/70">(optionnel)</span>
          </label>
          <input
            id="ville"
            value={ville}
            onChange={(event) => setVille(event.target.value)}
            placeholder="Bab Ezzouar"
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="codePostal" className="mt-5 block text-xs font-medium text-ink-dim">
            Code postal <span className="text-ink-dim/70">(optionnel)</span>
          </label>
          <input
            id="codePostal"
            value={codePostal}
            onChange={(event) => setCodePostal(event.target.value)}
            placeholder="16000"
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="complementAdresse" className="mt-5 block text-xs font-medium text-ink-dim">
            Complément d'adresse <span className="text-ink-dim/70">(optionnel)</span>
          </label>
          <input
            id="complementAdresse"
            value={complementAdresse}
            onChange={(event) => setComplementAdresse(event.target.value)}
            placeholder="Étage, appartement, point de repère..."
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="preferredDate" className="mt-5 block text-xs font-medium text-ink-dim">
            Date souhaitée <span className="text-ink-dim/70">(optionnel)</span>
          </label>
          <input
            id="preferredDate"
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <label htmlFor="description" className="mt-5 block text-xs font-medium text-ink-dim">
            Décrivez votre demande
          </label>
          <textarea
            id="description"
            required
            minLength={10}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex. Vérifier l'état de l'appartement avant la mise en location"
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
          />

          <button
            type="submit"
            disabled={!address.trim() || !wilaya.trim() || description.trim().length < 10}
            className="mt-6 w-full rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
          >
            Continuer
          </button>
        </form>
      </main>
    </div>
  );
}
