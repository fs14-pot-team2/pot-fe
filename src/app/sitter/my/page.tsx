"use client";

import styles from "./SitterMyPage.module.css";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useState } from "react";

import PartnerProfile from "@/components/common/PartnerDetail/PartnerProfile/PartnerProfile";
import PartnerActivity from "@/components/common/PartnerDetail/PartnerActivity/PartnerActivity";
import PartnerServiceInfo from "@/components/common/PartnerDetail/PartnerServiceInfo/PartnerServiceInfo";
import PartnerReviews from "@/components/common/PartnerDetail/PartnerReviews/PartnerReviews";
import Pagination from "@/components/ui/Pagination/Pagination";
import { useSitterMyPage } from "@/features/profiles/sitter/hooks/useSitterMyPage";
import { useSitterReviews } from "@/features/profiles/sitter/hooks/useSitterReviews";

export default function SitterMyPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: partner, isPending, isError, refetch } = useSitterMyPage();

  const {
    data: reviews,
    isPending: isReviewsPending,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useSitterReviews({
    sitterId: partner?.id,
    page: currentPage,
    pageSize: 8,
  });

  return (
    <main className={styles.page}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>마이페이지</h1>
      </div>

      <div className={styles.banner} />

      <div className={styles.content}>
        {isPending && <p className={styles.pageState}>마이페이지 정보를 불러오고 있어요.</p>}

        {isError && (
          <EmptyState
            className={styles.pageState}
            messages={["마이페이지 정보를 불러오지 못했어요."]}
            action={{
              label: "다시 시도",
              onClick: () => void refetch(),
            }}
          />
        )}

        {partner && (
          <>
            <section className={styles.profileSection}>
              <PartnerProfile partner={partner} />

              <div className={styles.actions}>
                <Link
                  href="/sitter/profile/edit"
                  className={`${styles.actionButton} ${styles.primaryAction}`}
                >
                  <span>내 프로필 수정</span>
                  <Image src="/icons/ic_quote_edit.svg" alt="" width={25} height={25} />
                </Link>

                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.secondaryAction}`}
                  disabled
                >
                  <span>기본 정보 수정</span>
                  <Image
                    className={styles.editIcon}
                    src="/icons/ic_quote_edit.svg"
                    alt=""
                    width={25}
                    height={25}
                  />
                </button>
              </div>
            </section>

            <div className={styles.details}>
              <section className={styles.activitySection}>
                <h2 className={styles.sectionTitle}>활동 현황</h2>
                <PartnerActivity partner={partner} />
              </section>

              <PartnerServiceInfo partner={partner} />

              {isReviewsPending && <p className={styles.reviewState}>리뷰를 불러오고 있어요.</p>}

              {isReviewsError && (
                <EmptyState
                  className={styles.reviewState}
                  messages={["리뷰를 불러오지 못했어요."]}
                  action={{
                    label: "다시 시도",
                    onClick: () => void refetchReviews(),
                  }}
                />
              )}

              {reviews && (
                <PartnerReviews
                  reviews={reviews}
                  pagination={
                    reviews.totalPages > 1 ? (
                      <Pagination
                        currentPage={reviews.page}
                        totalPages={reviews.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    ) : undefined
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
