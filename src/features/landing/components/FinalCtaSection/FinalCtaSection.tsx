import FinalCtaActions from "./FinalCtaActions";
import FinalCtaReveal from "./FinalCtaReveal";
import styles from "./FinalCtaSection.module.css";

export default function FinalCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-title">
      <FinalCtaReveal>
        <p className={styles.eyebrow}>PLANT ON TRUST</p>

        <h2 id="final-cta-title" className={styles.title}>
          식물이 기다리는 오늘도,
          <br />
          믿을 수 있는 돌봄으로.
        </h2>

        <FinalCtaActions />
      </FinalCtaReveal>
    </section>
  );
}
