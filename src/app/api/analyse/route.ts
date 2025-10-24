import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { rsi, sma } from "@/lib/indicators";
import { scoreSignal } from "@/lib/prediction";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json(
      { message: "Le paramètre 'ticker' est obligatoire." },
      { status: 400 }
    );
  }

  try {
    const periodeFin = new Date();
    const periodeDebut = new Date();
    periodeDebut.setMonth(periodeDebut.getMonth() - 6);

    const donnees = await yahooFinance.chart(ticker, {
      interval: "1d",
      period1: periodeDebut,
      period2: periodeFin
    });

    const quotes = (donnees?.quotes ?? []).filter(
      (item) =>
        typeof item.close === "number" &&
        Number.isFinite(item.close) &&
        item.date instanceof Date &&
        !Number.isNaN(item.date.getTime())
    );

    const closeSeries = quotes.map((item) => ({
      date: item.date.toISOString(),
      close: item.close as number
    }));

    if (closeSeries.length === 0) {
      throw new Error("Aucune donnée exploitable renvoyée par Yahoo Finance");
    }

    const clotures = closeSeries.map((item) => item.close);
    const sma5 = sma(clotures, 5);
    const sma20 = sma(clotures, 20);
    const rsi14 = rsi(clotures, 14);

    const recentReturns: number[] = [];
    for (let index = 1; index < clotures.length; index += 1) {
      const previous = clotures[index - 1];
      const current = clotures[index];
      if (Number.isFinite(previous) && Number.isFinite(current) && previous !== 0) {
        recentReturns.push((current - previous) / previous);
      }
    }

    const { score, label } = scoreSignal({
      sma5,
      sma20,
      rsi: rsi14,
      recentReturns: recentReturns.slice(-5)
    });

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      closeSeries,
      sma5,
      sma20,
      rsi14,
      score,
      label
    });
  } catch (error) {
    console.error("Erreur API /api/analyse", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des données financières." },
      { status: 500 }
    );
  }
}
