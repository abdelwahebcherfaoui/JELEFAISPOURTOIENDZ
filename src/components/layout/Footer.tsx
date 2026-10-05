export function Footer() {
  return (
    <footer className="border-t border-line bg-[#F1FAE1]">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-dim sm:px-6">
        © {new Date().getFullYear()} JeFaisPourToiEnAlgérie. Vos démarches en Algérie, prises en
        charge depuis l'Europe.
      </div>
    </footer>
  );
}
