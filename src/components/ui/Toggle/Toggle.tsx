"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./Toggle.module.css";

type ToggleOption = {
  label: string;
  value: string;
};

type ToggleProps = {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "auth" | "filter";
  className?: string;
};

export default function Toggle({
  options,
  value,
  onChange,
  variant = "default",
  className = "",
}: ToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
  });

  const [animateIndicator, setAnimateIndicator] = useState(false);

  const toggleClassName = [styles.toggle, styles[variant], className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateIndicator = () => {
      const selectedIndex = options.findIndex((option) => option.value === value);
      const selectedButton = buttonRefs.current[selectedIndex];

      if (!selectedButton) {
        setIndicator({ left: 0, width: 0 });
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    };

    updateIndicator();

    let previousWidth = container.getBoundingClientRect().width;

    const resizeObserver = new ResizeObserver(() => {
      const currentWidth = container.getBoundingClientRect().width;

      if (currentWidth !== previousWidth) {
        previousWidth = currentWidth;
        setAnimateIndicator(false);
        updateIndicator();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [options, value]);

  return (
    <div ref={containerRef} className={toggleClassName}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
          className={styles.option}
          aria-pressed={value === option.value}
          onClick={() => {
            if (value !== option.value) {
              setAnimateIndicator(true);
              onChange(option.value);
            }
          }}
        >
          {option.label}
        </button>
      ))}

      <span
        className={styles.indicator}
        aria-hidden="true"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          transition: animateIndicator ? undefined : "none",
        }}
      />
    </div>
  );
}
