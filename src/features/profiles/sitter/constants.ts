import type { PartnerRegion, PartnerServiceType } from "@/types/partner";
import type { PartnerGender } from "./types";

export const GENDER_OPTIONS: { value: PartnerGender; label: string }[] = [
  { value: "MALE", label: "남자" },
  { value: "FEMALE", label: "여자" },
];

export const SERVICE_TYPE_OPTIONS: { value: PartnerServiceType; label: string }[] = [
  { value: "SHORT_CARE", label: "잠깐만 돌봄" },
  { value: "REGULAR_CARE", label: "꾸준히 돌봄" },
];

export const REGION_OPTIONS: { value: PartnerRegion; label: string }[] = [
  { value: "SEOUL", label: "서울" },
  { value: "GYEONGGI", label: "경기" },
  { value: "INCHEON", label: "인천" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "SEJONG", label: "세종" },
  { value: "DAEJEON", label: "대전" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GWANGJU", label: "광주" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "DAEGU", label: "대구" },
  { value: "ULSAN", label: "울산" },
  { value: "BUSAN", label: "부산" },
  { value: "JEJU", label: "제주" },
];
