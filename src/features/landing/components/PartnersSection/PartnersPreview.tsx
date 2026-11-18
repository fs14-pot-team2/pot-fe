import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import Image from "next/image";
import cardStyles from "@/components/common/PartnerCard/PartnerCard.module.css";

type ExamplePartner = {
  nickname: string;
  serviceType: "SHORT_CARE" | "REGULAR_CARE";
  introduction: string;
  description: string;
  confirmedCount: number;
  profileImageUrl: string;
  gender: "MALE" | "FEMALE";
  rating: number;
  reviewCount: number;
};

const examplePartners: ExamplePartner[] = [
  {
    nickname: "초록향기",
    serviceType: "SHORT_CARE",
    introduction: "소중한 식물을 세심하게 돌볼게요.",
    description: "필요한 날에 방문하는 식물 돌봄을 제공합니다.",
    confirmedCount: 166,
    profileImageUrl: "/images/landing/partner-female.png",
    gender: "FEMALE",
    rating: 4.9,
    reviewCount: 148,
  },
  {
    nickname: "물좀줄래",
    serviceType: "REGULAR_CARE",
    introduction: "일상의 식물 돌봄을 함께해요.",
    description: "정기적으로 방문하는 식물 관리 서비스입니다.",
    confirmedCount: 112,
    profileImageUrl: "/images/landing/partner-male.png",
    gender: "MALE",
    rating: 4.7,
    reviewCount: 85,
  },
];

export default function PartnersPreview() {
  return (
    <>
      {examplePartners.map((partner) => (
        <article key={partner.nickname} className={cardStyles.card}>
          <div className={cardStyles.tags}>
            <Tag variant="profile" serviceType={partner.serviceType} size="sm" />
          </div>

          <div className={cardStyles.body}>
            <div className={cardStyles.introduction}>
              <p className={cardStyles.headline}>{partner.introduction}</p>
              <p className={cardStyles.description}>{partner.description}</p>
            </div>

            <div className={cardStyles.photo}>
              <ProfileImage
                src={partner.profileImageUrl}
                alt={`${partner.nickname} 예시 프로필 사진`}
                sizes="(max-width: 540px) 48px, 134px"
              />
            </div>

            <div className={cardStyles.info}>
              <div className={cardStyles.nickname}>
                <Image src="/icons/ic_sitter.svg" alt="" width={10} height={15} />
                <span>{partner.nickname}</span>
              </div>

              <div className={cardStyles.stats}>
                <span className={cardStyles.rating}>
                  <Image src="/icons/ic_star.svg" alt="" width={18} height={18} />
                  {partner.rating.toFixed(1)}
                  <span className={cardStyles.reviewCount}>({partner.reviewCount})</span>
                </span>

                <span className={cardStyles.gender}>
                  {partner.gender === "FEMALE" ? "여성" : "남성"}
                </span>
                <span className={cardStyles.confirmed}>
                  <strong>{partner.confirmedCount}건</strong> 확정
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
