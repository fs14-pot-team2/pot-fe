"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import CareRequestForm from "@/features/care-requests/owner/components/CareRequestForm/CareRequestForm";

import {
  useActiveCareRequest,
  useUpdateCareRequest,
} from "@/features/care-requests/owner/hooks/useCareRequests";

import type { CreateCareRequestInput } from "@/features/care-requests/owner/types/careRequest";

import styles from "../new/page.module.css";

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

export default function EditCareRequestPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useActiveCareRequest();

  const { mutateAsync: updateCareRequest, isPending: isUpdating } = useUpdateCareRequest();

  const handleSubmit = async (values: CreateCareRequestInput): Promise<void> => {
    const careRequest = data?.careRequest;

    if (!careRequest || isUpdating) {
      return;
    }

    try {
      await updateCareRequest({
        careRequestId: careRequest.id,
        input: values,
      });

      showToast({
        message: "돌봄 요청이 수정되었습니다.",
      });

      router.push("/owner/quotes");
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const code = error.response?.data?.code;

        if (status === 401) {
          showToast({
            message: "로그인 상태를 확인해 주세요.",
          });
          return;
        }

        if (status === 403) {
          showToast({
            message: "돌봄 요청을 수정할 권한이 없습니다.",
          });
          return;
        }

        if (code === "CARE_REQUEST_NOT_FOUND" || status === 404) {
          showToast({
            message: "수정할 돌봄 요청을 찾을 수 없습니다.",
          });
          return;
        }

        if (code === "CARE_REQUEST_EDIT_NOT_ALLOWED") {
          showToast({
            message: "견적을 받은 돌봄 요청은 수정할 수 없습니다.",
          });
          return;
        }

        if (code === "CARE_REQUEST_STATUS_NOT_EDITABLE") {
          showToast({
            message: "진행 중인 돌봄 요청만 수정할 수 있습니다.",
          });
          return;
        }

        if (status === 409) {
          showToast({
            message: "현재 상태에서는 돌봄 요청을 수정할 수 없습니다.",
          });
          return;
        }

        if (code === "INVALID_CARE_DATE") {
          showToast({
            message: "돌봄 일정을 다시 확인해 주세요.",
          });
          return;
        }

        if (code === "INVALID_SERVICE_TYPE") {
          showToast({
            message: "돌봄 방식을 다시 선택해 주세요.",
          });
          return;
        }

        if (code === "INVALID_REGION") {
          showToast({
            message: "돌봄 장소를 다시 확인해 주세요.",
          });
          return;
        }

        if (status === 400) {
          showToast({
            message: "입력 정보를 다시 확인해 주세요.",
          });
          return;
        }
      }

      showToast({
        message: "돌봄 요청 수정에 실패했습니다. 다시 시도해 주세요.",
      });
    }
  };

  const renderFeedback = (
    title: string,
    description: string,
    actionLabel?: string,
    onAction?: () => void,
  ) => (
    <PageMain>
      <PageContainer>
        <div className={styles.careRequestWrap}>
          <section className={styles.feedbackSection}>
            <h1 className={styles.title}>{title}</h1>

            <p className={styles.description}>{description}</p>

            {actionLabel && onAction && (
              <Button variant="solid" size="md" className={styles.actionButton} onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </section>
        </div>
      </PageContainer>
    </PageMain>
  );

  if (isLoading) {
    return renderFeedback("돌봄 요청을 확인하고 있어요", "잠시만 기다려 주세요.");
  }

  if (isError) {
    const isUnauthorized = isAxiosError(error) && error.response?.status === 401;

    return renderFeedback(
      isUnauthorized ? "로그인이 필요한 서비스예요" : "돌봄 요청 정보를 확인할 수 없어요",
      isUnauthorized ? "로그인 후 돌봄 요청을 수정할 수 있어요." : "잠시 후 다시 시도해 주세요.",
      isUnauthorized ? undefined : "다시 시도하기",
      isUnauthorized
        ? undefined
        : () => {
            void refetch();
          },
    );
  }

  if (!data?.hasActiveCareRequest || !data.careRequest) {
    return renderFeedback(
      "수정할 돌봄 요청이 없어요",
      "진행 중인 돌봄 요청이 없습니다.",
      "돌봄 요청하러 가기",
      () => router.push("/owner/requests/new"),
    );
  }

  const careRequest = data.careRequest;

  return (
    <PageMain>
      <PageContainer>
        <div className={styles.careRequestWrap}>
          <header className={styles.header}>
            <h1 className={styles.title}>돌봄 요청 수정</h1>

            <p className={styles.description}>돌봄 요청 정보를 수정해 주세요.</p>
          </header>

          <CareRequestForm
            key={careRequest.id}
            mode="edit"
            initialValues={careRequest}
            isSubmitting={isUpdating}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </PageMain>
  );
}
