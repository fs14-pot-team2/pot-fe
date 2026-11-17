import PlantGrowthActiveStep, {
  PlantGrowthCompactStep,
  PlantGrowthProgressLabel,
} from "./PlantGrowthActiveStep";
import PlantGrowthArtwork from "./PlantGrowthArtwork";
import PlantGrowthPin from "./PlantGrowthPin";
import styles from "./PlantGrowthSection.module.css";

const careSteps = [
  {
    title: "돌봄 방식 선택",
    description: "내 일정에 맞는 방문 돌봄 방식을 선택해요.",
  },
  {
    title: "돌봄 요청",
    description: "돌봄 일정과 장소를 정해 요청해요.",
  },
  {
    title: "팟트너와 견적 확정",
    description: "받은 견적을 비교하고 돌봄을 확정해요.",
  },
  {
    title: "방문 돌봄과 리뷰",
    description: "돌봄이 끝난 뒤 리뷰로 경험을 남겨요.",
  },
];

export default function PlantGrowthSection() {
  return (
    <section className={styles.section} id="story" aria-labelledby="growth-title">
      <PlantGrowthPin>
        <div className={styles.stage}>
          <div className={styles.shell}>
            <div className={styles.artworkArea}>
              <PlantGrowthArtwork className={styles.artwork} />
              <PlantGrowthCompactStep steps={careSteps} />
              <PlantGrowthProgressLabel />
            </div>

            <div className={styles.copy}>
              <p className={styles.eyebrow}>02 · HOW POT WORKS</p>

              <h2 id="growth-title" className={styles.title}>
                맡기는 순간부터,
                <br />
                다시 만나는 날까지.
              </h2>

              <p className={styles.description}>
                화분을 뜻하는 POT, 그리고 Plant On Trust.
                <br />
                식물이 자라듯, 우리의 믿음도 함께 자랍니다.
              </p>

              <PlantGrowthActiveStep steps={careSteps} />
            </div>
          </div>
        </div>
      </PlantGrowthPin>
    </section>
  );
}
