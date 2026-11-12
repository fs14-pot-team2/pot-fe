"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import Toggle from "@/components/ui/Toggle/Toggle";
import CheckBox from "@/components/ui/CheckBox/CheckBox";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Loading from "@/components/ui/Loading/Loading";
import QuoteCard from "@/components/common/QuoteCard/QuoteCard";
import Tag from "@/components/ui/Tag/Tag";
import SendQuoteModal from "@/features/care-requests/sitter/SendQuoteModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import ReceivedRequestCard from "@/components/common/ReceivedRequestCard/ReceivedRequestCard";
import styles from "./SentQuotesPage.module.css";

import { formatDateOnly } from "@/utils/dateFormat";
import { useSentQuotes } from "@/features/quotes/sitter/hooks/useSentQuotes";
import { useUpdateQuote } from "@/features/quotes/sitter/hooks/useUpdateQuote";
import { useRejectedRequests } from "@/features/care-requests/sitter/useRejectedRequests";

import type { SentQuoteItem } from "@/features/quotes/sitter/types/sentQuote";
import type { QuoteFormValues } from "@/features/care-requests/sitter/SendQuoteModal";

type QuoteTab = "sent" | "rejected";

const QUOTE_TABS = [
  { label: "보낸 견적 조회", value: "sent" },
  { label: "반려한 요청", value: "rejected" },
];

export default function SitterSentQuotePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [confirmedOnly, setConfirmedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<QuoteTab>("sent");
  const [editTarget, setEditTarget] = useState<SentQuoteItem | null>(null);
  const handleEditOpen = (item: SentQuoteItem) => {
    setEditTarget(item);
  };

  const handleEditClose = () => {
    if (isUpdatingQuote) return;

    setEditTarget(null);
  };

  const router = useRouter();

  const { showToast } = useToast();

  const { data, isPending, isError, refetch } = useSentQuotes({
    page: currentPage,
    pageSize: 8,
    confirmedOnly,
  });

  const {
    data: rejectedData,
    isPending: isRejectedPending,
    isError: isRejectedError,
    refetch: refetchRejectedRequests,
  } = useRejectedRequests(
    {
      page: rejectedPage,
      pageSize: 8,
    },
    activeTab === "rejected",
  );

  const rejectedRequests = rejectedData?.items ?? [];

  const handleConfirmedOnlyChange = (checked: boolean) => {
    setConfirmedOnly(checked);
    setCurrentPage(1);
  };

  const { mutate: updateQuote, isPending: isUpdatingQuote } = useUpdateQuote();

  const sentQuotes = data?.items ?? [];

  const handleEditSubmit = (values: QuoteFormValues) => {
    if (!editTarget || isUpdatingQuote) return;

    updateQuote(
      {
        quoteId: editTarget.quote.id,
        input: values,
      },
      {
        onSuccess: () => {
          setEditTarget(null);
          showToast({ message: "견적이 수정되었습니다." });
        },
        onError: () => {
          showToast({
            message: "견적을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
        },
      },
    );
  };

  return (
    <PageMain>
      <PageContainer>
        <nav className={styles.tabArea} aria-label="견적 내역 메뉴">
          <Toggle
            className={styles.tabs}
            variant="default"
            options={QUOTE_TABS}
            value={activeTab}
            onChange={(value) => setActiveTab(value as QuoteTab)}
          />
        </nav>
      </PageContainer>

      <PageContainer>
        <div className={styles.content}>
          {activeTab === "sent" && (
            <>
              <div className={styles.filter}>
                <CheckBox
                  checked={confirmedOnly}
                  onChange={handleConfirmedOnlyChange}
                  label="확정견적"
                />
              </div>
              <section className={styles.quoteList} aria-label="보낸 견적 목록">
                {isPending && (
                  <Loading
                    className={styles.listState}
                    variant="content"
                    message="보낸 견적 목록을 불러오고 있어요."
                  />
                )}

                {isError && (
                  <EmptyState
                    className={styles.listState}
                    messages={["보낸 견적 목록을 불러오지 못했어요."]}
                    action={{
                      label: "다시 시도",
                      onClick: () => void refetch(),
                    }}
                  />
                )}

                {!isPending && !isError && sentQuotes.length === 0 && (
                  <EmptyState
                    className={styles.listState}
                    messages={["아직 보낸 견적이 없어요."]}
                  />
                )}

                {!isPending &&
                  !isError &&
                  sentQuotes.map((item) => {
                    const { quote, careRequest, owner, designatedRequestId } = item;

                    const location = [careRequest.sido, careRequest.sigungu, careRequest.bname]
                      .filter(Boolean)
                      .join(" ");

                    const isConfirmed = careRequest.confirmedQuoteId === quote.id;

                    return (
                      <QuoteCard
                        key={quote.id}
                        variant="sitter"
                        ownerNickname={owner.nickname}
                        startDate={formatDateOnly(careRequest.startDate, "korean")}
                        endDate={formatDateOnly(careRequest.endDate, "korean")}
                        location={location}
                        requestStatus={careRequest.status}
                        price={quote.price}
                        status={isConfirmed ? "confirmed" : undefined}
                        onDetailClick={() => router.push(`/sitter/quotes/${quote.id}`)}
                        onEditClick={
                          careRequest.status === "OPEN" ? () => handleEditOpen(item) : undefined
                        }
                        tags={
                          <>
                            <Tag
                              variant="request"
                              serviceType={careRequest.serviceType}
                              size="sm"
                            />

                            {designatedRequestId !== null && <Tag variant="designated" size="sm" />}
                          </>
                        }
                      />
                    );
                  })}
              </section>
              <Pagination
                className={styles.pagination}
                currentPage={currentPage}
                totalPages={data?.totalPages ?? 0}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          {activeTab === "rejected" && (
            <>
              <section className={styles.quoteList} aria-label="반려한 요청 목록">
                {isRejectedPending && (
                  <Loading
                    className={styles.listState}
                    variant="content"
                    message="반려 요청 목록을 불러오고 있어요."
                  />
                )}

                {isRejectedError && (
                  <EmptyState
                    className={styles.listState}
                    messages={["반려 요청 목록을 불러오지 못했어요."]}
                    action={{
                      label: "다시 시도",
                      onClick: () => void refetchRejectedRequests(),
                    }}
                  />
                )}

                {!isRejectedPending && !isRejectedError && rejectedRequests.length === 0 && (
                  <EmptyState
                    className={styles.listState}
                    messages={["아직 반려한 요청이 없어요."]}
                  />
                )}

                {!isRejectedPending &&
                  !isRejectedError &&
                  rejectedRequests.map((item) => {
                    const { rejectedRequest, careRequest } = item;

                    return (
                      <ReceivedRequestCard
                        key={rejectedRequest.id}
                        className={styles.rejectedCard}
                        displayStatus="rejected"
                        isDesignated
                        request={{
                          ownerNickname: careRequest.owner.nickname,
                          serviceType: careRequest.serviceType,
                          startDate: careRequest.startDate,
                          endDate: careRequest.endDate,
                          createdAt: rejectedRequest.createdAt,
                          sido: careRequest.sido,
                          sigungu: careRequest.sigungu,
                          bname: careRequest.bname,
                        }}
                      />
                    );
                  })}
              </section>

              <Pagination
                className={styles.pagination}
                currentPage={rejectedPage}
                totalPages={rejectedData?.totalPages ?? 0}
                onPageChange={setRejectedPage}
              />
            </>
          )}
        </div>

        {editTarget && (
          <SendQuoteModal
            isOpen
            mode="edit"
            request={{
              ...editTarget.careRequest,
              owner: editTarget.owner,
            }}
            initialValues={{
              price: editTarget.quote.price,
              comment: editTarget.quote.comment,
            }}
            isDesignated={editTarget.designatedRequestId !== null}
            isSubmitting={isUpdatingQuote}
            onClose={handleEditClose}
            onSubmit={handleEditSubmit}
          />
        )}
      </PageContainer>
    </PageMain>
  );
}
