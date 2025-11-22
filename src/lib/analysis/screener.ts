import { FundamentalAsset, ScreenerFilter, ScreenerInFilter, ScreenerNumericFilter } from "./types";

const applyNumericFilter = (asset: FundamentalAsset, filter: ScreenerNumericFilter): boolean => {
  const value = asset[filter.field];
  if (!Number.isFinite(value)) {
    return false;
  }
  switch (filter.operator) {
    case ">=":
      return value >= filter.value;
    case "<=":
      return value <= filter.value;
    case ">":
      return value > filter.value;
    case "<":
      return value < filter.value;
    default:
      return false;
  }
};

const applyInclusionFilter = (asset: FundamentalAsset, filter: ScreenerInFilter): boolean => {
  const value = asset[filter.field];
  if (typeof value !== "string") {
    return false;
  }
  return filter.value.map((item) => item.toLowerCase()).includes(value.toLowerCase());
};

export function runScreener(
  assets: FundamentalAsset[],
  filters: ScreenerFilter[] = []
): FundamentalAsset[] {
  if (filters.length === 0) {
    return assets;
  }

  return assets.filter((asset) =>
    filters.every((filter) =>
      filter.operator === "in"
        ? applyInclusionFilter(asset, filter)
        : applyNumericFilter(asset, filter)
    )
  );
}
