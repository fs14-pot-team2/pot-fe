"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import Button from "@/components/ui/Button/Button";
import { useAuth } from "@/lib/auth/AuthProvider";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Loading from "@/components/ui/Loading/Loading";
import Tag from "@/components/ui/Tag/Tag";
import QuoteStatus from "@/components/ui/QuoteStatus/QuoteStatus";
import CareInfo from "@/components/common/CareInfo/CareInfo";
import SocialShare from "@/components/common/SocialShare/SocialShare";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import SendQuoteModal from "@/features/care-requests/sitter/SendQuoteModal";
import { useUpdateQuote } from "@/features/quotes/sitter/hooks/useUpdateQuote";
import styles from "./page.module.css";

import type { ReactNode } from "react";
import type { QuoteFormValues } from "@/features/care-requests/sitter/SendQuoteModal";
import { useSitterQuoteDetail } from "@/features/quotes/sitter/hooks/useSitterQuoteDetail";
import { useState, useSyncExternalStore } from "react";
import Image from "next/image";

const subscribe = () => () => {};

function useShareUrl() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => "",
  );
}

function QuoteDetailLayout({ children }: { children: ReactNode }) {
  return (
    <PageMain variant="fullWidth" className={styles.main}>
      <PageContainer>
        <header className={styles.pageHeader}>
          <h1>견적 상세</h1>
        </header>
      </PageContainer>

      <div className={styles.hero} aria-hidden="true" />

      <PageContainer className={styles.content}>{children}</PageContainer>
    </PageMain>
  );
}

export default function SitterQuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { user, status: authStatus } = useAuth();
  const router = useRouter();

  const shareUrl = useShareUrl();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { showToast } = useToast();

  const { mutate: updateQuote, isPending: isUpdatingQuote } = useUpdateQuote();

  const isValidQuoteId = /^\d+$/.test(quoteId) && BigInt(quoteId) > 0n;

  const { data, isPending, isError, error, refetch } = useSitterQuoteDetail(quoteId);

  const isAccessForbidden =
    isAxiosError(error) &&
    (error.response?.status === 403 ||
      error.response?.data?.code === "QUOTE_ACCESS_FORBIDDEN" ||
      error.response?.data?.code === "FORBIDDEN");

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace("/sitter/quotes");
  };

  if (!isValidQuoteId) {
    return (
      <QuoteDetailLayout>
        <div className={styles.feedback}>
          <EmptyState messages={["올바르지 않은 견적 번호예요."]} />
        </div>
      </QuoteDetailLayout>
    );
  }

  if (isPending) {
    return (
      <QuoteDetailLayout>
        <div className={styles.feedback}>
          <Loading variant="content" message="견적 정보를 불러오고 있어요." />
        </div>
      </QuoteDetailLayout>
    );
  }

  if (isError && isAccessForbidden) {
    return (
      <QuoteDetailLayout>
        <section className={styles.accessFeedback} role="alert">
          <h2 className={styles.accessTitle}>견적을 조회할 권한이 없어요</h2>
          <p className={styles.accessDescription}>현재 계정으로는 이 견적을 확인할 수 없어요.</p>
          <Button variant="solid" size="md" className={styles.accessAction} onClick={handleGoBack}>
            이전 페이지로 이동
          </Button>
        </section>
      </QuoteDetailLayout>
    );
  }

  if (isError) {
    return (
      <QuoteDetailLayout>
        <div className={styles.feedback}>
          <EmptyState
            messages={["견적 정보를 불러오지 못했어요."]}
            action={{
              label: "다시 시도",
              onClick: () => void refetch(),
            }}
          />
        </div>
      </QuoteDetailLayout>
    );
  }

  if (!data) {
    return (
      <QuoteDetailLayout>
        <div className={styles.feedback}>
          <EmptyState messages={["견적 정보를 찾을 수 없어요."]} />
        </div>
      </QuoteDetailLayout>
    );
  }

  const { quote, designatedRequestId, careRequest, owner, sitter } = data;

  const isDesignated = designatedRequestId !== null;
  const isConfirmed = careRequest.confirmedQuoteId === quote.id;
  const canEdit =
    authStatus === "authenticated" &&
    user?.role === "SITTER" &&
    user.id === sitter.id &&
    careRequest.status === "OPEN";

  const handleEditModalClose = () => {
    if (isUpdatingQuote) return;

    setIsEditModalOpen(false);
  };

  const handleEditSubmit = (values: QuoteFormValues) => {
    if (!canEdit || isUpdatingQuote) return;

    updateQuote(
      {
        quoteId: quote.id,
        input: values,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
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
    <>
      <QuoteDetailLayout>
        <div className={styles.layout}>
          <section className={styles.basicInfo} aria-label="견적 기본 정보">
            <div className={styles.tagRow}>
              {isDesignated && <Tag variant="designated" size="md" />}
            </div>

            <div className={styles.ownerRow}>
              <h2>{owner.nickname} 팟오너</h2>

              <div className={styles.ownerActions}>
                {canEdit && (
                  <IconButton
                    className={styles.editButton}
                    aria-label="견적 수정"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Image src="/icons/ic_edit.svg" alt="" width={20} height={20} />
                  </IconButton>
                )}

                {isConfirmed && <QuoteStatus status="confirmed" />}
              </div>
            </div>

            <section className={styles.quoteInfo} aria-label="견적 내용">
              <dl className={styles.priceRow}>
                <dt>견적가</dt>
                <dd>{quote.price.toLocaleString("ko-KR")}원</dd>
              </dl>

              <div className={styles.commentBlock}>
                <h2>견적 코멘트</h2>
                <p>{quote.comment}</p>
              </div>
            </section>

            <div className={styles.careInfo}>
              <CareInfo
                variant="detail"
                createdAt={careRequest.createdAt}
                serviceType={careRequest.serviceType}
                startDate={careRequest.startDate}
                endDate={careRequest.endDate}
                sido={careRequest.sido}
                sigungu={careRequest.sigungu}
                bname={careRequest.bname ?? ""}
                zonecode={careRequest.zonecode}
                address={careRequest.address}
                detailAddress={careRequest.detailAddress}
              />
            </div>
          </section>

          <aside className={styles.shareArea}>
            {shareUrl && <SocialShare url={shareUrl} title="견적서 공유하기" />}
          </aside>
        </div>
      </QuoteDetailLayout>

      {canEdit && isEditModalOpen && (
        <SendQuoteModal
          isOpen
          mode="edit"
          request={{
            ...careRequest,
            owner,
          }}
          initialValues={{
            price: quote.price,
            comment: quote.comment,
          }}
          isDesignated={isDesignated}
          isSubmitting={isUpdatingQuote}
          onClose={handleEditModalClose}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}
