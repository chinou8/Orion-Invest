import { NextResponse } from "next/server";
import { scoreAssets } from "@/lib/analysis/fundamental";
import { runScreener } from "@/lib/analysis/screener";
import { FundamentalAsset, ScreenerFilter } from "@/lib/analysis/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const assets = (body?.assets ?? []) as FundamentalAsset[];
    const filters = (body?.filters ?? []) as ScreenerFilter[];

    if (!Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { message: "Le corps de la requête doit contenir un tableau 'assets'." },
        { status: 400 }
      );
    }

    const screenedAssets = runScreener(assets, filters);
    const scoredAssets = scoreAssets(screenedAssets);

    return NextResponse.json({ assets: scoredAssets });
  } catch (error) {
    console.error("Erreur API /api/fundamentals", error);
    return NextResponse.json(
      { message: "Erreur lors de l'évaluation des actifs." },
      { status: 500 }
    );
  }
}
