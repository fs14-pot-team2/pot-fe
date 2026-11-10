import {
  GENDER_OPTIONS,
  REGION_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "@/features/profiles/sitter/constants";

export const REGION_FILTER_OPTIONS = [{ value: "ALL", label: "전체" }, ...REGION_OPTIONS];

export const SERVICE_FILTER_OPTIONS = [{ value: "ALL", label: "전체" }, ...SERVICE_TYPE_OPTIONS];

export const GENDER_FILTER_OPTIONS = [{ value: "ALL", label: "전체" }, ...GENDER_OPTIONS];
