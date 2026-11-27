import { REGION_OPTIONS } from "@/features/profiles/sitter/constants";
import type { PartnerRegion } from "@/types/partner";
import type { SitterFilterValues, SitterListParams, SitterListState } from "../types/sitter";

export const MAX_SITTER_REGION_SELECTIONS = REGION_OPTIONS.length - 1;

export function toSitterListParams(state: SitterListState): SitterListParams {
  const { filters, ...rest } = state;

  return {
    ...rest,
    regions: filters.regions === "ALL" ? undefined : filters.regions,
    serviceTypes: filters.serviceTypes === "ALL" ? undefined : filters.serviceTypes,
    gender: filters.gender === "ALL" ? undefined : filters.gender,
  };
}

export function normalizeSitterRegions(selected: string[]): SitterFilterValues["regions"] {
  if (selected.includes("ALL")) {
    return "ALL";
  }

  const regions = REGION_OPTIONS.filter((option) => selected.includes(option.value))
    .map((option) => option.value)
    .slice(0, MAX_SITTER_REGION_SELECTIONS);

  return regions.length > 0 ? regions : undefined;
}

export function toggleSitterRegion(
  current: SitterFilterValues["regions"],
  selected: PartnerRegion | "ALL",
): SitterFilterValues["regions"] {
  if (selected === "ALL") {
    return current === "ALL" ? undefined : "ALL";
  }

  const regions = Array.isArray(current) ? current : [];

  if (regions.includes(selected)) {
    return normalizeSitterRegions(regions.filter((region) => region !== selected));
  }

  if (regions.length >= MAX_SITTER_REGION_SELECTIONS) {
    return current;
  }

  return normalizeSitterRegions([...regions, selected]);
}
