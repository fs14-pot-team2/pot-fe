"use client";

import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import CareRequestForm from "@/features/care-requests/owner/components/CareRequestForm/CareRequestForm";

import {
  useActiveCareRequest,
  useCreateCareRequest,
} from "@/features/care-requests/owner/hooks/useCareRequests";

import type { CreateCareRequestInput } from "@/features/care-requests/owner/types/careRequest";

import styles from "./page.module.css";

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

function getApiError(error: unknown): ApiErrorResponse {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return {
      code: error.response?.data?.code,
      message: error.response?.data?.message,
    };
  }

  return {};
}

export default function NewCareRequestPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const {
    data: activeRequestData,
    isLoading: isCheckingActiveRequest,
    isError: isActiveRequestError,
    isFetching: isFetchingActiveRequest,
    error: activeRequestError,
    refetch: refetchActiveRequest,
  } = useActiveCareRequest();

  const { mutateAsync: createCareRequest, isPending: isCreating } = useCreateCareRequest();

  const handleSubmit = async (values: CreateCareRequestInput): Promise<void> => {
    if (isCreating) {
      return;
    }

    if (isCheckingActiveRequest || isFetchingActiveRequest) {
      showToast({
        message: "돌봄 요청 상태를 확인하고 있어요. 다시 시도해 주세요.",
      });
      return;
    }

    if (isActiveRequestError || !activeRequestData) {
      const isUnauthorized =
        isAxiosError(activeRequestError) && activeRequestError.response?.status === 401;

      showToast({
        message: isUnauthorized
          ? "로그인 인증이 완료되면 돌봄 요청을 등록할 수 있어요."
          : "돌봄 요청 상태를 확인할 수 없어 등록이 제한됩니다.",
      });
      return;
    }

    if (activeRequestData.hasActiveCareRequest) {
      showToast({
        message: "이미 진행 중인 돌봄 요청이 있습니다.",
      });
      return;
    }

    try {
      await createCareRequest(values);

      showToast({
        message: "돌봄 요청이 등록되었습니다.",
      });

      router.push("/owner/quotes");
    } catch (error) {
      const { code, message } = getApiError(error);

      if (code === "ACTIVE_CARE_REQUEST_ALREADY_EXISTS") {
        showToast({
          message: "이미 진행 중인 돌봄 요청이 있습니다.",
        });

        await refetchActiveRequest();
        return;
      }

      if (code === "INVALID_CARE_DATE") {
        showToast({
          message: "돌봄 일정이 올바르지 않습니다. 날짜를 다시 확인해 주세요.",
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
          message: "선택한 지역을 확인할 수 없습니다. 주소를 다시 검색해 주세요.",
        });
        return;
      }

      if (code === "INVALID_REQUEST") {
        showToast({
          message: "입력 정보를 확인해 주세요.",
        });
        return;
      }

      if (isAxiosError(error) && error.response?.status === 401) {
        showToast({
          message: "로그인 상태를 확인해 주세요.",
        });
        return;
      }

      if (isAxiosError(error) && error.response?.status === 403) {
        showToast({
          message: "팟오너 계정으로만 돌봄 요청을 등록할 수 있습니다.",
        });
        return;
      }

      showToast({
        message: message || "돌봄 요청을 등록하지 못했습니다. 다시 시도해 주세요.",
      });
    }
  };

  if (isCheckingActiveRequest) {
    return (
      <main className={styles.main}>
        <div className="container">
          <div className={styles.careRequestWrap}>
            <section className={styles.feedbackSection}>
              <h1 className={styles.title}>돌봄 요청을 확인하고 있어요</h1>
              <p className={styles.description}>잠시만 기다려 주세요.</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (activeRequestData?.hasActiveCareRequest) {
    return (
      <main className={styles.main}>
        <div className="container">
          <div className={styles.careRequestWrap}>
            <section className={styles.feedbackSection}>
              <h1 className={styles.title}>이미 진행 중인 돌봄 요청이 있어요</h1>

              <p className={styles.description}>
                한 번에 하나의 돌봄 요청만 등록할 수 있어요.
                <br />
                진행 중인 돌봄 요청을 확인해 주세요.
              </p>

              <Button
                variant="solid"
                size="md"
                className={styles.actionButton}
                onClick={() => router.push("/owner/quotes")}
              >
                요청한 견적 현황 보기
              </Button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.careRequestWrap}>
          <header className={styles.header}>
            <h1 className={styles.title}>돌봄 방식, 일정과 지역을 선택해주세요</h1>

            <p className={styles.description}>돌봄 요청에 필요한 정보를 입력해 주세요.</p>
          </header>

          {isActiveRequestError && (
            <p role="alert" className={styles.apiNotice}>
              현재 인증 또는 요청 상태를 확인할 수 없어 등록은 제한됩니다. 입력 화면은 이용할 수
              있어요.
            </p>
          )}

          <CareRequestForm mode="create" isSubmitting={isCreating} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}
