import { Link } from "react-router-dom";
import { serviceCategories } from "../../data/services";

export function ServiceCardsRow() {
  return (
    // overflow-x-auto sur ce conteneur ; la rangée interne (w-fit + mx-auto) se centre si elle
    // tient dans la largeur, sinon elle reste alignée au début pour que le défilement parte
    // bien de la première carte (justify-center casserait le scroll quand ça déborde).
    <div className="mx-auto mt-10 max-w-6xl overflow-x-auto px-4 pb-4 sm:px-6">
      <div className="flex w-fit snap-x snap-mandatory gap-2 sm:mx-auto sm:gap-3">
        {serviceCategories.map((service) => (
          <Link
            key={service.slug}
            to={`/services/${service.slug}`}
            className="relative flex h-36 w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl p-3 text-left transition-transform hover:-translate-y-1 sm:h-44 sm:w-44"
            style={{ backgroundColor: service.color }}
          >
            {!service.active && (
              <span className="absolute top-2.5 right-2.5 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                Bientôt
              </span>
            )}

            <div className={service.active ? undefined : "pr-12"}>
              <h3 className="text-sm leading-tight font-extrabold text-ink sm:text-base">
                {service.name}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-ink/70">{service.tagline}</p>
            </div>

            <span aria-hidden="true" className="self-end text-3xl leading-none opacity-90 sm:text-4xl">
              {service.icon}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
