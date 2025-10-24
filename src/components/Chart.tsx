"use client";

import { useEffect, useRef } from "react";

type Point = { date: string; valeur: number };

type ChartProps = {
  titre: string;
  sousTitre?: string;
  points: Point[];
};

/**
 * Petit graphique en courbe dessiné sur un canvas sans dépendance externe.
 */
export function Chart({ titre, sousTitre, points }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "16px Inter";
    ctx.fillText(titre, 16, 28);
    if (sousTitre) {
      ctx.font = "12px Inter";
      ctx.fillText(sousTitre, 16, 48);
    }

    if (points.length < 2) {
      return;
    }

    const valeurs = points.map((point) => point.valeur);
    const min = Math.min(...valeurs);
    const max = Math.max(...valeurs);
    const amplitude = max - min || 1;

    const paddingX = 32;
    const paddingY = 60;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, height - paddingY);
    ctx.lineTo(width - paddingX, height - paddingY);
    ctx.stroke();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((point, index) => {
      const x = paddingX + (usableWidth * index) / (points.length - 1);
      const normalisee = (point.valeur - min) / amplitude;
      const y = height - paddingY - normalisee * usableHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [points, sousTitre, titre]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <canvas ref={canvasRef} width={600} height={280} className="h-64 w-full rounded-lg" />
    </div>
  );
}
