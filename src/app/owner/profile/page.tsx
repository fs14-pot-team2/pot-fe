"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { isAxiosError } from "axios";

import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";

import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import FilterChip from "@/components/ui/FilterChip/FilterChip";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const updateProfile = useUpdateOwnerProfile();

  // 연속 클릭 및 중복 저장 요청 차단
  const savingRef = useRef(false);

  // 이미지 업로드부터 PATCH 완료까지의 저장 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 마지막으로 전달받은 서버 프로필
  const [previousProfile, setPreviousProfile] = useState(profile);

  // 변경 여부를 비교할 서버 저장 기준값
  const [savedProfile, setSavedProfile] = useState(profile);

  // 화면에서 사용자가 편집 중인 값
  const [selectedServices, setSelectedServices] = useState<PartnerServiceType[]>(
    profile.preferredServiceTypes ?? [],
  );

  const [selectedRegion, setSelectedRegion] = useState<PartnerRegion | null>(
    profile.livingRegion ?? null,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  // 서버 프로필 재조회 시 기준값 갱신
  // 사용자가 편집 중인 필드는 유지
  if (profile !== previousProfile) {
    setPreviousProfile(profile);
    setSavedProfile(profile);

    setSelectedServices((current) =>
      isSameServices(current, previousProfile.preferredServiceTypes ?? [])
        ? (profile.preferredServiceTypes ?? [])
        : current,
    );

    setSelectedRegion((current) =>
      current === previousProfile.livingRegion ? (profile.livingRegion ?? null) : current,
    );
  }

  // Object URL 메모리 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 이미지 업로드 및 PATCH 요청 전체 기간에 적용
  const isSaving = isSubmitting || updateProfile.isPending;

  const imageSrc = isImageRemoved ? null : (previewUrl ?? savedProfile.profileImageUrl);

  const servicesChanged = !isSameServices(
    selectedServices,
    savedProfile.preferredServiceTypes ?? [],
  );

  const regionChanged = selectedRegion !== savedProfile.livingRegion;

  const imageChanged =
    imageFile !== null || (isImageRemoved && savedProfile.profileImageUrl !== null);

  const hasChanges = imageChanged || servicesChanged || regionChanged;

  // 이미지 선택창 열기
  const handleImageClick = () => {
    if (isSaving) return;

    fileInputRef.current?.click();
  };

  // 이미지 선택 및 유효성 검사
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isSaving) return;

    const file = event.target.files?.[0];

    if (!file) return;

    // 같은 파일 재선택 가능
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

  // 프로필 이미지 제거
  const handleImageRemove = () => {
    if (isSaving) return;

    setImageFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
  };

  // 이용 서비스 선택 및 해제
  const handleServiceToggle = (service: PartnerServiceType) => {
    if (isSaving) return;

    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service],
    );
  };

  // 지역 선택 및 해제
  const handleRegionToggle = (region: PartnerRegion) => {
    if (isSaving) return;

    setSelectedRegion((prev) => (prev === region ? null : region));
  };

  // 취소 시 수정사항을 저장하지 않고 이전 페이지 이동
  const handleCancel = () => {
    if (isSaving || savingRef.current) return;

    router.back();
  };

  // 프로필 저장
  const handleSave = async () => {
    // 연속 클릭 및 중복 제출 방지
    if (isSaving || savingRef.current) return;

    savingRef.current = true;
    setIsSubmitting(true);

    let shouldNavigate = false;

    try {
      // 변경사항이 있는 경우에만 API 요청
      if (hasChanges) {
        const input: UpdateOwnerProfileInput = {};

        if (servicesChanged) {
          input.preferredServiceTypes = selectedServices;
        }

        if (regionChanged) {
          input.livingRegion = selectedRegion;
        }

        if (imageFile) {
          // Presigned URL 발급 및 S3 이미지 업로드
          input.profileImageUrl = await uploadProfileImage(imageFile);
        } else if (imageChanged && isImageRemoved) {
          input.profileImageUrl = null;
        }

        // 변경된 필드만 PATCH 요청
        const updatedProfile = await updateProfile.mutateAsync(input);

        // 저장 성공 후 서버 기준값 및 폼 동기화
        setSavedProfile(updatedProfile);
        setPreviousProfile(updatedProfile);

        setSelectedServices(updatedProfile.preferredServiceTypes ?? []);
        setSelectedRegion(updatedProfile.livingRegion ?? null);

        setImageFile(null);
        setPreviewUrl(null);
        setIsImageRemoved(false);
      }

      // 변경사항 유무와 관계없이 성공 토스트 표시
      showToast({
        message: "저장되었습니다.",
      });

      // 저장 완료 후 이전 페이지 이동
      router.back();
      shouldNavigate = true;
    } catch (error) {
      // 저장 실패 시 현재 페이지 및 입력값 유지
      showToast({
        message: getErrorMessage(error),
      });
    } finally {
      // 저장 실패 시 잠금 해제 및 재시도 허용
      // 성공 시 페이지 이동 전까지 중복 제출 방지
      if (!shouldNavigate) {
        savingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <PageMain>
      <PageContainer>
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
                *이용 서비스는 복수 선택 가능하며, 언제든 수정 가능해요!
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

          {/* 저장 및 취소 버튼 */}
          <div className={styles.saveButtonWrap}>
            <Button
              type="button"
              variant="solid"
              size="md"
              disabled={isSaving}
              onClick={() => void handleSave()}
              className={styles.saveButton}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              size="md"
              disabled={isSaving}
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              취소
            </Button>
          </div>
        </div>
      </PageContainer>
    </PageMain>
  );
}

export default function OwnerProfilePage() {
  const { data, isPending, isError, isFetching, error, refetch } = useOwnerProfile();

  // 타입 좁히기 전에 다시 시도 핸들러 정의
  const handleRetry = () => {
    void refetch();
  };

  // 최초 프로필 조회 및 데이터가 없는 상태에서 다시 시도 중
  if (isPending || (!data && isFetching)) {
    return (
      <PageMain variant="fullWidth">
        <Loading variant="full" message="프로필 정보를 불러오는 중..." />
      </PageMain>
    );
  }

  // 프로필 조회 실패 또는 데이터가 없는 경우
  if (!data) {
    return (
      <PageMain variant="fullWidth">
        <ErrorState
          variant="page"
          title={isError ? "프로필 정보를 불러오지 못했어요" : "프로필 정보를 찾을 수 없어요"}
          description={isError ? getErrorMessage(error) : "잠시 후 다시 시도해 주세요."}
          actionLabel="다시 시도"
          onAction={handleRetry}
        />
      </PageMain>
    );
  }

  return <OwnerProfileForm key={data.userId} profile={data} />;
}
