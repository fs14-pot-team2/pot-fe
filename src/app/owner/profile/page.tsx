"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { isAxiosError } from "axios";

import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import FilterChip from "@/components/ui/FilterChip/FilterChip";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import { REGION_OPTIONS, SERVICE_TYPE_OPTIONS } from "@/features/profiles/sitter/constants";

import { uploadProfileImage } from "@/features/profiles/owner/api/ownerProfileApi";
import {
  useOwnerProfile,
  useUpdateOwnerProfile,
} from "@/features/profiles/owner/hooks/useOwnerProfile";

import type {
  OwnerProfile,
  UpdateOwnerProfileInput,
} from "@/features/profiles/owner/types/ownerProfile";

import type { PartnerRegion, PartnerServiceType } from "@/types/partner";

import styles from "./ProfilePage.module.css";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// 서비스 유형 순서와 무관하게 동일한 선택인지 비교합니다.
function isSameServices(a: PartnerServiceType[], b: PartnerServiceType[]) {
  return a.length === b.length && a.every((service) => b.includes(service));
}

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "프로필 처리 중 오류가 발생했습니다.";
  }

  const code = error.response?.data?.code;

  switch (code) {
    case "INVALID_PROFILE_IMAGE":
      return "프로필 이미지가 올바르지 않습니다.";

    case "INVALID_SERVICE_TYPE":
      return "올바르지 않은 서비스 유형입니다.";

    case "TOO_MANY_SERVICE_TYPES":
      return "서비스 유형은 최대 2개까지 선택할 수 있습니다.";

    case "INVALID_REGION":
      return "올바르지 않은 지역입니다.";

    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
      return "로그인이 필요합니다. 다시 로그인해 주세요.";

    case "FORBIDDEN":
      return "프로필에 접근할 권한이 없습니다.";

    case "PROFILE_NOT_FOUND":
      return "프로필을 찾을 수 없습니다.";

    default:
      return error.response?.data?.message || "프로필 처리 중 오류가 발생했습니다.";
  }
}

function OwnerProfileForm({ profile }: { profile: OwnerProfile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const updateProfile = useUpdateOwnerProfile();

  // 서버에서 마지막으로 확인된 프로필
  const [savedProfile, setSavedProfile] = useState(profile);

  // 화면에서 수정 중인 값
  const [selectedServices, setSelectedServices] = useState<PartnerServiceType[]>(
    profile.preferredServiceTypes ?? [],
  );

  const [selectedRegion, setSelectedRegion] = useState<PartnerRegion | null>(
    profile.livingRegion ?? null,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  // Object URL 메모리 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isSaving = updateProfile.isPending;

  const imageSrc = isImageRemoved ? null : (previewUrl ?? savedProfile.profileImageUrl);

  const servicesChanged = !isSameServices(
    selectedServices,
    savedProfile.preferredServiceTypes ?? [],
  );

  const regionChanged = selectedRegion !== savedProfile.livingRegion;

  const imageChanged =
    imageFile !== null || (isImageRemoved && savedProfile.profileImageUrl !== null);

  const hasChanges = imageChanged || servicesChanged || regionChanged;

  const handleImageClick = () => {
    if (isSaving) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isSaving) return;

    const file = event.target.files?.[0];

    if (!file) return;

    // 같은 파일도 다시 선택할 수 있도록 초기화
    event.target.value = "";

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast({
        message: "JPG, JPEG, PNG, WEBP 이미지만 등록할 수 있어요.",
      });
      return;
    }

    if (file.size < 1 || file.size > MAX_IMAGE_SIZE) {
      showToast({
        message: "이미지는 최대 5MB까지 등록할 수 있어요.",
      });
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsImageRemoved(false);
  };

  const handleImageRemove = () => {
    if (isSaving) return;

    setImageFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
  };

  const handleServiceToggle = (service: PartnerServiceType) => {
    if (isSaving) return;

    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service],
    );
  };

  const handleRegionToggle = (region: PartnerRegion) => {
    if (isSaving) return;

    setSelectedRegion((prev) => (prev === region ? null : region));
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    const input: UpdateOwnerProfileInput = {};

    if (servicesChanged) {
      input.preferredServiceTypes = selectedServices;
    }

    if (regionChanged) {
      input.livingRegion = selectedRegion;
    }

    try {
      if (imageFile) {
        // 1. Presigned URL 발급
        // 2. S3에 이미지 업로드
        // 3. 반환된 imageUrl을 프로필 수정 요청에 포함
        input.profileImageUrl = await uploadProfileImage(imageFile);
      } else if (isImageRemoved) {
        input.profileImageUrl = null;
      }

      // 변경된 필드만 PATCH
      const updatedProfile = await updateProfile.mutateAsync(input);

      // 저장 성공 후 비교 기준 갱신
      setSavedProfile(updatedProfile);

      setSelectedServices(updatedProfile.preferredServiceTypes ?? []);

      setSelectedRegion(updatedProfile.livingRegion ?? null);

      setImageFile(null);
      setPreviewUrl(null);
      setIsImageRemoved(false);

      showToast({
        message: "프로필이 저장되었습니다.",
      });
    } catch (error) {
      // 실패 시 기존 입력값과 이미지 미리보기 유지
      showToast({
        message: getErrorMessage(error),
      });
    }
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
                  disabled={isSaving}
                  hidden
                  aria-label="프로필 이미지 선택"
                />

                <button
                  type="button"
                  className={styles.imageUploadButton}
                  onClick={handleImageClick}
                  disabled={isSaving}
                  aria-label="프로필 이미지 변경"
                >
                  <ProfileImage src={imageSrc} alt="팟오너 프로필 이미지" sizes="160px" />
                </button>

                {imageSrc && (
                  <div style={{ marginTop: 12 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      className={styles.imgDeleteButton}
                      onClick={handleImageRemove}
                      disabled={isSaving}
                    >
                      이미지 제거
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 이용 서비스 */}
            <div className={styles.contents}>
              <div className={styles.title}>이용 서비스</div>

              <div className={styles.subText}>
                *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
              </div>

              <div className={styles.content}>
                <div className={`${styles.filterChipWrap} ${styles.careFliterChip}`}>
                  {SERVICE_TYPE_OPTIONS.map(({ value, label }) => (
                    <FilterChip
                      key={value}
                      label={label}
                      selected={selectedServices.includes(value)}
                      onClick={() => handleServiceToggle(value)}
                      disabled={isSaving}
                      className={styles.profileChip}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 내가 사는 지역 */}
            <div className={styles.contents}>
              <div className={styles.title}>내가 사는 지역</div>

              <div className={styles.subText}>*내가 사는 지역은 언제든 수정 가능해요!</div>

              <div className={styles.content}>
                <div className={`${styles.filterChipWrap} ${styles.regionFilterChip}`}>
                  {REGION_OPTIONS.map(({ value, label }) => (
                    <FilterChip
                      key={value}
                      label={label}
                      selected={selectedRegion === value}
                      onClick={() => handleRegionToggle(value)}
                      disabled={isSaving}
                      className={styles.profileChip}
                    />
                  ))}
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
              disabled={!hasChanges || isSaving}
              onClick={() => void handleSave()}
              className={styles.saveButton}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OwnerProfilePage() {
  const { data, isPending, isError, error, refetch } = useOwnerProfile();

  if (isPending) {
    return (
      <main className={styles.main}>
        <div className="container" role="status">
          <p>프로필 정보를 불러오는 중입니다.</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={styles.main}>
        <div className="container" role="alert">
          <p>{getErrorMessage(error)}</p>

          <Button type="button" variant="outlined" size="sm" onClick={() => void refetch()}>
            다시 시도
          </Button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.main}>
        <div className="container">
          <p>프로필 정보를 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  // 데이터 조회 후 폼을 생성하여 초기값을 설정합니다.
  return <OwnerProfileForm key={data.userId} profile={data} />;
}
