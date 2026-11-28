import { GENDER_OPTIONS, SERVICE_TYPE_OPTIONS } from "@/features/profiles/sitter/constants";
import type { SitterListState, SitterSort } from "../types/sitter";
import { normalizeSitterRegions } from "./sitterFilters";

function parseSitterPage(value: string | null): number {
  const page = Number(value);

  if (!value || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(page)) {
    return 1;
  }

  return page;
}

function parseSitterSort(value: string | null): SitterSort {
  if (value === "REVIEW_COUNT_DESC" || value === "CONFIRMED_QUOTE_COUNT_DESC") {
    return value;
  }

  return "RATING_DESC";
}

export function readSitterListState(searchParams: Pick<URLSearchParams, "get">): SitterListState {
  const serviceTypes = searchParams.get("serviceTypes");
  const gender = searchParams.get("gender");

  return {
    page: parseSitterPage(searchParams.get("page")),
    keyword: searchParams.get("keyword")?.trim() || undefined,
    sort: parseSitterSort(searchParams.get("sort")),
    filters: {
      regions: normalizeSitterRegions(searchParams.get("regions")?.split(",") ?? []),
      serviceTypes:
        serviceTypes === "ALL"
          ? "ALL"
          : SERVICE_TYPE_OPTIONS.find((option) => option.value === serviceTypes)?.value,
      gender:
        gender === "ALL" ? "ALL" : GENDER_OPTIONS.find((option) => option.value === gender)?.value,
    },
  };
}

export function toSitterListSearchParams(
  state: SitterListState,
  currentSearch = "",
): URLSearchParams {
  const params = new URLSearchParams(currentSearch);

  for (const key of ["page", "keyword", "sort", "regions", "serviceTypes", "gender"]) {
    params.delete(key);
  }

  if (state.page !== 1) {
    params.set("page", String(state.page));
  }

  if (state.keyword?.trim()) {
    params.set("keyword", state.keyword.trim());
  }

  if (state.sort !== "RATING_DESC") {
    params.set("sort", state.sort);
  }

  const { regions, serviceTypes, gender } = state.filters;

  if (regions) {
    params.set("regions", Array.isArray(regions) ? regions.join(",") : regions);
  }

  if (serviceTypes) {
    params.set("serviceTypes", serviceTypes);
  }

  if (gender) {
    params.set("gender", gender);
  }

  return params;
}
