"use client";

import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import { useRouter } from "next/navigation";
import { SitterRequestGuideType } from "../../types/sitter";
import styles from "./SitterRequestGuideModal.module.css";

type SitterRequestGuideModalProps = {
  type: SitterRequestGuideType;
  onClose: () => void;
};

export default function SitterRequestGuideModal({ type, onClose }: SitterRequestGuideModalProps) {
  const router = useRouter();
  const isLogin = type === "login";

  const handleConfirm = () => {
    onClose();
    router.push(isLogin ? "/login" : "/owner/requests/new");
  };

  return (
    <Modal
      className={styles.guideModal}
      isOpen={type !== null}
      onClose={onClose}
      title={isLogin ? "로그인이 필요해요" : "돌봄 요청이 필요해요"}
      footer={
        <Button onClick={handleConfirm}>
          {isLogin ? "로그인하러 가기" : "돌봄 요청 작성하기"}
        </Button>
      }
    >
      <p>
        {isLogin
          ? "지정 견적을 요청하려면 로그인해 주세요."
          : "지정 견적을 요청하려면 먼저 돌봄 요청을 등록해 주세요."}
      </p>
    </Modal>
  );
}
