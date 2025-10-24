"use client";

import { useEffect, useRef } from "react";

type ChartProps = {
  titre: string;
  sousTitre?: string;
};

/**
 * Placeholder de graphique : affiche un canvas sombre avec un gradient simple.
 */
export function Chart({ titre, sousTitre }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(1, "#1E293B");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "16px Inter";
    ctx.fillText(titre, 16, 32);
    if (sousTitre) {
      ctx.font = "12px Inter";
      ctx.fillText(sousTitre, 16, 52);
    }
  }, [titre, sousTitre]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <canvas ref={canvasRef} width={600} height={280} className="w-full h-64 rounded-lg" />
    </div>
  );
}
