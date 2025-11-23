import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

import { buildTechnicalSnapshot } from "@/lib/analysis/technical";
import type { PriceCandle } from "@/lib/analysis/technical";

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
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);

    const chart = await yahooFinance.chart(ticker, {
      interval: "1d",
      period1: start,
      period2: end
    });

    const quotes = (chart?.quotes ?? []).filter(
      (item) =>
        item.date instanceof Date &&
        !Number.isNaN(item.date.getTime()) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close) &&
        Number.isFinite(item.volume)
    );

    const candles: PriceCandle[] = quotes.map((quote) => ({
      date: quote.date.toISOString(),
      open: quote.open as number,
      high: quote.high as number,
      low: quote.low as number,
      close: quote.close as number,
      volume: quote.volume as number
    }));

    if (candles.length === 0) {
      throw new Error("Aucune donnée exploitable renvoyée par Yahoo Finance");
    }

    const snapshot = buildTechnicalSnapshot(candles);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      candles,
      indicators: {
        smaShort: snapshot.smaShort,
        smaLong: snapshot.smaLong,
        ema: snapshot.ema,
        rsi: snapshot.rsi,
        macd: snapshot.macd,
        bollinger: snapshot.bollinger
      },
      signals: snapshot.signals
    });
  } catch (error) {
    console.error("Erreur API /api/analysis/technicals", error);
    return NextResponse.json(
      { message: "Erreur lors du calcul des indicateurs techniques." },
      { status: 500 }
    );
  }
}
