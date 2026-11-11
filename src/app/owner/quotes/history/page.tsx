"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import DropDown from "@/components/ui/DropDown/DropDown";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Toggle from "@/components/ui/Toggle/Toggle";

import MyQuoteManagement, {
  type MyQuoteItem,
} from "@/components/common/MyQuoteManagement/MyQuoteManagement";

import { useHistoryQuotes } from "@/features/quotes/owner/hooks/useHistoryQuotes";

import type {
  HistoryFilterStatus,
  HistoryQuoteItem,
  HistorySitter,
} from "@/features/quotes/owner/types/historyQuotes";

import quotePageStyles from "../page.module.css";
import styles from "./page.module.css";

const QUOTE_TABS = [
  { label: "요청한 견적 현황", value: "active" },
  { label: "받았던 견적", value: "history" },
];

const FILTER_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "확정된 요청", value: "MATCHED" },
  { label: "만료된 요청", value: "EXPIRED" },
];

function mapSitter(sitter: HistorySitter) {
  return {
    nickname: sitter.nickname,
    shortIntroduction: sitter.shortIntroduction,
    profileImage: sitter.profileImageUrl,
    rating: sitter.averageRating,
    reviewCount: sitter.reviewCount,
    confirmedCount: sitter.confirmedQuoteCount,
    gender: sitter.gender === "MALE" ? "남성" : "여성",
  };
}

function mapHistoryQuoteItems(item: HistoryQuoteItem): MyQuoteItem[] {
  const { careRequest } = item;

  const quotes: MyQuoteItem[] = item.quotes.map((quote) => {
    const isConfirmed = careRequest.confirmedQuoteId === quote.id;

    const status: MyQuoteItem["status"] = isConfirmed
      ? "confirmed"
      : careRequest.status === "EXPIRED"
        ? "expired"
        : null;

    return {
      id: quote.id,
      status,
      comment: "",
      price: quote.price,
      designatedRequestId: quote.designatedRequestId,
      rejectedRequestId: null,
      sitter: mapSitter(quote.sitter),
    };
  });

  const rejectedRequests: MyQuoteItem[] = item.rejectedRequests.map((request) => ({
    id: `rejected-${request.rejectedRequestId}`,
    status: "rejected",
    comment: "",
    designatedRequestId: request.designatedRequestId,
    rejectedRequestId: request.rejectedRequestId,
    sitter: mapSitter(request.sitter),
  }));

  return [...quotes, ...rejectedRequests];
}

function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "받았던 견적을 불러오지 못했습니다.";
  }

  const code = error.response?.data?.code;

  switch (code) {
    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
      return "로그인 상태를 확인해 주세요.";

    case "FORBIDDEN":
      return "팟오너 계정으로만 이용할 수 있습니다.";

    case "INVALID_REQUEST":
    case "INVALID_PAGE_PARAMETER":
      return "견적 조회 조건이 올바르지 않습니다.";

    default:
      return "받았던 견적을 불러오지 못했습니다.";
  }
}

interface HistoryRequestCardProps {
  item: HistoryQuoteItem;
  onQuoteDetail: (quoteId: string) => void;
}

function HistoryRequestCard({ item, onQuoteDetail }: HistoryRequestCardProps) {
  const { careRequest } = item;

  const location = [careRequest.sido, careRequest.sigungu, careRequest.bname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.requestItem}>
      <MyQuoteManagement
        variant="history"
        requestId={careRequest.id}
        careInfo={{
          createdAt: careRequest.createdAt,
          serviceType: careRequest.serviceType,
          startDate: careRequest.startDate,
          endDate: careRequest.endDate,
          location,
        }}
        requestStatus={careRequest.status}
        confirmedQuoteId={careRequest.confirmedQuoteId}
        quotes={mapHistoryQuoteItems(item)}
        canEdit={false}
        onEdit={() => {}}
        onDelete={async () => {}}
        onQuoteDetail={onQuoteDetail}
      />
    </div>
  );
}

export default function OwnerHistoryQuotesPage() {
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState<HistoryFilterStatus>("ALL");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useHistoryQuotes(filterStatus);

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, filterStatus]);

  const renderContent = () => {
    if (isPending) {
      return <Loading variant="content" />;
    }

    if (isError && !data) {
      return (
        <ErrorState
          variant="content"
          title="받았던 견적을 불러오지 못했어요"
          description={getErrorMessage(error)}
          actionLabel="다시 시도"
          onAction={() => void refetch()}
        />
      );
    }

    if (items.length === 0) {
      const emptyMessage =
        filterStatus === "MATCHED"
          ? "확정된 돌봄 요청이 없어요."
          : filterStatus === "EXPIRED"
            ? "기간이 만료된 돌봄 요청이 없어요."
            : "아직 받았던 견적 내역이 없어요.";

      return (
        <div className={quotePageStyles.feedback}>
          <EmptyState messages={[emptyMessage]} />
        </div>
      );
    }

    return (
      <>
        <div className={styles.requestList}>
          {items.map((item) => (
            <HistoryRequestCard
              key={item.careRequest.id}
              item={item}
              onQuoteDetail={(quoteId) => router.push(`/owner/quotes/${quoteId}`)}
            />
          ))}
        </div>

        {isFetchNextPageError && (
          <ErrorState
            variant="content"
            className={styles.loadMoreError}
            title="다음 견적 내역을 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            actionLabel="다시 시도"
            onAction={() => void fetchNextPage()}
          />
        )}

        {isFetchingNextPage && (
          <div className={styles.loadingMore}>
            <Loading variant="content" message="견적 내역을 더 불러오는 중..." />
          </div>
        )}

        {hasNextPage && !isFetchNextPageError && (
          <div ref={loadMoreRef} className={styles.loadMoreTrigger} aria-hidden="true" />
        )}
      </>
    );
  };

  return (
    <main className={quotePageStyles.main}>
      <div className="container">
        <div className={quotePageStyles.content}>
          <nav className={quotePageStyles.tabsNav} aria-label="견적 내역 메뉴">
            <Toggle
              variant="default"
              options={QUOTE_TABS}
              value="history"
              onChange={(value) => {
                if (value === "active") {
                  router.push("/owner/quotes");
                }
              }}
              className={quotePageStyles.tabs}
            />
          </nav>

          <div className={quotePageStyles.pageContent}>
            <div className={styles.filterArea}>
              <DropDown
                placeholder="전체"
                options={FILTER_OPTIONS}
                value={filterStatus}
                onChange={(value) => {
                  if (value === "ALL" || value === "MATCHED" || value === "EXPIRED") {
                    setFilterStatus(value);
                  }
                }}
                className={styles.filterDropDown}
              />
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
