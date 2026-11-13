"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import PartnerCard from "@/components/common/PartnerCard/PartnerCard";
import BottomSheet, {
  BottomSheetOption,
  type BottomSheetTab,
} from "@/components/ui/BottomSheet/BottomSheet";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import IconButton from "@/components/ui/IconButton/IconButton";
import Loading from "@/components/ui/Loading/Loading";
import Pagination from "@/components/ui/Pagination/Pagination";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Sort from "@/components/ui/Sort/Sort";
import {
  GENDER_OPTIONS,
  REGION_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "@/features/profiles/sitter/constants";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { PartnerRegion } from "@/types/partner";
import Image from "next/image";
import { useState } from "react";
import { GENDER_FILTER_OPTIONS, SERVICE_FILTER_OPTIONS } from "../constants";
import { useSitters } from "../hooks/useSitters";
import type { SitterListParams, SitterSort } from "../types/sitter";
import SitterFilters from "./SitterFilters";
import styles from "./SittersPage.module.css";

type MobileFilterValues = Pick<SitterListParams, "regions" | "serviceTypes" | "gender">;

const SORT_OPTIONS: { label: string; value: SitterSort }[] = [
  { label: "평점 높은 순", value: "RATING_DESC" },
  { label: "리뷰 많은 순", value: "REVIEW_COUNT_DESC" },
  { label: "확정 많은 순", value: "CONFIRMED_QUOTE_COUNT_DESC" },
];

export default function SittersPage() {
  const [params, setParams] = useState<SitterListParams>({
    page: 1,
    sort: "RATING_DESC",
  });
  const [searchText, setSearchText] = useState("");
  const { status: authStatus } = useAuth();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<MobileFilterValues>({});

  const mobileFilterTabs: BottomSheetTab[] = [
    {
      label: draftFilters.regions?.length ? `지역 (${draftFilters.regions.length})` : "지역",
      value: "region",
    },
    {
      label: "돌봄 방식",
      value: "careType",
    },
    {
      label: "성별",
      value: "gender",
    },
  ];

  const { data, isPending, isError, refetch } = useSitters(params, authStatus !== "checking");

  const handlePageChange = (page: number) => {
    setParams((current) => ({
      ...current,
      page,
    }));
  };

  const handleSearch = (value: string) => {
    setParams((current) => ({
      ...current,
      keyword: value.trim() || undefined,
      page: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

    if (!selectedOption) return;

    setParams((current) => ({
      ...current,
      sort: selectedOption.value,
      page: 1,
    }));
  };

  const handleFilterChange = (changes: Partial<SitterListParams>) => {
    setParams((current) => ({
      ...current,
      ...changes,
      page: 1,
    }));
  };

  const handleFilterReset = () => {
    setParams((current) => ({
      ...current,
      regions: undefined,
      serviceTypes: undefined,
      gender: undefined,
      page: 1,
    }));
  };

  const handleMobileFilterOpen = () => {
    setDraftFilters({
      regions: params.regions,
      serviceTypes: params.serviceTypes,
      gender: params.gender,
    });

    setIsFilterOpen(true);
  };

  const handleMobileFilterApply = () => {
    handleFilterChange({
      regions: draftFilters.regions,
      serviceTypes: draftFilters.serviceTypes,
      gender: draftFilters.gender,
    });
  };

  const handleMobileFilterReset = () => {
    setDraftFilters({});
  };

  const handleMobileRegionChange = (region: PartnerRegion | "ALL") => {
    setDraftFilters((current) => {
      if (region === "ALL") {
        return { ...current, regions: undefined };
      }

      const currentRegions = current.regions ?? [];

      if (currentRegions.includes(region)) {
        const regions = currentRegions.filter((item) => item !== region);
        return { ...current, regions: regions.length ? regions : undefined };
      }

      if (currentRegions.length >= 16) return current;

      return { ...current, regions: [...currentRegions, region] };
    });
  };

  const handleMobileServiceChange = (selected: string) => {
    const serviceTypes = SERVICE_TYPE_OPTIONS.find((option) => option.value === selected)?.value;

    setDraftFilters((current) => ({
      ...current,
      serviceTypes,
    }));
  };

  const handleMobileGenderChange = (selected: string) => {
    const gender = GENDER_OPTIONS.find((option) => option.value === selected)?.value;

    setDraftFilters((current) => ({
      ...current,
      gender,
    }));
  };

  return (
    <PageMain>
      <PageContainer>
        <h1 className={styles.title}>팟트너 찾기</h1>

        <SearchInput
          value={searchText}
          onChange={setSearchText}
          onSearch={handleSearch}
          placeholder="팟트너 닉네임을 검색해 주세요."
          className={styles.search}
        />

        <div className={styles.toolbar}>
          <div className={styles.desktopFilters}>
            <SitterFilters
              value={params}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>

          <IconButton
            className={styles.mobileFilterButton}
            aria-label="필터 열기"
            aria-expanded={isFilterOpen}
            onClick={handleMobileFilterOpen}
          >
            <Image src="/icons/ic_filter.svg" alt="" width={20} height={20} />
          </IconButton>

          <div className={styles.sort}>
            <Sort options={SORT_OPTIONS} value={params.sort} onChange={handleSortChange} />
          </div>
        </div>

        {isPending ? (
          <Loading variant="content" />
        ) : isError ? (
          <ErrorState variant="content" onAction={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            messages={["조건에 맞는 팟트너가 없어요."]}
            size="lg"
            className={styles.emptyState}
          />
        ) : (
          <>
            <section className={styles.cards} aria-label="팟트너 목록">
              {data.items.map((sitter) => (
                <PartnerCard key={sitter.id} partner={sitter} href={`/sitters/${sitter.id}`} />
              ))}
            </section>

            <Pagination
              currentPage={params.page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
              className={styles.pagination}
            />
          </>
        )}
      </PageContainer>

      <BottomSheet
        isOpen={isFilterOpen}
        tabs={mobileFilterTabs}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleMobileFilterApply}
        onReset={handleMobileFilterReset}
      >
        {{
          region: (
            <div>
              <BottomSheetOption
                label="전체"
                selected={!draftFilters.regions?.length}
                onClick={() => handleMobileRegionChange("ALL")}
              />

              {REGION_OPTIONS.map((region) => {
                const isSelected = draftFilters.regions?.includes(region.value) ?? false;

                return (
                  <BottomSheetOption
                    key={region.value}
                    label={region.label}
                    selected={isSelected}
                    disabled={!isSelected && (draftFilters.regions?.length ?? 0) >= 16}
                    onClick={() => handleMobileRegionChange(region.value)}
                  />
                );
              })}
            </div>
          ),
          careType: (
            <div>
              {SERVICE_FILTER_OPTIONS.map((option) => (
                <BottomSheetOption
                  key={option.value}
                  label={option.label}
                  selected={(draftFilters.serviceTypes ?? "ALL") === option.value}
                  onClick={() => handleMobileServiceChange(option.value)}
                />
              ))}
            </div>
          ),
          gender: (
            <div>
              {GENDER_FILTER_OPTIONS.map((option) => (
                <BottomSheetOption
                  key={option.value}
                  label={option.label}
                  selected={(draftFilters.gender ?? "ALL") === option.value}
                  onClick={() => handleMobileGenderChange(option.value)}
                />
              ))}
            </div>
          ),
        }}
      </BottomSheet>
    </PageMain>
  );
}
