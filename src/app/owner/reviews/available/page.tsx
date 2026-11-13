"use client";

import ReviewWriteCard from "@/components/common/ReviewWriteCard/ReviewWriteCard";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Pagination from "@/components/ui/Pagination/Pagination";
import ReviewFormModal from "@/features/reviews/components/ReviewFormModal/ReviewFormModal";
import { useCreateReview, useWritableReviews } from "@/features/reviews/hooks/useReviews";
import type { ReviewFormValues, WritableReviewItem } from "@/features/reviews/types/review";
import { useState } from "react";
import styles from "./page.module.css";

export default function AvailableReviewsPage() {
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<WritableReviewItem | null>(null);

  const { data, isPending, isError, refetch } = useWritableReviews(page);
  const createReviewMutation = useCreateReview();

  const handleCreateReview = async (values: ReviewFormValues) => {
    if (!selectedReview) return;

    await createReviewMutation.mutateAsync({
      careRequestId: selectedReview.careRequest.id,
      input: values,
    });

    if (page > 1 && data?.items.length === 1) {
      setPage(page - 1);
    }
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className={styles.feedback}>
          <Loading variant="content" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className={styles.feedback}>
          <ErrorState
            title="작성 가능한 리뷰를 불러오지 못했어요"
            onAction={() => void refetch()}
          />
        </div>
      );
    }

    if (!data || data.items.length === 0) {
      return (
        <div className={styles.feedback}>
          <EmptyState messages={["아직 작성할 수 있는 리뷰가 없어요."]} />
        </div>
      );
    }

    return (
      <>
        <div className={styles.cards}>
          {data.items.map((review) => (
            <ReviewWriteCard
              key={review.careRequest.id}
              reviewTarget={review}
              onWrite={setSelectedReview}
            />
          ))}
        </div>

        {data.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            className={styles.pagination}
          />
        )}
      </>
    );
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.content}>{renderContent()}</div>
      </div>

      {selectedReview && (
        <ReviewFormModal
          key={selectedReview.careRequest.id}
          isOpen
          target={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSubmit={handleCreateReview}
        />
      )}
    </main>
  );
}
