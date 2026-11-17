"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";
import styles from "./PartnersSection.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PartnersRevealProps = {
  children: ReactNode;
};

export default function PartnersReveal({ children }: PartnersRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1025px)",
          stacked: "(max-width: 1024px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reducedMotion) return;

          const root = sectionRef.current;
          if (!root) return;

          const copy = root.querySelector(`.${styles.copy}`);
          const cardArea = root.querySelector(`.${styles.cards}`);

          if (!copy || !cardArea) return;

          const copyItems = Array.from(copy.children);
          const cards = cardArea.querySelectorAll("article");

          const copyMotion = {
            opacity: 0,
            y: 28,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            clearProps: "opacity,transform",
          };

          const cardMotion = {
            opacity: 0,
            y: 48,
            rotation: -1,
            duration: 1.5,
            stagger: 0.4,
            ease: "power2.out",
            clearProps: "opacity,transform",
          };

          if (context.conditions?.desktop) {
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: copy,
                start: "top 80%",
                once: true,
              },
            });

            timeline.from(copyItems, copyMotion, 0).from(cards, cardMotion, 0.4);
          } else {
            gsap.from(copyItems, {
              ...copyMotion,
              scrollTrigger: {
                trigger: copy,
                start: "top 75%",
                once: true,
              },
            });

            gsap.from(cards, {
              ...cardMotion,
              scrollTrigger: {
                trigger: cardArea,
                start: "top 60%",
                once: true,
              },
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className={styles.inner}>
      {children}
    </div>
  );
}
