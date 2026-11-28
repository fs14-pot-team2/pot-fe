import PageMain from "@/components/layout/Page/PageMain";
import Loading from "@/components/ui/Loading/Loading";
import SittersPage from "@/features/sitters/components/SittersPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageMain variant="fullWidth">
          <Loading variant="full" />
        </PageMain>
      }
    >
      <SittersPage />
    </Suspense>
  );
}
