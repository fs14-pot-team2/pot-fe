import type { PartnerInfo, PartnerReviewsData } from "@/types/partner";
import type { ReactNode } from "react";
import PartnerActivity from "./PartnerActivity/PartnerActivity";
import styles from "./PartnerDetail.module.css";
import PartnerProfile from "./PartnerProfile/PartnerProfile";
import PartnerReviews from "./PartnerReviews/PartnerReviews";
import PartnerServiceInfo from "./PartnerServiceInfo/PartnerServiceInfo";

type PartnerDetailProps = {
  partner: PartnerInfo;
  reviews: PartnerReviewsData;
  showDesignatedTag?: boolean;
  pagination?: ReactNode;
};

export default function PartnerDetail({
  partner,
  reviews,
  showDesignatedTag,
  pagination,
}: PartnerDetailProps) {
  return (
    <div className={styles.detail}>
      <div className={styles.profile}>
        <PartnerProfile partner={partner} showDesignatedTag={showDesignatedTag} />
        <PartnerActivity partner={partner} />
      </div>

      <PartnerServiceInfo partner={partner} />

      <PartnerReviews reviews={reviews} pagination={pagination} />
    </div>
  );
}
