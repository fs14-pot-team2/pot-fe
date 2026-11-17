import QuotePreview from "./QuotePreview";
import QuoteReveal from "./QuoteReveal";
import styles from "./QuoteSection.module.css";

export default function QuoteSection() {
  return (
    <section className={styles.section} id="quote-demo" aria-labelledby="quote-title">
      <QuoteReveal>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>04 · COMPARE YOUR QUOTES</p>

          <h2 id="quote-title" className={styles.title}>
            견적은 비교하고,
            <br />
            <em>선택은 신중하게.</em>
          </h2>

          <p className={styles.description}>
            받은 견적에서 팟트너 정보와 금액을 살펴보고
            <br />
            원하는 견적을 선택할 수 있어요.
          </p>
        </div>

        <div className={styles.preview}>
          <p className={styles.previewLabel}>받은 견적 미리보기</p>
          <QuotePreview />
          <p className={styles.note}>※ 카드의 인물과 활동 수치, 견적 금액은 예시입니다.</p>
        </div>
      </QuoteReveal>
    </section>
  );
}
