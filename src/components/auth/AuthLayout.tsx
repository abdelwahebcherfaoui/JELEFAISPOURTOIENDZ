import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-line bg-[#F1FAE1] p-8 shadow-xl shadow-ink/5">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-dim">{footer}</p>
    </section>
  );
}
