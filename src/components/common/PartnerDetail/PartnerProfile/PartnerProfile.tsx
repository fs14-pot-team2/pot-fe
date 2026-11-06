import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import type { PartnerInfo } from "@/types/partner";
import Image from "next/image";
import styles from "./PartnerProfile.module.css";

type PartnerProfileProps = {
  partner: PartnerInfo;
  showDesignatedTag?: boolean;
};

export default function PartnerProfile({
  partner,
  showDesignatedTag = false,
}: PartnerProfileProps) {
  const genderLabel = partner.gender === "MALE" ? "남성" : "여성";

  return (
    <section className={styles.profile} aria-label="팟트너 프로필">
      {showDesignatedTag && (
        <div className={styles.designatedTag}>
          <Tag variant="designated" />
        </div>
      )}

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <ProfileImage
            src={partner.profileImageUrl}
            alt={`${partner.nickname} 프로필 사진`}
            sizes="72px"
          />
        </div>

        <div className={styles.name}>
          <Image src="/icons/ic_sitter.svg" alt="" width={16} height={16} />
          <strong>{partner.nickname} 팟트너</strong>
          <span className={styles.gender}>{genderLabel}</span>
        </div>
      </div>

      <p className={styles.introduction}>{partner.shortIntroduction}</p>

      {partner.description && <p className={styles.description}>{partner.description}</p>}
    </section>
  );
}
