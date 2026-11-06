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
import FilterReset from "@/components/ui/FilterReset/FilterReset";
import IconButton from "@/components/ui/IconButton/IconButton";
import Pagination from "@/components/ui/Pagination/Pagination";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Sort from "@/components/ui/Sort/Sort";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useIgnoreReceivedRequest } from "@/features/care-requests/sitter/useIgnoreReceivedRequest";
import RejectRequestModal from "@/features/care-requests/sitter/RejectRequestModal";
import { useRejectDesignatedRequest } from "@/features/care-requests/sitter/useRejectDesignatedRequest";
import SendQuoteModal, {
  type QuoteFormValues,
} from "@/features/care-requests/sitter/SendQuoteModal";
import { useCreateQuote } from "@/features/care-requests/sitter/useCreateQuote";
import type {
  ReceivedRequestItem,
  ReceivedRequestSort,
  Region,
  ServiceType,
} from "@/types/receivedRequest";
import styles from "./ReceivedRequestsPage.module.css";

const REGION_LABELS: Record<Region, string> = {
  SEOUL: "서울",
  GYEONGGI: "경기",
  INCHEON: "인천",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  SEJONG: "세종",
  DAEJEON: "대전",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GWANGJU: "광주",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  DAEGU: "대구",
  ULSAN: "울산",
  BUSAN: "부산",
  JEJU: "제주",
};

const REGION_ORDER = Object.keys(REGION_LABELS) as Region[];

const SORT_OPTIONS: { value: ReceivedRequestSort; label: string }[] = [
  { value: "LATEST", label: "등록일 최신순" },
  { value: "START_DATE_ASC", label: "시작일 빠른순" },
];

const MOBILE_FILTER_TABS: BottomSheetTab[] = [
  { label: "지역", value: "region" },
  { label: "돌봄 방식", value: "careType" },
];

const CARE_TYPE_OPTIONS: { value: ServiceType | "ALL"; label: string }[] = [
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
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<(Region | "ALL")[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | "ALL" | "">("");
  const [designatedOnly, setDesignatedOnly] = useState(false);
  const [sort, setSort] = useState<ReceivedRequestSort>("LATEST");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftRegions, setDraftRegions] = useState<(Region | "ALL")[]>([]);
  const [draftServiceType, setDraftServiceType] = useState<ServiceType | "ALL" | "">("");
  const [rejectTarget, setRejectTarget] = useState<ReceivedRequestItem | null>(null);
  const [quoteTarget, setQuoteTarget] = useState<ReceivedRequestItem | null>(null);

  const { mutate: ignoreRequest, isPending: isIgnoring } = useIgnoreReceivedRequest();

  const { mutate: rejectRequest, isPending: isRejecting } = useRejectDesignatedRequest();

  const { mutate: sendQuote, isPending: isSendingQuote } = useCreateQuote();

  const handleHideRequest = (careRequestId: string) => {
    if (isIgnoring) return;

    ignoreRequest(careRequestId, {
      onError: () => {
        showToast({ message: "요청을 숨기지 못했습니다. 잠시 후 다시 시도해 주세요." });
      },
    });
  };

  const handleRegionChange = (regions: string[]) => {
    setSelectedRegions(regions as (Region | "ALL")[]);
    setCurrentPage(1);
  };

  const handleServiceTypeChange = (value: string) => {
    setSelectedServiceType(value as ServiceType | "ALL" | "");
    setCurrentPage(1);
  };

  const handleFilterOpen = () => {
    setDraftRegions(selectedRegions);
    setDraftServiceType(selectedServiceType);
    setIsFilterOpen(true);
  };

  const handleFilterApply = () => {
    setSelectedRegions(draftRegions);
    setSelectedServiceType(draftServiceType);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setDraftRegions([]);
    setDraftServiceType("");
  };

  const handleDesktopFilterReset = () => {
    setSelectedRegions([]);
    setSelectedServiceType("");
    setCurrentPage(1);
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
        onError: () => {
          showToast({ message: "요청을 반려하지 못했습니다. 잠시 후 다시 시도해 주세요." });
        },
      },
    );
  };

  const handleQuoteModalOpen = (request: ReceivedRequestItem) => {
    setQuoteTarget(request);
  };

  const handleQuoteModalClose = () => {
    if (isSendingQuote) return;

    setQuoteTarget(null);
  };

  const handleQuoteSubmit = ({ price, comment }: QuoteFormValues) => {
    if (!quoteTarget || isSendingQuote) return;

    sendQuote(
      {
        careRequestId: quoteTarget.careRequest.id,
        price,
        comment,
      },
      {
        onSuccess: () => {
          setQuoteTarget(null);
        },
        onError: () => {
          showToast({ message: "견적을 보내지 못했습니다. 잠시 후 다시 시도해 주세요." });
        },
      },
    );
  };

  const appliedRegions = selectedRegions.includes("ALL") ? [] : (selectedRegions as Region[]);

  const { data, isPending, isError, refetch } = useReceivedRequests({
    page: currentPage,
    pageSize: PAGE_SIZE,
    serviceTypes:
      selectedServiceType === "" || selectedServiceType === "ALL" ? [] : [selectedServiceType],
    designatedOnly,
    regions: appliedRegions,
    keyword: appliedKeyword,
    sort,
  });

  const availableRegionSet = new Set(data?.availableRegions ?? []);

  const regionOptions: { value: Region | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    ...REGION_ORDER.filter((region) => availableRegionSet.has(region)).map((region) => ({
      value: region,
      label: REGION_LABELS[region],
    })),
  ];

  const maxRegionSelections = Math.max((data?.availableRegions.length ?? 0) - 1, 0);

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
              options={regionOptions}
              value={selectedRegions}
              multiple
              exclusiveValue="ALL"
              maxSelections={maxRegionSelections}
              menuColumns={2}
              onChange={handleRegionChange}
            />
          </div>

          <div className={styles.careTypeFilter}>
            <DropDown
              placeholder="돌봄 방식"
              options={CARE_TYPE_OPTIONS}
              value={selectedServiceType}
              onChange={handleServiceTypeChange}
            />
          </div>

          <div className={styles.desktopResetButton}>
            <FilterReset onReset={handleDesktopFilterReset} />
          </div>
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
                onSendQuote={() =>
                  handleQuoteModalOpen({
                    careRequest,
                    designatedRequestId,
                  })
                }
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
              {regionOptions.map((region) => {
                const individualRegionCount = draftRegions.filter(
                  (value) => value !== "ALL",
                ).length;
                const isSelected = draftRegions.includes(region.value);
                const isDisabled =
                  region.value !== "ALL" &&
                  !isSelected &&
                  individualRegionCount >= maxRegionSelections;

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
              {CARE_TYPE_OPTIONS.map((careType) => (
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

      {quoteTarget && (
        <SendQuoteModal
          isOpen
          request={quoteTarget.careRequest}
          isDesignated={quoteTarget.designatedRequestId !== null}
          isSubmitting={isSendingQuote}
          onClose={handleQuoteModalClose}
          onSubmit={handleQuoteSubmit}
        />
      )}
    </main>
  );
}
