"use client";

import DesignatedRequestButton from "@/components/common/DesignatedRequestButton/DesignatedRequestButton";
import { useSitterDesignatedRequest } from "../../hooks/useSitterDesignatedRequest";
import type { SitterDetailResponse } from "../../types/sitter";
import SitterRequestGuideModal from "./SitterRequestGuideModal";

type SitterDetailActionsProps = {
  partner: SitterDetailResponse;
};

export default function SitterDetailActions({ partner }: SitterDetailActionsProps) {
  const { guideType, closeGuide, handleRequest, isPending } = useSitterDesignatedRequest(partner);

  return (
    <>
      <DesignatedRequestButton
        nickname={partner.nickname}
        status={partner.designatedRequestStatus}
        onClick={() => void handleRequest()}
        isPending={isPending}
      />
      <SitterRequestGuideModal type={guideType} onClose={closeGuide} />
    </>
  );
}
