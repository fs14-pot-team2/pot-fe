"use client";

import Image from "next/image";
import { useState } from "react";
import { useReceivedRequests } from "@/features/care-requests/sitter/useReceivedRequests";
import ReceivedRequestCard from "@/components/common/ReceivedRequestCard/ReceivedRequestCard";
import BottomSheet, {
  BottomSheetOption,
  type BottomSheetTab,
} from "@/components/ui/BottomSheet/BottomSheet";
import CheckBox from "@/components/ui/CheckBox/CheckBox";
import DropDown from "@/components/ui/DropDown/DropDown";
import FilterChip from "@/components/ui/FilterChip/FilterChip";
import IconButton from "@/components/ui/IconButton/IconButton";
import Pagination from "@/components/ui/Pagination/Pagination";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Sort from "@/components/ui/Sort/Sort";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useIgnoreReceivedRequest } from "@/features/care-requests/sitter/useIgnoreReceivedRequest";
import RejectRequestModal from "@/features/care-requests/sitter/RejectRequestModal";
import { useRejectDesignatedRequest } from "@/features/care-requests/sitter/useRejectDesignatedRequest";
import type {
  ReceivedRequestItem,
  ReceivedRequestSort,
  Region,
  ServiceType,
} from "@/types/receivedRequest";
import styles from "./ReceivedRequestsPage.module.css";

const REGION_OPTIONS: { value: Region | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SEOUL", label: "서울" },
  { value: "GYEONGGI", label: "경기" },
  { value: "INCHEON", label: "인천" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "SEJONG", label: "세종" },
  { value: "DAEJEON", label: "대전" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GWANGJU", label: "광주" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "DAEGU", label: "대구" },
  { value: "ULSAN", label: "울산" },
  { value: "BUSAN", label: "부산" },
  { value: "JEJU", label: "제주" },
];

const SORT_OPTIONS: { value: ReceivedRequestSort; label: string }[] = [
  { value: "LATEST", label: "요청일 빠른순" },
  { value: "START_DATE_ASC", label: "시작일 빠른순" },
];

const MOBILE_FILTER_TABS: BottomSheetTab[] = [
  { label: "지역", value: "region" },
  { label: "돌봄 방식", value: "careType" },
];

const MOBILE_CARE_TYPE_OPTIONS: { value: ServiceType | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SHORT_CARE", label: "잠깐만 돌봄" },
  { value: "REGULAR_CARE", label: "꾸준히 돌봄" },
];

const PAGE_SIZE = 8;

function toggleRegion(currentRegions: (Region | "ALL")[], selectedRegion: Region | "ALL") {
  if (selectedRegion === "ALL") {
    return ["ALL"] as const;
  }

  const individualRegions = currentRegions.filter((region) => region !== "ALL") as Region[];
  const nextRegions = individualRegions.includes(selectedRegion)
    ? individualRegions.filter((region) => region !== selectedRegion)
    : [...individualRegions, selectedRegion];

  return nextRegions.length > 0 ? nextRegions : (["ALL"] as const);
}

export default function ReceivedRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<(Region | "ALL")[]>(["ALL"]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
  const [designatedOnly, setDesignatedOnly] = useState(false);
  const [sort, setSort] = useState<ReceivedRequestSort>("LATEST");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftRegions, setDraftRegions] = useState<(Region | "ALL")[]>(["ALL"]);
  const [draftServiceType, setDraftServiceType] = useState<ServiceType | "ALL">("ALL");
  const [rejectTarget, setRejectTarget] = useState<ReceivedRequestItem | null>(null);

  const { mutate: ignoreRequest, isPending: isIgnoring } = useIgnoreReceivedRequest();

  const { mutate: rejectRequest, isPending: isRejecting } = useRejectDesignatedRequest();

  const handleHideRequest = (careRequestId: string) => {
    if (isIgnoring) return;

    ignoreRequest(careRequestId);
  };

  const handleRegionChange = (regions: string[]) => {
    setSelectedRegions(regions.length > 0 ? (regions as (Region | "ALL")[]) : ["ALL"]);
    setCurrentPage(1);
  };

  const handleServiceTypeToggle = (serviceType: ServiceType) => {
    setSelectedServiceTypes((previous) =>
      previous.includes(serviceType)
        ? previous.filter((value) => value !== serviceType)
        : [...previous, serviceType],
    );
    setCurrentPage(1);
  };

  const handleFilterOpen = () => {
    setDraftRegions(selectedRegions);
    setDraftServiceType(selectedServiceTypes.length === 1 ? selectedServiceTypes[0] : "ALL");
    setIsFilterOpen(true);
  };

  const handleFilterApply = () => {
    setSelectedRegions(draftRegions);
    setSelectedServiceTypes(draftServiceType === "ALL" ? [] : [draftServiceType]);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setDraftRegions(["ALL"]);
    setDraftServiceType("ALL");
  };

  const handleSearch = (value: string) => {
    setAppliedKeyword(value.trim());
    setCurrentPage(1);
  };

  const handleDesignatedOnlyChange = (checked: boolean) => {
    setDesignatedOnly(checked);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value as ReceivedRequestSort);
    setCurrentPage(1);
  };

  const handleRejectModalOpen = (request: ReceivedRequestItem) => {
    if (!request.designatedRequestId) return;

    setRejectTarget(request);
  };

  const handleRejectModalClose = () => {
    if (isRejecting) return;

    setRejectTarget(null);
  };

  const handleRejectSubmit = (reason: string) => {
    if (!rejectTarget?.designatedRequestId || isRejecting) return;

    rejectRequest(
      {
        designatedRequestId: rejectTarget.designatedRequestId,
        reason,
      },
      {
        onSuccess: () => {
          setRejectTarget(null);
        },
      },
    );
  };

  const { data, isPending, isError, refetch } = useReceivedRequests({
    page: currentPage,
    pageSize: PAGE_SIZE,
    serviceTypes: selectedServiceTypes,
    designatedOnly,
    keyword: appliedKeyword,
    sort,
  });

  const requests = data?.items ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>받은 요청</h1>

        <SearchInput
          value={searchInput}
          placeholder="어떤 팟오너를 찾고 계세요?"
          onChange={setSearchInput}
          onSearch={handleSearch}
        />

        <div className={styles.desktopFilters}>
          <div className={styles.regionFilter}>
            <DropDown
              placeholder="지역"
              options={REGION_OPTIONS}
              value={selectedRegions}
              multiple
              exclusiveValue="ALL"
              maxSelections={16}
              menuColumns={2}
              onChange={handleRegionChange}
            />
          </div>

          <FilterChip
            label="잠깐만 돌봄"
            selected={selectedServiceTypes.includes("SHORT_CARE")}
            onClick={() => handleServiceTypeToggle("SHORT_CARE")}
            className={styles.careTypeChip}
          />

          <FilterChip
            label="꾸준히 돌봄"
            selected={selectedServiceTypes.includes("REGULAR_CARE")}
            onClick={() => handleServiceTypeToggle("REGULAR_CARE")}
            className={styles.careTypeChip}
          />
        </div>

        <div className={styles.listToolbar}>
          <div className={styles.listSummary}>
            <p className={styles.totalCount}>전체 {data?.totalCount ?? 0}건</p>
            <CheckBox
              checked={designatedOnly}
              label="지정 견적 요청"
              onChange={handleDesignatedOnlyChange}
            />
          </div>

          <div className={styles.listTools}>
            <div className={styles.sort}>
              <Sort options={SORT_OPTIONS} value={sort} onChange={handleSortChange} />
            </div>

            <IconButton
              className={styles.mobileFilterButton}
              aria-label="필터 열기"
              aria-expanded={isFilterOpen}
              onClick={handleFilterOpen}
            >
              <Image src="/icons/ic_filter.svg" alt="" width={20} height={20} />
            </IconButton>
          </div>
        </div>

        <section className={styles.requestList} aria-label="받은 요청 목록">
          {isPending && (
            <p className={`${styles.listState} ${styles.loadingState}`}>
              요청 목록을 불러오고 있어요.
            </p>
          )}

          {isError && (
            <EmptyState
              className={styles.listState}
              messages={["요청 목록을 불러오지 못했어요."]}
              action={{
                label: "다시 시도",
                onClick: () => void refetch(),
              }}
            />
          )}

          {!isPending && !isError && requests.length === 0 && (
            <EmptyState className={styles.listState} messages={["아직 받은 요청이 없어요."]} />
          )}

          {!isPending &&
            !isError &&
            requests.map(({ careRequest, designatedRequestId }) => (
              <ReceivedRequestCard
                key={careRequest.id}
                request={{
                  ownerNickname: careRequest.owner.nickname,
                  serviceType: careRequest.serviceType,
                  startDate: careRequest.startDate,
                  endDate: careRequest.endDate,
                  createdAt: careRequest.createdAt,
                  sido: careRequest.sido,
                  sigungu: careRequest.sigungu,
                  bname: careRequest.bname,
                }}
                isDesignated={designatedRequestId !== null}
                onHide={() => handleHideRequest(careRequest.id)}
                onReject={() =>
                  handleRejectModalOpen({
                    careRequest,
                    designatedRequestId,
                  })
                }
                onSendQuote={() => window.alert("견적 보내기 모달을 연결할 예정입니다.")}
              />
            ))}
        </section>

        <Pagination
          className={styles.pagination}
          currentPage={currentPage}
          totalPages={data?.totalPages ?? 0}
          onPageChange={setCurrentPage}
        />
      </div>

      <BottomSheet
        isOpen={isFilterOpen}
        tabs={MOBILE_FILTER_TABS}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      >
        {{
          region: (
            <div>
              {REGION_OPTIONS.map((region) => {
                const individualRegionCount = draftRegions.filter(
                  (value) => value !== "ALL",
                ).length;
                const isSelected = draftRegions.includes(region.value);
                const isDisabled =
                  region.value !== "ALL" && !isSelected && individualRegionCount >= 16;

                return (
                  <BottomSheetOption
                    key={region.value}
                    label={region.label}
                    selected={isSelected}
                    disabled={isDisabled}
                    onClick={() =>
                      setDraftRegions((current) => [...toggleRegion(current, region.value)])
                    }
                  />
                );
              })}
            </div>
          ),
          careType: (
            <div>
              {MOBILE_CARE_TYPE_OPTIONS.map((careType) => (
                <BottomSheetOption
                  key={careType.value}
                  label={careType.label}
                  selected={draftServiceType === careType.value}
                  onClick={() => setDraftServiceType(careType.value)}
                />
              ))}
            </div>
          ),
        }}
      </BottomSheet>

      {rejectTarget && (
        <RejectRequestModal
          isOpen
          request={rejectTarget.careRequest}
          isSubmitting={isRejecting}
          onClose={handleRejectModalClose}
          onSubmit={handleRejectSubmit}
        />
      )}
    </main>
  );
}
