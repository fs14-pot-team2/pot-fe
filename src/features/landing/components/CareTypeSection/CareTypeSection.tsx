import Image from "next/image";
import CareTypeReveal from "./CareTypeReveal";
import styles from "./CareTypeSection.module.css";

export default function CareTypeSection() {
  return (
    <section className={styles.section} aria-labelledby="care-types-title">
      <CareTypeReveal>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>01 · CHOOSE YOUR CARE</p>
          <h2 id="care-types-title">
            내 식물에 필요한
            <br />
            돌봄을 골라보세요.
          </h2>
          <p className={styles.description}>
            일정과 상황에 따라 선택할 수 있는
            <br />두 가지 방문 돌봄 서비스
          </p>
        </div>

        <article className={styles.card}>
          <div>
            <span className={styles.number}>01 / FLEXIBLE</span>
            <h3>잠깐만 돌봄</h3>
            <p>필요한 날에 찾아가는 돌봄</p>
          </div>
          <Image src="/images/care_short.png" alt="" width={139} height={139} />
        </article>

        <article className={styles.card}>
          <div>
            <span className={styles.number}>02 / REGULAR</span>
            <h3>꾸준히 돌봄</h3>
            <p>정해진 날마다 찾아가는 돌봄</p>
          </div>
          <Image src="/images/care_regular.png" alt="" width={139} height={139} />
        </article>
      </CareTypeReveal>
    </section>
  );
}
