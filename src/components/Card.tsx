import { ReactNode } from "react";

/**
 * Carte simple réutilisable pour afficher des blocs d'informations.
 */
const baseClass =
  "rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30 flex flex-col gap-4";

export function Card({
  title,
  description,
  footer,
  children
}: {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={baseClass}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? (
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        ) : null}
      </header>
      <div className="flex-1 text-sm text-slate-200">{children}</div>
      {footer ? <footer className="text-xs text-slate-500">{footer}</footer> : null}
    </section>
  );
}
