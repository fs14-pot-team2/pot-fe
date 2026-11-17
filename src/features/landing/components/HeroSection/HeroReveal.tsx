"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type ReactNode, useRef } from "react";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(useGSAP);

type HeroRevealProps = {
  children: ReactNode;
};

export default function HeroReveal({ children }: HeroRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const root = sectionRef.current;
      if (!root) return;

      const content = root.querySelector(`.${styles.content}`);
      const visual = root.querySelector(`.${styles.visual}`);
      const image = root.querySelector(`.${styles.backgroundImage}`);

      if (!content || !visual || !image) return;

      const items = content.children;

      const timeline = gsap.timeline({
        defaults: {
          duration: 0.85,
          ease: "power2.out",
        },
      });

      timeline
        .from(items[0], { y: 16, autoAlpha: 0 })
        .from(items[1], { y: 36, autoAlpha: 0 }, "-=0.55")
        .from([items[2], items[3]], { y: 24, autoAlpha: 0, stagger: 0.16 }, "-=0.5");

      const isMobile = window.matchMedia("(max-width: 540px)").matches;
      const visualStart = isMobile ? timeline.duration() - 0.85 : 0;
      const visualDuration = isMobile ? 1 : 1.6;

      timeline
        .from(visual, { opacity: 0, duration: visualDuration, clearProps: "opacity" }, visualStart)
        .from(
          image,
          { scale: 1.04, duration: visualDuration, clearProps: "transform" },
          visualStart,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      {children}
    </section>
  );
}
