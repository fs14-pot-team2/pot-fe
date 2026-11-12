"use client";

import PageContainer from "@/components/layout/Page/PageContainer";

import PageMain from "@/components/layout/Page/PageMain";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Toggle from "@/components/ui/Toggle/Toggle";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";

import MyQuoteManagement, {
  type MyQuoteItem,
} from "@/components/common/MyQuoteManagement/MyQuoteManagement";

import { useToast } from "@/components/ui/Toast/ToastProvider";

import { useCancelCareRequest } from "@/features/care-requests/owner/hooks/useCareRequests";
import { useActiveQuotes } from "@/features/quotes/owner/hooks/useActiveQuotes";
import { useConfirmQuote } from "@/features/quotes/owner/hooks/useQuotes";

import type {
  ActiveQuotesResponse,
  ActiveQuoteSitter,
} from "@/features/quotes/owner/types/activeQuotes";

import styles from "./page.module.css";

const QUOTE_TABS = [
  { label: "요청한 견적 현황", value: "active" },
  { label: "받았던 견적", value: "history" },
];

function mapSitter(sitter: ActiveQuoteSitter) {
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

function mapQuoteItems(data: ActiveQuotesResponse): MyQuoteItem[] {
  const quotes: MyQuoteItem[] = data.quotes.map((quote) => ({
    id: quote.id,
    status: "waiting",
    comment: "",
    price: quote.price,
    designatedRequestId: quote.designatedRequestId,
    rejectedRequestId: null,
    sitter: mapSitter(quote.sitter),
  }));

  const rejectedRequests: MyQuoteItem[] = data.rejectedRequests.map((request) => ({
    id: `rejected-${request.rejectedRequestId}`,
    status: "rejected",
    comment: "",
    designatedRequestId: request.designatedRequestId,
    rejectedRequestId: request.rejectedRequestId,
    sitter: mapSitter(request.sitter),
  }));

  return [...quotes, ...rejectedRequests];
}

function isNoActiveRequest(error: unknown) {
  return isAxiosError(error) && error.response?.data?.code === "CARE_REQUEST_NOT_FOUND";
}

function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "견적 현황을 불러오지 못했습니다.";
  }

  if (error.response?.status === 401) {
    return "로그인 상태를 확인해 주세요.";
  }

  if (error.response?.status === 403) {
    return "팟오너 계정으로만 이용할 수 있습니다.";
  }

  return "견적 현황을 불러오지 못했습니다. 다시 시도해 주세요.";
}

function getConfirmErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "견적을 확정하지 못했습니다. 다시 시도해 주세요.";
  }

  const code = error.response?.data?.code;

  switch (code) {
    case "QUOTE_ALREADY_CONFIRMED":
    case "CARE_REQUEST_ALREADY_MATCHED":
      return "이미 견적이 확정된 요청입니다. 목록을 새로 확인해 주세요.";

    case "CARE_REQUEST_NOT_FOUND":
    case "QUOTE_NOT_FOUND":
      return "확정할 견적을 찾지 못했습니다.";

    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
      return "로그인 상태를 확인해 주세요.";

    case "FORBIDDEN":
      return "견적을 확정할 권한이 없습니다.";

    default:
      return "견적을 확정하지 못했습니다. 다시 시도해 주세요.";
  }
}

export default function OwnerActiveQuotesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isPending, isError, error, refetch } = useActiveQuotes();

  const { mutateAsync: cancelCareRequest } = useCancelCareRequest();

  const { mutateAsync: confirmQuote, isPending: isConfirming } = useConfirmQuote();

  // 확정 대상 견적 선택
  const [selectedConfirmQuoteId, setSelectedConfirmQuoteId] = useState<string | null>(null);

  const [confirmError, setConfirmError] = useState("");

  const selectedQuote = data?.quotes.find((quote) => quote.id === selectedConfirmQuoteId);

  // 확정 확인 모달 열기
  const openConfirmModal = (quoteId: string) => {
    setConfirmError("");
    setSelectedConfirmQuoteId(quoteId);
  };

  // API 요청 중에는 모달 닫기 제한
  const closeConfirmModal = () => {
    if (isConfirming) return;

    setConfirmError("");
    setSelectedConfirmQuoteId(null);
  };

  // 실제 견적 확정
  const handleConfirmQuote = async () => {
    if (!selectedConfirmQuoteId || isConfirming) {
      return;
    }

    setConfirmError("");

    try {
      await confirmQuote(selectedConfirmQuoteId);

      setSelectedConfirmQuoteId(null);

      showToast({
        message: "견적이 확정되었습니다.",
      });

      router.push("/owner/quotes/history");
    } catch (err) {
      setConfirmError(getConfirmErrorMessage(err));
    }
  };

  // 돌봄 요청 삭제
  const handleDelete = async (requestId: string): Promise<void> => {
    try {
      await cancelCareRequest(requestId);

      showToast({
        message: "돌봄 요청이 삭제되었습니다.",
      });
    } catch (err) {
      const code = isAxiosError(err) ? err.response?.data?.code : undefined;

      if (code === "CARE_REQUEST_ALREADY_CANCELED") {
        showToast({
          message: "이미 취소된 돌봄 요청입니다.",
        });
      } else if (code === "CARE_REQUEST_NOT_FOUND") {
        showToast({
          message: "취소할 수 있는 돌봄 요청이 없습니다.",
        });
      } else if (code === "FORBIDDEN") {
        showToast({
          message: "돌봄 요청을 취소할 권한이 없습니다.",
        });
      } else {
        showToast({
          message: "돌봄 요청을 삭제하지 못했습니다.",
        });
      }

      throw err;
    }
  };

  const renderContent = () => {
    if (isPending) {
      return <Loading variant="content" />;
    }

    if (isError && isNoActiveRequest(error)) {
      return (
        <div className={styles.feedback}>
          <EmptyState
            messages={["진행 중인 돌봄 요청이 없어요.", "돌봄 요청을 등록하고 견적을 받아보세요."]}
            action={{
              label: "돌봄 요청하기",
              onClick: () => router.push("/owner/requests/new"),
            }}
          />
        </div>
      );
    }

    if (isError) {
      return (
        <ErrorState
          variant="content"
          title="견적 현황을 불러오지 못했어요"
          description={getErrorMessage(error)}
          actionLabel="다시 시도"
          onAction={() => void refetch()}
        />
      );
    }

    if (!data) {
      return (
        <div className={styles.feedback}>
          <EmptyState messages={["견적 현황을 확인할 수 없어요."]} />
        </div>
      );
    }

    const { careRequest } = data;
    const quoteItems = mapQuoteItems(data);

    const location = [careRequest.sido, careRequest.sigungu, careRequest.bname]
      .filter(Boolean)
      .join(" ");

    return (
      <MyQuoteManagement
        variant="active"
        requestId={careRequest.id}
        careInfo={{
          createdAt: careRequest.createdAt,
          serviceType: careRequest.serviceType,
          startDate: careRequest.startDate,
          endDate: careRequest.endDate,
          location,
        }}
        requestStatus="OPEN"
        quotes={quoteItems}
        canEdit={data.quotes.length === 0}
        onEdit={() => router.push("/owner/requests/edit")}
        onDelete={handleDelete}
        onQuoteDetail={(quoteId) => router.push(`/owner/quotes/${quoteId}`)}
        onQuoteConfirm={openConfirmModal}
      />
    );
  };

  return (
    <PageMain>
      <PageContainer>
        <div className={styles.content}>
          <nav className={styles.tabsNav} aria-label="견적 내역 메뉴">
            <Toggle
              className={styles.tabs}
              variant="default"
              options={QUOTE_TABS}
              value="active"
              onChange={(value) => {
                if (value === "history") {
                  router.push("/owner/quotes/history");
                }
              }}
            />
          </nav>

          <div className={styles.pageContent}>{renderContent()}</div>
        </div>
      </PageContainer>

      {/* 견적 확정 확인 모달 */}
      <Modal
        isOpen={selectedConfirmQuoteId !== null}
        onClose={closeConfirmModal}
        title="견적 확정"
        footer={
          <div className={styles.confirmModalActions}>
            <Button
              variant="outlined"
              size="md"
              disabled={isConfirming}
              onClick={closeConfirmModal}
            >
              취소
            </Button>

            <Button
              variant="solid"
              size="md"
              disabled={isConfirming || !selectedQuote}
              onClick={() => void handleConfirmQuote()}
            >
              {isConfirming ? "확정 중..." : "확정하기"}
            </Button>
          </div>
        }
      >
        <p>
          {selectedQuote
            ? `${selectedQuote.sitter.nickname} 팟트너의 ${selectedQuote.price.toLocaleString("ko-KR")}원 견적을 확정하시겠어요?`
            : "견적 정보를 확인할 수 없습니다."}
        </p>

        {confirmError && (
          <p
            role="alert"
            style={{
              color: "#d14343",
              marginTop: 12,
            }}
          >
            {confirmError}
          </p>
        )}
      </Modal>
    </PageMain>
  );
}
