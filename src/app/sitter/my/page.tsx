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

import type { PartnerReviewsData } from "@/types/partner";

const MOCK_REVIEWS: PartnerReviewsData = {
  summary: {
    averageRating: 5,
    reviewCount: 178,
    ratingDistribution: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 8,
      "5": 170,
    },
  },
  items: [
    {
      review: {
        id: "review-1",
        rating: 5,
        content:
          "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요. 비 오는 날에도 꼼꼼히 잘 해주셔서 감사드립니다.",
        createdAt: "2024-07-01T00:00:00.000Z",
      },
      owner: {
        id: "owner-1",
        nickname: "kimhaha",
      },
    },
    {
      review: {
        id: "review-2",
        rating: 5,
        content: "기사님 덕분에 안전하고 신속한 이사를 했습니다. 정말 감사합니다.",
        createdAt: "2024-07-01T00:00:00.000Z",
      },
      owner: {
        id: "owner-2",
        nickname: "kimhehe",
      },
    },
    {
      review: {
        id: "review-3",
        rating: 5,
        content: "항상 친절하시고 너무 좋으세요!",
        createdAt: "2024-07-01T00:00:00.000Z",
      },
      owner: {
        id: "owner-3",
        nickname: "kimyaho",
      },
    },
  ],
  page: 1,
  pageSize: 8,
  totalCount: 178,
  totalPages: 23,
};

export default function SitterMyPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: partner, isPending, isError, refetch } = useSitterMyPage();

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

              <PartnerReviews
                reviews={{
                  ...MOCK_REVIEWS,
                  page: currentPage,
                }}
                pagination={
                  <Pagination
                    currentPage={currentPage}
                    totalPages={MOCK_REVIEWS.totalPages}
                    onPageChange={setCurrentPage}
                  />
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
