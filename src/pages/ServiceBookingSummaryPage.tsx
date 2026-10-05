import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  Radar,
  ShieldCheck,
  ShoppingBag,
  Timer,
} from "lucide-react";
import { Logo } from "../components/layout/Logo";
import { serviceCategories } from "../data/services";
import { useAuth } from "../lib/auth/AuthContext";
import { estimatePrice, formatEur, PRICING_SOURCE_CITY } from "../lib/pricing/estimate";
import { listActiveCategories } from "../lib/catalog/api";
import type { Category } from "../lib/catalog/types";
import { createMission } from "../lib/missions/api";
import { ApiError } from "../lib/api";

// Repris de la section "Vous allez nous aimer" de ServiceDetailPage, plutôt que les badges de
// wecasa (annulation 24h, "experts du ménage", note 4,9/5 sur 319 112 sessions) : ce sont des
// engagements/chiffres propres à wecasa qu'on n'a pas — les afficher serait fabriquer des données.
const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "On est transparent",
    description: "Un devis clair avant toute intervention — vous savez ce que vous payez, et pourquoi.",
  },
  {
    icon: Radar,
    title: "On est vérifié",
    description: "Photos et vidéos horodatées à chaque étape, jamais juste \"c'est fait\".",
  },
  {
    icon: Timer,
    title: "On est suivi",
    description: "Une personne dédiée pilote votre demande du premier message jusqu'au règlement.",
  },
];

function formatPreferredDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Écran "panier" avant la connexion (comme wecasa.fr) : récapitule la demande et, si
 * l'utilisateur n'est pas encore connecté, propose de créer un compte ou de se connecter avant
 * de poursuivre. Les infos déjà saisies (adresse, description, date) voyagent via l'URL, comme
 * sur ServiceBookingAddressPage, pour survivre à ce détour par l'inscription/connexion.
 */
export function ServiceBookingSummaryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const service = serviceCategories.find((item) => item.slug === slug);
  // Si on revient de la connexion/inscription avec ?etape=paiement, l'utilisateur est maintenant
  // connecté : on affiche directement le paiement au lieu de repasser par "C'est parti".
  const [showPayment, setShowPayment] = useState(() => searchParams.get("etape") === "paiement");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    listActiveCategories()
      .then(setCategories)
      .catch(() => setCategoriesFailed(true));
  }, []);

  const address = searchParams.get("adresse") ?? "";
  const wilaya = searchParams.get("wilaya") ?? "";
  const ville = searchParams.get("ville") ?? "";
  const codePostal = searchParams.get("codePostal") ?? "";
  const complementAdresse = searchParams.get("complementAdresse") ?? "";
  const date = searchParams.get("date") ?? "";
  const description = searchParams.get("description") ?? "";

  if (!service) return <Navigate to="/" replace />;
  if (!service.active) return <Navigate to={`/services/${slug}`} replace />;
  if (!address || !wilaya || !description) return <Navigate to={`/services/${slug}/reserver`} replace />;

  // Cible de redirection après connexion/inscription : revenir sur ce récap, directement à
  // l'étape paiement (pas sur le formulaire de nouvelle demande).
  const paymentSearchParams = new URLSearchParams(searchParams);
  paymentSearchParams.set("etape", "paiement");
  const recapPaymentUrl = `/services/${service.slug}/recapitulatif?${paymentSearchParams.toString()}`;
  // Cible du "Me connecter" du header : rester sur ce récap tel quel après connexion (pas de
  // saut direct vers le paiement ni vers le formulaire).
  const currentPageUrl = `/services/${service.slug}/recapitulatif?${searchParams.toString()}`;
  const { distanceKm, priceDzd } = estimatePrice(address);

  const category = categories?.find((item) => item.slug === service.slug);
  const fullAddress = [address, complementAdresse, [codePostal, ville].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  // MOCK — pas de vraie passerelle de paiement pour l'instant (les champs de carte ne sont ni
  // lus ni transmis nulle part). En revanche la demande, elle, est bien créée pour de vrai à la
  // confirmation : plus besoin de repasser par le formulaire "Nouvelle demande" séparé, toutes
  // les infos nécessaires (titre déduit du service, adresse détaillée, wilaya) ont déjà été
  // collectées à l'étape précédente.
  async function handleConfirmPayment(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !category) return;

    setConfirmStatus("submitting");
    setConfirmError(null);
    try {
      await createMission(
        {
          categoryId: category.id,
          title: service!.name,
          description,
          addressAlgeria: fullAddress,
          wilaya,
          preferredDate: date || undefined,
        },
        accessToken,
      );
      setConfirmStatus("success");
      setTimeout(() => navigate("/mes-demandes"), 1800);
    } catch (err) {
      setConfirmStatus("error");
      setConfirmError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:h-screen">
      <header className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={`/services/${service.slug}/reserver`}
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
            state={{ from: currentPageUrl }}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            Me connecter
          </Link>
        )}
      </header>

      <main className="flex justify-center lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <div className="flex w-full flex-col lg:h-full lg:min-h-0 lg:flex-row min-[1700px]:w-[60%]">
          <div className="flex-1 px-4 py-10 sm:px-10 sm:py-16 lg:min-h-0 lg:overflow-y-auto lg:px-16 lg:py-20">
            <div className="max-w-lg">
              {confirmStatus === "success" ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <CheckCircle2 size={56} className="text-accent" />
                  <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
                    Paiement accepté avec succès
                  </h1>
                  <p className="mt-3 text-sm text-ink-dim">
                    Votre demande a bien été envoyée. Direction "Mes demandes"...
                  </p>
                </div>
              ) : user && showPayment ? (
                <form onSubmit={handleConfirmPayment}>
                  <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Votre méthode de paiement</h1>

                  <div className="mt-6 rounded-2xl bg-surface p-5">
                    <p className="text-sm font-bold text-ink">0 € à payer maintenant 🎉</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      Le paiement aura lieu après chaque réalisation.
                    </p>
                    <p className="mt-1 text-sm text-ink-dim">
                      Nous réalisons une empreinte bancaire pour garantir votre réservation et le
                      paiement de l'agent.
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border-2 border-accent p-5">
                    <div className="flex items-center gap-2">
                      <CreditCard size={20} className="text-ink" />
                      <h2 className="text-base font-bold text-ink">Carte bancaire</h2>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="cardNumber" className="block text-xs font-medium text-ink-dim">
                        Numéro de carte
                      </label>
                      <input
                        id="cardNumber"
                        required
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 1234 1234 1234"
                        className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-xs font-medium text-ink-dim">
                          Date d'expiration
                        </label>
                        <input
                          id="cardExpiry"
                          required
                          autoComplete="cc-exp"
                          placeholder="MM / AA"
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="cardCvc" className="block text-xs font-medium text-ink-dim">
                          Code de sécurité
                        </label>
                        <input
                          id="cardCvc"
                          required
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="CVC"
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="cardCountry" className="block text-xs font-medium text-ink-dim">
                        Pays
                      </label>
                      <select
                        id="cardCountry"
                        defaultValue="France"
                        className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
                      >
                        <option>France</option>
                        <option>Belgique</option>
                        <option>Suisse</option>
                        <option>Algérie</option>
                      </select>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-ink-dim">
                    En fournissant vos informations de carte bancaire, vous autorisez
                    JeFaisPourToiEnAlgérie à débiter votre carte pour les paiements futurs,
                    conformément à ses conditions.
                  </p>

                  {categoriesFailed && (
                    <p className="mt-4 text-sm text-red-600">
                      Impossible de charger la catégorie du service. Réessayez plus tard.
                    </p>
                  )}
                  {confirmError && <p className="mt-4 text-sm text-red-600">{confirmError}</p>}

                  <button
                    type="submit"
                    disabled={!category || confirmStatus === "submitting"}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {confirmStatus === "submitting" ? "Confirmation..." : "Confirmer ma demande"}
                  </button>

                  <div className="mt-10">
                    {TRUST_POINTS.map(({ icon: Icon, title, description }, index) => (
                      <div
                        key={title}
                        className={`flex items-start gap-4 py-4 ${index > 0 ? "border-t border-line" : ""}`}
                      >
                        <Icon size={22} className="mt-0.5 shrink-0 text-accent-2" />
                        <div>
                          <p className="text-sm font-bold text-ink">{title}</p>
                          <p className="mt-0.5 text-sm text-ink-dim">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-ink-dim">
                    En confirmant votre demande, vous acceptez nos{" "}
                    <Link to="/conditions-generales" className="font-semibold underline hover:text-ink">
                      Conditions générales d'utilisation
                    </Link>
                    .
                  </p>
                </form>
              ) : user ? (
                <>
                  <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">C'est parti</h1>
                  <p className="mt-3 text-sm text-ink-dim">
                    Il ne reste plus qu'à préciser les derniers détails de votre demande.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPayment(true)}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Continuer ma demande
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
                    Nouveau sur JeFaisPourToiEnAlgérie ? Inscrivez-vous pour poursuivre
                  </h1>
                  <Link
                    to="/inscription"
                    state={{ from: recapPaymentUrl }}
                    className="mt-6 flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 sm:inline-flex"
                  >
                    Continuer avec une adresse email
                  </Link>
                  <p className="mt-4 text-sm text-ink-dim">
                    Déjà inscrit ?{" "}
                    <Link
                      to="/connexion"
                      state={{ from: recapPaymentUrl }}
                      className="font-semibold text-accent-2 hover:underline"
                    >
                      Connectez-vous ici
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 border-t border-line bg-surface px-4 py-10 sm:px-10 sm:py-16 lg:min-h-0 lg:w-[420px] lg:flex-none lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-12 lg:py-20">
            <h2 className="text-lg font-bold text-ink">Ma demande</h2>

            <div className="mt-4 flex items-start gap-3 border-b border-line pb-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-sm text-ink">
                {fullAddress}
                <span className="text-ink-dim"> — {wilaya}</span>
              </p>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-line py-4">
              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-ink">{service.name}</p>
                  <p className="mt-0.5 text-xs text-ink-dim">
                    Estimation sur {distanceKm} km depuis {PRICING_SOURCE_CITY}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink">{formatEur(priceDzd)}</p>
            </div>

            <p className="mt-3 text-xs text-ink-dim">
              💡 Prix estimatif — le devis définitif vous sera envoyé après étude de votre demande.
            </p>

            {date && (
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <CalendarDays size={18} className="shrink-0 text-accent" />
                <p className="text-sm text-ink">{formatPreferredDate(date)}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
