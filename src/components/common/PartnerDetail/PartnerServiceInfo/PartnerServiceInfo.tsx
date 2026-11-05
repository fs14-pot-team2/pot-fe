import type { PartnerInfo, PartnerRegion } from "@/types/partner";
import styles from "./PartnerServiceInfo.module.css";

type PartnerServiceInfoProps = {
  partner: PartnerInfo;
};

const regionLabels: Record<PartnerRegion, string> = {
  SEOUL: "서울",
  GYEONGGI: "경기",
  INCHEON: "인천",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  SEJONG: "세종",
  DAEJEON: "대전",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GWANGJU: "광주",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  DAEGU: "대구",
  ULSAN: "울산",
  BUSAN: "부산",
  JEJU: "제주",
};

export default function PartnerServiceInfo({ partner }: PartnerServiceInfoProps) {
  const isNationwide = partner.serviceRegions.length === Object.keys(regionLabels).length;

  const regions = isNationwide
    ? ["전국"]
    : partner.serviceRegions.map((region) => regionLabels[region]);

  return (
    <section className={styles.serviceInfo} aria-label="팟트너 서비스 정보">
      <div className={styles.group}>
        <h2 className={styles.title}>제공 서비스</h2>

        <div className={styles.tags}>
          {partner.serviceTypes.map((serviceType) => (
            <span key={serviceType} className={`${styles.chip} ${styles.serviceChip}`}>
              {serviceType === "SHORT_CARE" ? "잠깐만 돌봄" : "꾸준히 돌봄"}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h2 className={styles.title}>서비스 가능 지역</h2>

        <div className={styles.tags}>
          {regions.map((region) => (
            <span key={region} className={`${styles.chip} ${styles.regionChip}`}>
              {region}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
