import PageMain from "@/components/layout/Page/PageMain";
import Image from "next/image";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageMain variant="fullWidth" className={styles.page}>
      <section className={styles.card}>
        <Image
          src="/images/logo_pc.svg"
          alt="POT"
          width={128}
          height={80}
          priority
          className={styles.logo}
        />

        {children}
      </section>
    </PageMain>
  );
}
