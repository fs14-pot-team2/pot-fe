import PageMain from "@/components/layout/Page/PageMain";
import SocialCallback from "@/features/auth/components/SocialCallback/SocialCallback";

export default function KakaoCallbackPage() {
  return (
    <PageMain>
      <SocialCallback provider="KAKAO" />
    </PageMain>
  );
}
