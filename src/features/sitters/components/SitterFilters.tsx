"use client";

import DropDown from "@/components/ui/DropDown/DropDown";
import FilterReset from "@/components/ui/FilterReset/FilterReset";
import { GENDER_OPTIONS, SERVICE_TYPE_OPTIONS } from "@/features/profiles/sitter/constants";
import { GENDER_FILTER_OPTIONS, REGION_FILTER_OPTIONS, SERVICE_FILTER_OPTIONS } from "../constants";
import type { SitterFilterValues } from "../types/sitter";
import { MAX_SITTER_REGION_SELECTIONS, normalizeSitterRegions } from "../utils/sitterFilters";
import styles from "./SitterFilters.module.css";

type SitterFiltersProps = {
  value: SitterFilterValues;
  onChange: (changes: Partial<SitterFilterValues>) => void;
  onReset: () => void;
};

export default function SitterFilters({ value, onChange, onReset }: SitterFiltersProps) {
  const hasActiveFilters = Boolean(value.regions || value.serviceTypes || value.gender);

  const handleRegionChange = (selected: string[]) => {
    onChange({ regions: normalizeSitterRegions(selected) });
  };

  const handleServiceChange = (selected: string) => {
    const serviceTypes =
      selected === "ALL"
        ? "ALL"
        : SERVICE_TYPE_OPTIONS.find((option) => option.value === selected)?.value;

    onChange({ serviceTypes });
  };

  const handleGenderChange = (selected: string) => {
    const gender =
      selected === "ALL"
        ? "ALL"
        : GENDER_OPTIONS.find((option) => option.value === selected)?.value;

    onChange({ gender });
  };

  return (
    <div className={styles.filters}>
      <DropDown
        placeholder="지역"
        options={REGION_FILTER_OPTIONS}
        multiple
        menuColumns={2}
        exclusiveValue="ALL"
        maxSelections={MAX_SITTER_REGION_SELECTIONS}
        value={value.regions === "ALL" ? ["ALL"] : (value.regions ?? [])}
        onChange={handleRegionChange}
        className={styles.dropdown}
      />

      <DropDown
        placeholder="돌봄 방식"
        options={SERVICE_FILTER_OPTIONS}
        value={value.serviceTypes ?? ""}
        onChange={handleServiceChange}
        className={styles.dropdown}
      />

      <DropDown
        placeholder="성별"
        options={GENDER_FILTER_OPTIONS}
        value={value.gender ?? ""}
        onChange={handleGenderChange}
        className={styles.dropdown}
      />

      <div className={styles.reset}>
        <FilterReset onReset={onReset} disabled={!hasActiveFilters} />
      </div>
    </div>
  );
}
