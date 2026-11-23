import PageMain from "@/components/layout/Page/PageMain";
import SocialCallback from "@/features/auth/components/SocialCallback/SocialCallback";

export default function GoogleCallbackPage() {
  return (
    <PageMain>
      <SocialCallback provider="GOOGLE" />
    </PageMain>
  );
}
