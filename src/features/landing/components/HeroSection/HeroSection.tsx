import Image from "next/image";
import HeroActions from "./HeroActions";
import HeroReveal from "./HeroReveal";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <HeroReveal>
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span>PLANT ON TRUST ·</span> <span>반려식물 방문 돌봄 매칭</span>
          </p>

          <h1 id="hero-title" className={styles.title}>
            잠시 자리를 비워도,
            <br />
            <span>식물 곁에</span> 마음이 놓이도록.
          </h1>

          <p className={styles.description}>
            내 식물에게 맞는 팟트너를 찾아보세요.
            <br />
            필요한 날의 방문 돌봄부터 정기적인 돌봄까지,
            <br />
            POT에서 시작할 수 있어요.
          </p>

          <HeroActions />
        </div>
      </div>

      <div className={styles.visual}>
        <Image
          src="/images/landing/hero-botanical.png"
          alt=""
          fill
          sizes="100vw"
          preload
          className={styles.backgroundImage}
        />

        <div className={styles.visualBorder} aria-hidden="true" />

        <div className={styles.pictureCaption} aria-hidden="true">
          <span>CARE, ROOTED IN TRUST</span>
          <span>PLANT ON TRUST</span>
        </div>
      </div>
    </HeroReveal>
  );
}
