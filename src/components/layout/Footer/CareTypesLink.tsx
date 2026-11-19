"use client";

import Link from "next/link";

export default function CareTypesLink() {
  return (
    <Link
      href="/#care-types"
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          window.location.pathname !== "/"
        ) {
          return;
        }

        const section = document.getElementById("care-types");
        if (!section) return;

        event.preventDefault();

        if (window.location.hash !== "#care-types") {
          window.location.hash = "care-types";
        }

        section.scrollIntoView({ block: "start", behavior: "instant" });
      }}
    >
      돌봄 유형
    </Link>
  );
}
