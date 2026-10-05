import { ServiceCardsRow } from "./ServiceCardsRow";

export function Hero() {
  return (
    <section className="py-20 text-center sm:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <p className="text-sm font-semibold tracking-wide text-accent-2 uppercase">
          Vérifié, documenté, à distance
        </p>

        <h1 className="mt-4 text-4xl leading-[1.1] font-bold text-ink sm:text-6xl">
          Vous êtes à l'étranger.
          <br />
          On s'occupe de tout{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, var(--color-accent), var(--color-accent-2))" }}
          >
            en Algérie
          </span>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-dim">
          JeFaisPourToiEnAlgérie prend en charge vos démarches sur place — vérifier un logement,
          contrôler un véhicule, suivre un chantier — et vous livre la preuve en photos et vidéos,
          du premier message au règlement final.
        </p>
      </div>

      <ServiceCardsRow />
    </section>
  );
}
