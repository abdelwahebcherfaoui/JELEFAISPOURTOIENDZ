import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck, Timer, Radar } from "lucide-react";
import { serviceCategories } from "../data/services";

const WHY_US = [
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

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = serviceCategories.find((item) => item.slug === slug);

  if (!service) return <Navigate to="/" replace />;

  return (
    <div>
      <section
        className="px-4 py-16 sm:px-6 sm:py-20"
        style={{ backgroundImage: `linear-gradient(180deg, ${service.color} 0%, var(--color-paper) 100%)` }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{service.name}</h1>
            <p className="mt-3 max-w-md text-ink/80">{service.description}</p>

            <ul className="mt-6 space-y-2">
              {service.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={18} className="mt-0.5 shrink-0 text-ink/70" />
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {service.active ? (
                <Link
                  to={`/services/${service.slug}/reserver`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Réserver un service
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-6 py-3 text-base font-semibold text-ink/70">
                  Bientôt disponible
                </span>
              )}
            </div>
          </div>

          <div className="flex aspect-square items-center justify-center rounded-3xl bg-surface/60 shadow-inner sm:aspect-video md:aspect-square">
            <span aria-hidden="true" className="text-[8rem] leading-none sm:text-[10rem]">
              {service.icon}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-ink">Vous allez nous aimer</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <Icon size={22} className="text-accent-2" />
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-ink-dim">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
