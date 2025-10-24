import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { calculerRSI, calculerSMA } from "@/lib/indicators";
import { determinerScore } from "@/lib/prediction";

const DUREE_JOURS = 60;

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

    const quotes = donnees?.quotes ?? [];
    const closes = quotes
      .map((item) => item.close)
      .filter((valeur): valeur is number => typeof valeur === "number" && Number.isFinite(valeur))
      .slice(-DUREE_JOURS);

    if (closes.length === 0) {
      return NextResponse.json(
        { message: "Aucune donnée de clôture disponible pour ce ticker." },
        { status: 404 }
      );
    }

    const sma5 = calculerSMA(closes, 5);
    const sma20 = calculerSMA(closes, 20);
    const rsi14 = calculerRSI(closes, 14);
    const { score, label } = determinerScore({ clotures: closes, smaCourt: sma5, smaLong: sma20, rsi: rsi14 });

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      closeSeries: closes,
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
