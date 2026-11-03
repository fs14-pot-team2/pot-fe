import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import Image from "next/image";
import Link from "next/link";
import styles from "./PartnerCard.module.css";

type ServiceType = "SHORT_CARE" | "REGULAR_CARE";

type Gender = "MALE" | "FEMALE";

type Partner = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  gender: Gender;
  shortIntroduction: string;
  description?: string | null;
  serviceTypes: ServiceType[];
  averageRating: number | null;
  reviewCount: number;
  confirmedQuoteCount: number;
};

type PartnerCardProps = {
  partner: Partner;
  href: string;
  className?: string;
};

export default function PartnerCard({ partner, href, className = "" }: PartnerCardProps) {
  return (
    <Link href={href} className={`${styles.card} ${className}`}>
      <div className={styles.tags}>
        {partner.serviceTypes.map((serviceType) => (
          <Tag key={serviceType} variant="profile" serviceType={serviceType} size="sm" />
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.introduction}>
          <p className={styles.headline}>{partner.shortIntroduction}</p>
          {partner.description && <p className={styles.description}>{partner.description}</p>}
        </div>

        <div className={styles.photo}>
          <ProfileImage
            src={partner.profileImageUrl}
            alt={`${partner.nickname} 프로필 사진`}
            sizes="(max-width: 540px) 48px, 134px"
          />
        </div>

        <div className={styles.info}>
          <div className={styles.nickname}>
            <Image src="/icons/ic_sitter.svg" alt="" width={10} height={15} />
            <span>{partner.nickname}</span>
          </div>

          <div className={styles.stats}>
            <div className={styles.rating}>
              <Image src="/icons/ic_star.svg" alt="" width={18} height={18} />
              <span>{(partner.averageRating ?? 0).toFixed(1)}</span>
              <span className={styles.reviewCount}>({partner.reviewCount})</span>
            </div>

            <span className={styles.gender}>{partner.gender === "MALE" ? "남성" : "여성"}</span>

            <span className={styles.confirmed}>
              <strong>{partner.confirmedQuoteCount}건</strong> 확정
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
