"use client";

import { useGrowthProgress, useGrowthStep } from "./PlantGrowthPin";
import styles from "./PlantGrowthSection.module.css";

type CareStep = {
  title: string;
  description: string;
};

type PlantGrowthActiveStepProps = {
  steps: CareStep[];
};

export default function PlantGrowthActiveStep({ steps }: PlantGrowthActiveStepProps) {
  const progress = useGrowthProgress();
  const currentStep = useGrowthStep();
  const activeStep = steps[currentStep - 1];

  return (
    <>
      <div className={styles.activeStep}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="식물 성장 진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className={styles.progressFill} style={{ transform: `scaleX(${progress / 100})` }} />
        </div>

        <span className={styles.stepIndex}>
          STEP {String(currentStep).padStart(2, "0")} <span className={styles.stepTotal}>/ 04</span>
        </span>
        <h3>{activeStep.title}</h3>
        <p>{activeStep.description}</p>
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={index + 1 === currentStep ? styles.currentStep : undefined}
            aria-current={index + 1 === currentStep ? "step" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step.title}
          </li>
        ))}
      </ol>
    </>
  );
}

export function PlantGrowthCompactStep({ steps }: PlantGrowthActiveStepProps) {
  const currentStep = useGrowthStep();
  const activeStep = steps[currentStep - 1];

  return (
    <div className={styles.compactStep}>
      <span>
        STEP {String(currentStep).padStart(2, "0")} <span className={styles.stepTotal}>/ 04</span>
      </span>
      <strong>{activeStep.title}</strong>
    </div>
  );
}

export function PlantGrowthProgressLabel() {
  const progress = useGrowthProgress();

  return (
    <div className={styles.artworkFooter} aria-hidden="true">
      <span className={styles.growthDash} />
      <span>ONE PLANT, ONE STORY</span>
      <span className={styles.growthPercent}>{String(progress).padStart(2, "0")}%</span>
    </div>
  );
}
