"use client";

import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./AccessDenied.module.css";

type AccessDeniedProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function AccessDenied({
  title = "접근 권한이 없어요",
  description = "현재 계정으로는 이 페이지를 이용할 수 없어요.",
  actionLabel = "홈으로 이동",
  actionHref = "/",
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <section className={styles.container} role="alert">
      <Image
        className={styles.image}
        src="/icons/access_denied.svg"
        alt=""
        width={180}
        height={180}
      />

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      <Button size="sm" className={styles.button} onClick={() => router.replace(actionHref)}>
        {actionLabel}
      </Button>
    </section>
  );
}
