"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import styles from "./CareTypeSection.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CareTypeRevealProps = {
  children: ReactNode;
};

export default function CareTypeReveal({ children }: CareTypeRevealProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const intro = contentRef.current?.querySelector(`.${styles.intro}`);
      const cards = contentRef.current?.querySelectorAll(`.${styles.card}`);

      if (!intro || !cards?.length) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1025px)",
          compact: "(max-width: 1024px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reducedMotion) return;

          if (context.conditions?.desktop) {
            const timeline = gsap.timeline({
              defaults: {
                duration: 1.1,
                ease: "power1.out",
              },
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top 80%",
                once: true,
              },
            });

            timeline.from(intro, { y: 28, autoAlpha: 0 }).from(
              cards,
              {
                y: 36,
                autoAlpha: 0,
                stagger: 0.28,
              },
              "-=0.8",
            );

            return;
          }

          gsap.from(intro, {
            y: 28,
            autoAlpha: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: intro,
              start: "top 82%",
              once: true,
            },
          });

          cards.forEach((card, index) => {
            gsap.from(card, {
              y: 36,
              autoAlpha: 0,
              duration: 1.05,
              delay: index * 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: contentRef },
  );

  return (
    <div ref={contentRef} className={styles.inner}>
      {children}
    </div>
  );
}
