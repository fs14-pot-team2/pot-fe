"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";
import styles from "./FinalCtaSection.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type FinalCtaRevealProps = {
  children: ReactNode;
};

export default function FinalCtaReveal({ children }: FinalCtaRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = sectionRef.current;
        if (!root) return;

        const items = Array.from(root.children);

        gsap.from(items, {
          opacity: 0,
          y: 28,
          duration: 1.2,
          stagger: 0.25,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: root,
            start: "clamp(top 80%)",
            once: true,
          },
        });
      });

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
