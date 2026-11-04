"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import FilterChip from "@/components/ui/FilterChip/FilterChip";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./ProfilePage.module.css";

type CareType = "SHORT_CARE" | "REGULAR_CARE";

const REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "세종",
  "대전",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
] as const;

type Region = (typeof REGIONS)[number];

export default function OwnerProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<CareType[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // 미리보기 URL 메모리 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 이미지 클릭 시 파일 선택창 열기
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 선택 및 유효성 검사
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // 같은 파일 재선택 가능
    event.target.value = "";

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showToast({
        message: "JPG, JPEG, PNG, WEBP 이미지만 등록할 수 있어요.",
      });
      return;
    }

    if (file.size > maxSize) {
      showToast({
        message: "이미지는 최대 5MB까지 등록할 수 있어요.",
      });
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 이용 서비스 선택 및 해제 (0~2개)
  const handleServiceToggle = (service: CareType) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service],
    );
  };

  // 지역 선택 및 해제 (0~1개)
  const handleRegionToggle = (region: Region) => {
    setSelectedRegion((prev) => (prev === region ? null : region));
  };

  // 초기 상태와 비교한 임시 변경 여부
  const hasChanges = imageFile !== null || selectedServices.length > 0 || selectedRegion !== null;

  // 실제 저장은 #107 API 연동에서 구현
  const handleSave = () => {
    if (!hasChanges) return;

    showToast({
      message: "현재는 UI 테스트 단계입니다. 실제 저장은 API 연동 후 가능합니다.",
    });
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.profileWrap}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>프로필 관리</div>
            <div className={styles.subText}>추가 정보를 입력해 주세요.</div>
          </div>

          <div className={styles.contentsWrap}>
            {/* 프로필 이미지 */}
            <div className={styles.contents}>
              <div className={styles.title}>프로필 이미지</div>

              <div className={styles.content}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  hidden
                  aria-label="프로필 이미지 선택"
                />

                <button
                  type="button"
                  className={styles.imageUploadButton}
                  onClick={handleImageClick}
                  aria-label="프로필 이미지 변경"
                >
                  <ProfileImage src={previewUrl} alt="팟오너 프로필 이미지" sizes="160px" />
                </button>
              </div>
            </div>

            {/* 이용 서비스 */}
            <div className={styles.contents}>
              <div className={styles.title}>이용 서비스</div>

              <div className={styles.subText}>
                *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
              </div>

              <div className={styles.content}>
                <div className={styles.content}>
                  <div className={`${styles.filterChipWrap} ${styles.careFliterChip}`}>
                    <FilterChip
                      label="잠깐만 돌봄"
                      selected={selectedServices.includes("SHORT_CARE")}
                      onClick={() => handleServiceToggle("SHORT_CARE")}
                      className={styles.profileChip}
                    />

                    <FilterChip
                      label="꾸준히 돌봄"
                      selected={selectedServices.includes("REGULAR_CARE")}
                      onClick={() => handleServiceToggle("REGULAR_CARE")}
                      className={styles.profileChip}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 내가 사는 지역 */}
            <div className={styles.contents}>
              <div className={styles.title}>내가 사는 지역</div>

              <div className={styles.subText}>*내가 사는 지역은 언제든 수정 가능해요!</div>

              <div className={styles.content}>
                <div className={styles.content}>
                  <div className={`${styles.filterChipWrap} ${styles.regionFilterChip}`}>
                    {REGIONS.map((region) => (
                      <FilterChip
                        key={region}
                        label={region}
                        selected={selectedRegion === region}
                        onClick={() => handleRegionToggle(region)}
                        className={styles.profileChip}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className={styles.saveButtonWrap}>
            <Button
              type="button"
              variant="solid"
              size="md"
              disabled={!hasChanges}
              onClick={handleSave}
              className={styles.saveButton}
            >
              저장하기
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
