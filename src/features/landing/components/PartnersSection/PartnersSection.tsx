import PartnersActions from "./PartnersActions";
import PartnersPreview from "./PartnersPreview";
import PartnersReveal from "./PartnersReveal";
import styles from "./PartnersSection.module.css";

export default function PartnersSection() {
  return (
    <section className={styles.section} id="partners" aria-labelledby="partners-title">
      <PartnersReveal>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>03 · FIND YOUR PARTNER</p>

          <h2 id="partners-title" className={styles.title}>
            식물의 곁을 지킬
            <br />
            <em>팟트너를 찾아보세요.</em>
          </h2>

          <p className={styles.description}>
            제공 서비스와 소개, 별점, 리뷰 등을 확인하고
            <br />
            원하는 팟트너를 찾아볼 수 있어요.
          </p>

          <div>
            <PartnersActions />
          </div>
        </div>

        <div className={styles.cards}>
          <p className={styles.previewLabel}>팟트너 목록 미리보기</p>
          <PartnersPreview />
          <p className={styles.note}>※ 카드의 인물과 활동 수치는 예시입니다.</p>
        </div>
      </PartnersReveal>
    </section>
  );
}
