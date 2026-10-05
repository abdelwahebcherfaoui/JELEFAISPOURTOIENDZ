import { Link } from "react-router-dom";

/**
 * Marque provisoire en attendant un vrai logo dessiné : deux points reliés par un tracé,
 * symbolisant le lien entre l'Europe et l'Algérie — le cœur de la promesse du produit.
 */
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        <path
          d="M6 20C10 12 18 12 22 6"
          stroke="var(--color-accent-2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 4.5"
        />
        <circle cx="6" cy="20" r="4" fill="var(--color-accent)" />
        <circle cx="22" cy="6" r="4" fill="var(--color-accent-2)" />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-ink">
        JeFaisPourToi<span className="text-accent">EnAlgérie</span>
      </span>
    </Link>
  );
}
