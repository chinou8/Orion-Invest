import { FundamentalAsset, ScreenerFilter, ScreenerInFilter, ScreenerNumericFilter } from "./types";

const applyNumericFilter = (asset: FundamentalAsset, filter: ScreenerNumericFilter): boolean => {
  const value = asset[filter.field];
  if (value == null || filter.value == null) {
    return false;
  }
  const numericValue =
    typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return false;
  }
  switch (filter.operator) {
    case ">=":
      return numericValue >= filter.value;
    case "<=":
      return numericValue <= filter.value;
    case ">":
      return numericValue > filter.value;
    case "<":
      return numericValue < filter.value;
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
