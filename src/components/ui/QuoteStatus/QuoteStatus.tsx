import Image from "next/image";
import styles from "./QuoteStatus.module.css";

export type QuoteStatusType = "waiting" | "confirmed" | "rejected" | "expired";

interface QuoteStatusProps {
  status: QuoteStatusType;
  className?: string;
}

const STATUS_LABEL: Record<QuoteStatusType, string> = {
  waiting: "견적 대기",
  confirmed: "확정견적",
  rejected: "반려된 견적",
  expired: "기간 만료",
};

export default function QuoteStatus({ status, className = "" }: QuoteStatusProps) {
  const classNames = [styles.status, styles[status], className].filter(Boolean).join(" ");

  return (
    <span className={classNames}>
      {status === "confirmed" && (
        <Image src="/icons/ic_confirm.svg" alt="" width={16} height={16} className={styles.icon} />
      )}
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}
