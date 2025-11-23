import { FundamentalAsset } from "@/lib/analysis/types";

export const sampleAssets: FundamentalAsset[] = [
  {
    isin: "FR0000120321",
    ticker: "AIR.PA",
    name: "Airbus",
    country: "France",
    sector: "Industrie",
    currency: "EUR",
    marketCap: 110_000_000_000,
    pe: 24.5,
    pb: 6.1,
    roe: 16.2,
    roic: 12.8,
    dividendYield: 1.6,
    netDebtToEquity: 35
  },
  {
    isin: "FR0000131104",
    ticker: "MC.PA",
    name: "LVMH",
    country: "France",
    sector: "Consommation",
    currency: "EUR",
    marketCap: 380_000_000_000,
    pe: 21.3,
    pb: 5.5,
    roe: 20.1,
    roic: 18.4,
    dividendYield: 2.2,
    netDebtToEquity: 24
  },
  {
    isin: "US0378331005",
    ticker: "AAPL",
    name: "Apple",
    country: "États-Unis",
    sector: "Technologie",
    currency: "USD",
    marketCap: 2_900_000_000_000,
    pe: 28.9,
    pb: 35.2,
    roe: 28.7,
    roic: 31.5,
    dividendYield: 0.5,
    netDebtToEquity: 150
  },
  {
    isin: "US5949181045",
    ticker: "MSFT",
    name: "Microsoft",
    country: "États-Unis",
    sector: "Technologie",
    currency: "USD",
    marketCap: 3_000_000_000_000,
    pe: 33.2,
    pb: 14.8,
    roe: 35.1,
    roic: 29.2,
    dividendYield: 0.9,
    netDebtToEquity: 40
  },
  {
    isin: "US88160R1014",
    ticker: "TSLA",
    name: "Tesla",
    country: "États-Unis",
    sector: "Automobile",
    currency: "USD",
    marketCap: 650_000_000_000,
    pe: 70.5,
    pb: 15.6,
    roe: 17.6,
    roic: 13.1,
    dividendYield: 0,
    netDebtToEquity: 15
  }
];
