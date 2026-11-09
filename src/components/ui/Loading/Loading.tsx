import Image from "next/image";

import styles from "./Loading.module.css";

type LoadingProps = {
  variant?: "full" | "content";
  message?: string;
  className?: string;
};

const ASSET_PATH = "/images/loading";

export default function Loading({
  variant = "content",
  message = "식물을 돌보는 중...",
  className = "",
}: LoadingProps) {
  const loadingClassName = [
    styles.loading,
    variant === "full" ? styles.full : styles.content,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={loadingClassName} role="status" aria-live="polite" aria-label={message}>
      <div className={styles.scene} aria-hidden="true">
        {/* 물뿌리개 */}
        <div className={styles.can}>
          <Image src={`${ASSET_PATH}/watering-can.png`} alt="" fill sizes="260px" />
        </div>

        {/* 물방울 1 */}
        <div className={`${styles.drop} ${styles.drop1}`}>
          <Image src={`${ASSET_PATH}/drop-1.png`} alt="" fill sizes="32px" />
        </div>

        {/* 물방울 2 */}
        <div className={`${styles.drop} ${styles.drop2}`}>
          <Image src={`${ASSET_PATH}/drop-2.png`} alt="" fill sizes="32px" />
        </div>

        {/* 물방울 3 */}
        <div className={`${styles.drop} ${styles.drop3}`}>
          <Image src={`${ASSET_PATH}/drop-3.png`} alt="" fill sizes="32px" />
        </div>

        {/* 식물 */}
        <div className={styles.plant}>
          <Image src={`${ASSET_PATH}/plant.png`} alt="" fill sizes="170px" />
        </div>
      </div>

      <p className={styles.message}>{message}</p>
    </div>
  );
}
