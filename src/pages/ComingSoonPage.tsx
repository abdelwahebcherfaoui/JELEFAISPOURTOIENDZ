import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <span className="text-4xl">🚧</span>
      <h1 className="mt-4 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-ink-dim">Cette page arrive dans une prochaine étape.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-2 hover:underline"
      >
        <ArrowLeft size={16} />
        Retour à l'accueil
      </Link>
    </section>
  );
}
