"use client";

import WrittenReviewCard from "@/components/common/WrittenReviewCard/WrittenReviewCard";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Modal from "@/components/ui/Modal/Modal";
import Pagination from "@/components/ui/Pagination/Pagination";
import ReviewFormModal from "@/features/reviews/components/ReviewFormModal/ReviewFormModal";
import {
  useDeleteReview,
  useUpdateReview,
  useWrittenReviews,
} from "@/features/reviews/hooks/useReviews";
import type { ReviewFormValues, WrittenReviewItem } from "@/features/reviews/types/review";
import { useState } from "react";
import styles from "./page.module.css";

export default function WrittenReviewsPage() {
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState<WrittenReviewItem | null>(null);
  const [deletingReview, setDeletingReview] = useState<WrittenReviewItem | null>(null);

  const { data, isPending, isError, refetch } = useWrittenReviews(page);

  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const handleUpdateReview = async (values: ReviewFormValues) => {
    if (!editingReview) return;

    await updateReviewMutation.mutateAsync({
      reviewId: editingReview.review.id,
      input: values,
    });
  };

  const handleOpenDelete = (item: WrittenReviewItem) => {
    deleteReviewMutation.reset();
    setDeletingReview(item);
  };

  const handleCloseDelete = () => {
    if (deleteReviewMutation.isPending) return;

    setDeletingReview(null);
    deleteReviewMutation.reset();
  };

  const handleDeleteReview = () => {
    if (!deletingReview || deleteReviewMutation.isPending) return;

    deleteReviewMutation.mutate(deletingReview.review.id, {
      onSuccess: () => {
        if (page > 1 && data?.items.length === 1) {
          setPage(page - 1);
        }

        setDeletingReview(null);
      },
    });
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
          <ErrorState title="작성한 리뷰를 불러오지 못했어요" onAction={() => void refetch()} />
        </div>
      );
    }

    if (!data || data.items.length === 0) {
      return (
        <div className={styles.feedback}>
          <EmptyState messages={["아직 작성한 리뷰가 없어요."]} />
        </div>
      );
    }

    return (
      <>
        <div className={styles.cards}>
          {data.items.map((item) => (
            <WrittenReviewCard
              key={item.review.id}
              item={item}
              onEdit={setEditingReview}
              onDelete={handleOpenDelete}
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

      {editingReview && (
        <ReviewFormModal
          key={editingReview.review.id}
          isOpen
          mode="edit"
          target={editingReview}
          initialValues={{
            rating: editingReview.review.rating,
            content: editingReview.review.content,
          }}
          onClose={() => setEditingReview(null)}
          onSubmit={handleUpdateReview}
        />
      )}

      {deletingReview && (
        <Modal
          isOpen
          onClose={handleCloseDelete}
          title="리뷰 삭제"
          className={styles.deleteModal}
          footer={
            <div className={styles.deleteActions}>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleCloseDelete}
                disabled={deleteReviewMutation.isPending}
              >
                취소
              </Button>

              <Button
                size="sm"
                onClick={handleDeleteReview}
                disabled={deleteReviewMutation.isPending}
              >
                {deleteReviewMutation.isPending ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          }
        >
          <p className={styles.deleteMessage}>
            리뷰를 삭제하시면 재작성이 불가합니다.
            <br />
            삭제하시겠습니까?
          </p>

          {deleteReviewMutation.isError && (
            <p className={styles.deleteError} role="alert">
              리뷰를 삭제하지 못했습니다. 다시 시도해 주세요.
            </p>
          )}
        </Modal>
      )}
    </main>
  );
}
