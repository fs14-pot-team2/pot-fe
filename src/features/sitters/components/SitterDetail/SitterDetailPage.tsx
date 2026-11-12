"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import PartnerDetail from "@/components/common/PartnerDetail/PartnerDetail";
import SocialShare from "@/components/common/SocialShare/SocialShare";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Pagination from "@/components/ui/Pagination/Pagination";
import { useSitterReviews } from "@/features/profiles/sitter/hooks/useSitterReviews";
import { useSitterDetail } from "@/features/sitters/hooks/useSitterDetail";
import { isAxiosError } from "axios";
import { useState, useSyncExternalStore } from "react";
import SitterDetailActions from "./SitterDetailActions";
import styles from "./SitterDetailPage.module.css";

const subscribe = () => () => {};

type SitterDetailPageProps = {
  sitterId: string;
};

function SitterDetailContent({ sitterId }: SitterDetailPageProps) {
  const [reviewPage, setReviewPage] = useState(1);
  const shareUrl = useSyncExternalStore(
    subscribe,
    () => `${window.location.origin}/sitters/${sitterId}`,
    () => "",
  );

  const {
    data: partner,
    isPending: isPartnerPending,
    isError: isPartnerError,
    error: partnerError,
    refetch: refetchPartner,
  } = useSitterDetail(sitterId);

  const {
    data: reviews,
    isPending: isReviewPending,
    refetch: refetchReviews,
  } = useSitterReviews({
    sitterId: partner?.id,
    page: reviewPage,
    pageSize: 8,
  });

  if (isPartnerPending) {
    return <Loading variant="content" />;
  }

  if (isPartnerError) {
    const isNotFound =
      isAxiosError<{ code?: string }>(partnerError) &&
      partnerError.response?.status === 404 &&
      partnerError.response?.data?.code === "SITTER_NOT_FOUND";

    if (isNotFound) {
      return (
        <EmptyState className={styles.notFound} messages={["팟트너를 찾을 수 없어요."]} size="lg" />
      );
    }

    return <ErrorState variant="page" onAction={() => void refetchPartner()} />;
  }

  const reviewFallback = isReviewPending ? (
    <Loading variant="content" />
  ) : (
    <ErrorState variant="content" onAction={() => void refetchReviews()} />
  );

  return (
    <div className={styles.page}>
      <PageContainer>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>팟트너 상세</h1>
        </div>
      </PageContainer>

      <div className={styles.banner} aria-hidden="true" />

      <PageContainer>
        <div className={styles.content}>
          <div className={styles.layout}>
            <div className={styles.detail}>
              <PartnerDetail
                partner={partner}
                reviews={reviews}
                showDesignatedTag={partner.designatedRequestId !== null}
                reviewFallback={reviewFallback}
                afterService={
                  shareUrl ? (
                    <div className={styles.mobileShare}>
                      <SocialShare url={shareUrl} title="팟트너 공유하기" />
                    </div>
                  ) : undefined
                }
                pagination={
                  reviews && reviews.totalPages > 1 ? (
                    <Pagination
                      currentPage={reviews.page}
                      totalPages={reviews.totalPages}
                      onPageChange={setReviewPage}
                    />
                  ) : undefined
                }
              />
            </div>

            <aside className={styles.actions} aria-label="지정 견적 요청 및 공유">
              <SitterDetailActions partner={partner} />

              {shareUrl && (
                <div className={styles.desktopShare}>
                  <SocialShare url={shareUrl} title="팟트너 공유하기" />
                </div>
              )}
            </aside>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default function SitterDetailPage(props: SitterDetailPageProps) {
  return (
    <PageMain variant="fullWidth">
      <SitterDetailContent {...props} />
    </PageMain>
  );
}
