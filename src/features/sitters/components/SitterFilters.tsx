"use client";

import DropDown from "@/components/ui/DropDown/DropDown";
import FilterReset from "@/components/ui/FilterReset/FilterReset";
import {
  GENDER_OPTIONS,
  REGION_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "@/features/profiles/sitter/constants";
import { GENDER_FILTER_OPTIONS, REGION_FILTER_OPTIONS, SERVICE_FILTER_OPTIONS } from "../constants";
import type { SitterListParams } from "../types/sitter";
import styles from "./SitterFilters.module.css";

type SitterFiltersProps = {
  value: SitterListParams;
  onChange: (changes: Partial<SitterListParams>) => void;
  onReset: () => void;
};

export default function SitterFilters({ value, onChange, onReset }: SitterFiltersProps) {
  const hasActiveFilters = Boolean(value.regions?.length || value.serviceTypes || value.gender);

  const handleRegionChange = (selected: string[]) => {
    const regions = REGION_OPTIONS.filter((option) => selected.includes(option.value)).map(
      (option) => option.value,
    );

    onChange({ regions: regions.length ? regions : undefined });
  };

  const handleServiceChange = (selected: string) => {
    const serviceTypes = SERVICE_TYPE_OPTIONS.find((option) => option.value === selected)?.value;

    onChange({ serviceTypes });
  };

  const handleGenderChange = (selected: string) => {
    const gender = GENDER_OPTIONS.find((option) => option.value === selected)?.value;

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
        maxSelections={16}
        value={value.regions ?? []}
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
