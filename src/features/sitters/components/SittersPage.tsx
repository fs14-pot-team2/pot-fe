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
import { hashKey } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { GENDER_FILTER_OPTIONS, SERVICE_FILTER_OPTIONS } from "../constants";
import { useSitterListState } from "../context/SitterListStateProvider";
import { useSitterListUrlState } from "../hooks/useSitterListUrlState";
import { useSitters } from "../hooks/useSitters";
import { sitterKeys } from "../queryKeys";
import type { SitterFilterValues, SitterSort } from "../types/sitter";
import {
  MAX_SITTER_REGION_SELECTIONS,
  toggleSitterRegion,
  toSitterListParams,
} from "../utils/sitterFilters";
import SitterFilters from "./SitterFilters";
import styles from "./SittersPage.module.css";

const SORT_OPTIONS: { label: string; value: SitterSort }[] = [
  { label: "평점 높은 순", value: "RATING_DESC" },
  { label: "리뷰 많은 순", value: "REVIEW_COUNT_DESC" },
  { label: "확정 많은 순", value: "CONFIRMED_QUOTE_COUNT_DESC" },
];

export default function SittersPage() {
  const { listState, setListState } = useSitterListUrlState();
  const { searchDraft, setSearchDraft } = useSitterListState();

  const appliedKeyword = listState.keyword ?? "";

  const searchText =
    searchDraft && searchDraft.keyword === appliedKeyword ? searchDraft.text : appliedKeyword;

  const params = toSitterListParams(listState);
  const { status: authStatus } = useAuth();

  const currentQueryHash = hashKey(sitterKeys.list(params));
  const currentConditionsHash = hashKey(sitterKeys.list({ ...params, page: 1 }));

  const [queryTransition, setQueryTransition] = useState<{
    queryHash: string;
    conditionsHash: string;
    kind: "page" | "conditions" | null;
  }>({
    queryHash: currentQueryHash,
    conditionsHash: currentConditionsHash,
    kind: null,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<SitterFilterValues>({});

  const draftRegions = Array.isArray(draftFilters.regions) ? draftFilters.regions : [];

  const hasActiveDraftFilters = Boolean(
    draftFilters.regions || draftFilters.serviceTypes || draftFilters.gender,
  );

  const mobileFilterTabs: BottomSheetTab[] = [
    {
      label: draftRegions.length ? `지역 (${draftRegions.length})` : "지역",
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

  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useSitters(
    params,
    authStatus !== "checking",
  );

  if (queryTransition.queryHash !== currentQueryHash) {
    setQueryTransition({
      queryHash: currentQueryHash,
      conditionsHash: currentConditionsHash,
      kind: queryTransition.conditionsHash === currentConditionsHash ? "page" : "conditions",
    });
  } else if (queryTransition.kind !== null && !isFetching && !isPlaceholderData) {
    setQueryTransition({
      ...queryTransition,
      kind: null,
    });
  }

  const isQueryChanging = queryTransition.kind !== null && isFetching;

  const isPageChanging = queryTransition.kind === "page" && isFetching;

  const isListLoading = isPending || isPlaceholderData || isQueryChanging;

  const canShowPagination =
    data &&
    data.totalPages >= params.page &&
    (isPageChanging || isPlaceholderData || (!isListLoading && !isError && data.items.length > 0));

  const handlePageChange = (page: number) => {
    setListState((current) => ({
      ...current,
      page,
    }));
  };

  const setSearchText = (value: string) => {
    setSearchDraft({
      keyword: appliedKeyword,
      text: value,
    });
  };

  const handleSearch = (value: string) => {
    setSearchDraft(null);

    setListState((current) => ({
      ...current,
      keyword: value.trim() || undefined,
      page: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

    if (!selectedOption) return;

    setListState((current) => ({
      ...current,
      sort: selectedOption.value,
      page: 1,
    }));
  };

  const handleFilterChange = (changes: Partial<SitterFilterValues>) => {
    setListState((current) => ({
      ...current,
      filters: {
        ...current.filters,
        ...changes,
      },
      page: 1,
    }));
  };

  const handleFilterReset = () => {
    setListState((current) => ({
      ...current,
      filters: {},
      page: 1,
    }));
  };

  const handleMobileFilterOpen = () => {
    setDraftFilters({ ...listState.filters });
    setIsFilterOpen(true);
  };

  const handleMobileFilterApply = () => {
    setListState((current) => ({
      ...current,
      filters: { ...draftFilters },
      page: 1,
    }));
  };

  const handleMobileFilterReset = () => {
    setDraftFilters({});
  };

  const handleMobileRegionChange = (region: PartnerRegion | "ALL") => {
    setDraftFilters((current) => ({
      ...current,
      regions: toggleSitterRegion(current.regions, region),
    }));
  };

  const handleMobileServiceChange = (selected: string) => {
    const serviceTypes =
      selected === "ALL"
        ? "ALL"
        : SERVICE_TYPE_OPTIONS.find((option) => option.value === selected)?.value;

    setDraftFilters((current) => ({
      ...current,
      serviceTypes,
    }));
  };

  const handleMobileGenderChange = (selected: string) => {
    const gender =
      selected === "ALL"
        ? "ALL"
        : GENDER_OPTIONS.find((option) => option.value === selected)?.value;

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
              value={listState.filters}
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

        {isListLoading ? (
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
          <section className={styles.cards} aria-label="팟트너 목록">
            {data.items.map((sitter) => (
              <PartnerCard key={sitter.id} partner={sitter} href={`/sitters/${sitter.id}`} />
            ))}
          </section>
        )}

        {canShowPagination && (
          <Pagination
            currentPage={params.page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            className={styles.pagination}
          />
        )}
      </PageContainer>

      <BottomSheet
        isOpen={isFilterOpen}
        tabs={mobileFilterTabs}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleMobileFilterApply}
        onReset={handleMobileFilterReset}
        resetDisabled={!hasActiveDraftFilters}
      >
        {{
          region: (
            <div>
              <BottomSheetOption
                label="전체"
                selected={draftFilters.regions === "ALL"}
                onClick={() => handleMobileRegionChange("ALL")}
              />

              {REGION_OPTIONS.map((region) => {
                const isSelected = draftRegions.includes(region.value);

                return (
                  <BottomSheetOption
                    key={region.value}
                    label={region.label}
                    selected={isSelected}
                    disabled={!isSelected && draftRegions.length >= MAX_SITTER_REGION_SELECTIONS}
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
                  selected={draftFilters.serviceTypes === option.value}
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
                  selected={draftFilters.gender === option.value}
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
