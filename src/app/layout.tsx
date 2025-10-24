import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orion Invest",
  description: "Plateforme d'analyse et de suivi de portefeuille en temps réel."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <span className="text-xl font-semibold text-white">Orion Invest</span>
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link className="hover:text-primaire transition" href="/">
                  Tableau de bord
                </Link>
                <Link className="hover:text-primaire transition" href="/analyse">
                  Analyse
                </Link>
                <Link className="hover:text-primaire transition" href="/portefeuille">
                  Portefeuille
                </Link>
              </div>
            </nav>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full">{children}</main>
          <footer className="border-t border-slate-800 bg-slate-900/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-400">
              © {new Date().getFullYear()} Orion Invest — Analyse moderne en mode sombre.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
