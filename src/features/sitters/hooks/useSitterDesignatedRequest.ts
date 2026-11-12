"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import {
  useActiveCareRequest,
  useCreateDesignatedRequest,
} from "@/features/care-requests/owner/hooks/useCareRequests";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useState } from "react";
import type { SitterDetailResponse, SitterRequestGuideType } from "../types/sitter";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { sitterKeys } from "../queryKeys";

export function useSitterDesignatedRequest(partner: SitterDetailResponse) {
  const { status, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [guideType, setGuideType] = useState<SitterRequestGuideType>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { refetch: checkActiveRequest } = useActiveCareRequest(false);
  const { mutateAsync: sendRequest, isPending: isSending } = useCreateDesignatedRequest();

  const closeGuide = () => {
    setGuideType(null);
  };

  const handleRequest = async () => {
    if (status === "guest") {
      setGuideType("login");
      return;
    }

    if (status !== "authenticated" || user?.role !== "OWNER") {
      return;
    }

    if (partner.designatedRequestStatus === "NO_ACTIVE_REQUEST") {
      setGuideType("noActiveRequest");
      return;
    }

    if (partner.designatedRequestStatus !== "AVAILABLE" || isChecking || isSending) {
      return;
    }

    setIsChecking(true);

    try {
      const result = await checkActiveRequest();

      if (result.isError || !result.data) {
        showToast({ message: "돌봄 요청 상태를 확인하지 못했어요. 다시 시도해 주세요." });
        return;
      }

      if (!result.data.hasActiveCareRequest || !result.data.careRequest) {
        setGuideType("noActiveRequest");
        return;
      }
      await sendRequest({
        careRequestId: result.data.careRequest.id,
        sitterId: partner.id,
      });
      showToast({ message: "지정 견적 요청이 완료되었습니다." });
    } catch (error) {
      const code = isAxiosError<{ code?: string }>(error) ? error.response?.data?.code : undefined;

      if (code === "ACTIVE_CARE_REQUEST_NOT_FOUND") {
        setGuideType("noActiveRequest");
      } else {
        const messages: Record<string, string> = {
          DESIGNATED_REQUEST_ALREADY_EXISTS: "이미 지정 견적을 요청한 팟트너예요.",
          DESIGNATED_REQUEST_LIMIT_EXCEEDED: "지정 견적 요청 횟수를 모두 사용했어요.",
          SITTER_ALREADY_SENT_QUOTE: "이미 견적을 보낸 팟트너예요.",
          SITTER_NOT_FOUND: "팟트너 정보를 찾을 수 없어요.",
          CARE_REQUEST_NOT_FOUND: "돌봄 요청 정보를 다시 확인해 주세요.",
          UNAUTHORIZED: "로그인 상태를 확인해 주세요.",
          TOKEN_EXPIRED: "로그인 상태를 확인해 주세요.",
          FORBIDDEN: "팟오너 계정으로만 지정 요청할 수 있어요.",
        };
        showToast({ message: messages[code ?? ""] ?? "지정 견적 요청에 실패했어요." });
      }

      if (
        code === "ACTIVE_CARE_REQUEST_NOT_FOUND" ||
        code === "DESIGNATED_REQUEST_ALREADY_EXISTS" ||
        code === "DESIGNATED_REQUEST_LIMIT_EXCEEDED" ||
        code === "SITTER_ALREADY_SENT_QUOTE"
      ) {
        await queryClient.invalidateQueries({
          queryKey: sitterKeys.detail(partner.id),
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  return { guideType, closeGuide, handleRequest, isPending: isChecking || isSending };
}
