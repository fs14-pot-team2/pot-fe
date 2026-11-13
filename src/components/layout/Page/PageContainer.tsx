import type { ComponentPropsWithoutRef } from "react";

/** Uses the existing global container, including its responsive horizontal padding. */
export default function PageContainer({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={["container", className].filter(Boolean).join(" ")} />;
}
