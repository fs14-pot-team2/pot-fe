"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import styles from "./PlantGrowthSection.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const GrowthProgressContext = createContext(0);

export function useGrowthProgress() {
  return useContext(GrowthProgressContext);
}

export function useGrowthStep() {
  const progress = useGrowthProgress();

  return Math.min(4, Math.floor(progress / 25) + 1);
}

type PlantGrowthPinProps = {
  children: ReactNode;
};

export default function PlantGrowthPin({ children }: PlantGrowthPinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 769px)",
          stacked: "(max-width: 768px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reducedMotion) return;

          const isStacked = Boolean(context.conditions?.stacked);
          const root = pinRef.current;
          if (!root) return;

          const stage = root.querySelector<HTMLElement>(`.${styles.stage}`);
          const artwork = root.querySelector("svg");

          if (!stage || !artwork) return;

          const stems = root.querySelectorAll(".stem-draw");
          const leaves = root.querySelectorAll(".leaf-art");
          const bud = root.querySelector(".flower-bud");
          const petals = root.querySelectorAll(".flower-petal");
          const center = root.querySelector(".flower-center");
          const droplets = root.querySelectorAll(".droplet");

          if (!stems.length || !leaves.length || !bud || !petals.length || !center) return;

          let previousProgress = -1;

          const timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "none" },
            onUpdate: () => {
              const nextProgress = Math.floor(timeline.progress() * 100);

              if (nextProgress === previousProgress) return;

              previousProgress = nextProgress;
              setProgress(nextProgress);
            },
          });

          timeline
            .from(stems, { drawSVG: 0, duration: 1, stagger: 0.35 }, 0)
            .from(
              leaves,
              {
                scale: 0,
                autoAlpha: 0,
                transformOrigin: "50% 100%",
                duration: 0.7,
                stagger: 0.35,
              },
              0.8,
            )
            .from(bud, { scale: 0, autoAlpha: 0, transformOrigin: "50% 100%", duration: 0.35 }, 4.2)
            .from(
              petals,
              {
                scale: 0,
                autoAlpha: 0,
                transformOrigin: "50% 100%",
                duration: 0.6,
                stagger: 0.075,
              },
              4.5,
            )
            .from(center, { scale: 0, autoAlpha: 0, duration: 0.3 }, 5.1)
            .to(bud, { autoAlpha: 0, duration: 0.3 }, 4.65)
            .to({}, { duration: 0.6 }, 5.4);

          const stepDuration = timeline.duration() / 4;
          const fadeInDuration = stepDuration * 0.3;

          droplets.forEach((drop, index) => {
            const start = stepDuration + index * stepDuration * 0.12;

            timeline
              .to(drop, { opacity: 0.7, y: 23, duration: fadeInDuration }, start)
              .to(
                drop,
                { opacity: 0, y: 47, duration: stepDuration * 0.4 },
                start + fadeInDuration,
              );
          });
          const getHeaderHeight = () =>
            Number.parseFloat(getComputedStyle(root).getPropertyValue("--header-height"));

          let trigger: ScrollTrigger | null = null;
          let wasPinned: boolean | null = null;

          const syncScrollTrigger = () => {
            const availableHeight = window.innerHeight - getHeaderHeight();
            const canPin = stage.offsetHeight <= availableHeight + 1;

            if (trigger && wasPinned === canPin) return;

            trigger?.kill(true, true);
            wasPinned = canPin;

            trigger = ScrollTrigger.create({
              animation: timeline,
              trigger: root,
              start: () => (canPin ? `top top+=${getHeaderHeight()}` : "top 80%"),
              end: canPin ? (isStacked ? "+=1800" : "+=2500") : "bottom 20%",
              scrub: true,
              pin: canPin,
              anticipatePin: 0,
              refreshPriority: 1,
            });

            ScrollTrigger.refresh();
          };

          syncScrollTrigger();

          const observer = new ResizeObserver(syncScrollTrigger);

          observer.observe(stage);
          window.addEventListener("resize", syncScrollTrigger);

          return () => {
            observer.disconnect();
            window.removeEventListener("resize", syncScrollTrigger);
            trigger?.kill(true, true);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: pinRef },
  );

  return (
    <GrowthProgressContext.Provider value={progress}>
      <div ref={pinRef}>{children}</div>
    </GrowthProgressContext.Provider>
  );
}
