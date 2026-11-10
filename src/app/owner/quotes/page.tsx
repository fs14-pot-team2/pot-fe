"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import Toggle from "@/components/ui/Toggle/Toggle";

import MyQuoteManagement, {
  type MyQuoteItem,
} from "@/components/common/MyQuoteManagement/MyQuoteManagement";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useCancelCareRequest } from "@/features/care-requests/owner/hooks/useCareRequests";
import { useActiveQuotes } from "@/features/quotes/owner/hooks/useActiveQuotes";

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

function isNoActiveRequest(error: unknown): boolean {
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

export default function OwnerActiveQuotesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isPending, isError, error, refetch } = useActiveQuotes();

  const { mutateAsync: cancelCareRequest } = useCancelCareRequest();

  const handleTabChange = (value: string) => {
    if (value === "history") {
      router.push("/owner/quotes/history");
    }
  };

  const handleEdit = () => {
    router.push("/owner/requests/edit");
  };

  const handleDelete = async (requestId: string): Promise<void> => {
    try {
      await cancelCareRequest(requestId);

      showToast({
        message: "돌봄 요청이 삭제되었습니다.",
      });
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;

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

      throw error;
    }
  };

  const renderContent = () => {
    if (isPending) {
      return <Loading variant="content" />;
    }

    // 진행 중인 돌봄 요청이 없는 정상적인 빈 상태
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

    // 그 외 API 오류는 공통 ErrorState 사용
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

    // 실제 견적이 한 건이라도 있으면 수정 불가
    const canEdit = data.quotes.length === 0;

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
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onQuoteDetail={(quoteId) => router.push(`/owner/quotes/${quoteId}`)}
      />
    );
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.content}>
          <nav className={styles.tabsNav} aria-label="견적 내역 메뉴">
            <Toggle
              variant="default"
              options={QUOTE_TABS}
              value="active"
              onChange={handleTabChange}
              className={styles.tabs}
            />
          </nav>

          <div className={styles.pageContent}>{renderContent()}</div>
        </div>
      </div>
    </main>
  );
}
