"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Button from "@/components/ui/Button/Button";
import type { PartnerProfileValues } from "../../types";
import DropDown from "@/components/ui/DropDown/DropDown";
import Input from "@/components/ui/Input/Input";
import TextArea from "@/components/ui/TextArea/TextArea";
import { GENDER_OPTIONS, SERVICE_TYPE_OPTIONS, REGION_OPTIONS } from "../../constants";
import FilterChip from "@/components/ui/FilterChip/FilterChip";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./PartnerProfileForm.module.css";

type PartnerProfileFormProps = {
  mode: "create" | "edit";
  initialValues?: PartnerProfileValues;
  isSubmitting?: boolean;
  onSubmit: (values: PartnerProfileValues, imageFile: File | null) => void;
};

const countWithoutSpaces = (value: string) => {
  return value.replace(/\s/g, "").length;
};

const EMPTY_PROFILE_VALUES: PartnerProfileValues = {
  profileImageUrl: null,
  gender: "",
  shortIntroduction: "",
  description: "",
  serviceTypes: [],
  serviceRegions: [],
};

export default function PartnerProfileForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
}: PartnerProfileFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<PartnerProfileValues>({
    defaultValues: initialValues ?? EMPTY_PROFILE_VALUES,
    mode: "onChange",
  });

  const profileImageUrl = useWatch({
    control,
    name: "profileImageUrl",
  });

  const [isNationwideSelected, setIsNationwideSelected] = useState(
    initialValues?.serviceRegions.length === REGION_OPTIONS.length,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const isCreateMode = mode === "create";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    event.target.value = "";

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showToast({
        message: "JPG, JPEG, PNG, WEBP 이미지만 등록할 수 있어요.",
      });
      return;
    }

    if (file.size > maxFileSize) {
      showToast({
        message: "이미지는 최대 5MB까지 등록할 수 있어요.",
      });
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = (values: PartnerProfileValues) => {
    onSubmit(values, imageFile);
  };

  return (
    <section className={styles.formContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>{isCreateMode ? "팟트너 프로필 관리" : "프로필 관리"}</h1>
        {isCreateMode && (
          <p className={styles.description}>추가 정보를 입력하여 회원가입을 완료해주세요.</p>
        )}
      </header>

      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <section className={`${styles.fieldSection} ${styles.imageSection}`}>
          <h2 className={styles.fieldTitle}>프로필 이미지</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            hidden
          />

          <button type="button" className={styles.imageButton} onClick={handleImageClick}>
            <ProfileImage
              src={previewUrl ?? profileImageUrl}
              alt="팟트너 프로필 이미지"
              sizes="(max-width: 768px) 100px, 160px"
              className={styles.profileImage}
            />
          </button>
        </section>

        <Controller
          name="gender"
          control={control}
          rules={{
            required: "성별을 선택해주세요.",
          }}
          render={({ field, fieldState }) => (
            <div className={styles.fieldSection}>
              <label className={styles.fieldTitle}>
                성별 <span className={styles.requiredMark}>*</span>
              </label>

              <DropDown
                placeholder="성별"
                options={GENDER_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                className={`${styles.genderDropdown} ${fieldState.error ? styles.errorDropdown : ""}`}
              />

              {fieldState.error && (
                <p className={styles.errorMessage}>{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="shortIntroduction"
          control={control}
          rules={{
            validate: (value) => {
              if (countWithoutSpaces(value) === 0) {
                return "한 줄 소개를 입력해주세요.";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Input
              label="한 줄 소개"
              required
              value={field.value}
              onChange={field.onChange}
              className={styles.fieldSection}
              placeholder="한 줄 소개를 입력해 주세요"
              maxLength={18}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{
            validate: (value) => {
              if (countWithoutSpaces(value) > 1000) {
                return "공백을 제외하고 1000자 이내로 입력해주세요.";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <TextArea
              label="상세 설명"
              value={field.value}
              onChange={field.onChange}
              className={`${styles.fieldSection} ${styles.descriptionField}`}
              placeholder="상세 내용을 입력해 주세요"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="serviceTypes"
          control={control}
          rules={{
            validate: (value) => {
              if (value.length === 0) {
                return "1개 이상 선택해주세요.";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <section className={styles.fieldSection}>
              <div>
                <h2 className={styles.fieldTitle}>
                  제공 서비스{" "}
                  <span className={styles.requiredMark}>
                    * <span className={styles.selectionGuide}> 복수 선택 가능</span>
                  </span>
                </h2>

                {fieldState.error && (
                  <p className={styles.errorMessage}>{fieldState.error.message}</p>
                )}
              </div>

              <div className={`${styles.chipGroup} ${styles.serviceChipGroup}`}>
                {SERVICE_TYPE_OPTIONS.map((option) => {
                  const isSelected = field.value.includes(option.value);

                  const handleToggle = () => {
                    const nextValue = isSelected
                      ? field.value.filter((serviceType) => serviceType !== option.value)
                      : [...field.value, option.value];

                    field.onChange(nextValue);
                  };

                  return (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={isSelected}
                      onClick={handleToggle}
                      className={styles.profileChip}
                    />
                  );
                })}
              </div>
            </section>
          )}
        />

        <Controller
          name="serviceRegions"
          control={control}
          rules={{
            validate: (value) => {
              if (value.length === 0) {
                return "1개 이상 선택해주세요.";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => {
            const handleNationwideToggle = () => {
              if (isNationwideSelected) {
                setIsNationwideSelected(false);
                field.onChange([]);
                return;
              }

              const allRegions = REGION_OPTIONS.map((option) => option.value);

              setIsNationwideSelected(true);
              field.onChange(allRegions);
            };

            const handleRegionToggle = (region: (typeof REGION_OPTIONS)[number]["value"]) => {
              if (isNationwideSelected) {
                setIsNationwideSelected(false);
                field.onChange([region]);
                return;
              }

              const isSelected = field.value.includes(region);

              const nextValue = isSelected
                ? field.value.filter((selectedRegion) => selectedRegion !== region)
                : [...field.value, region];

              field.onChange(nextValue);
            };

            return (
              <section className={styles.fieldSection}>
                <div>
                  <h2 className={styles.fieldTitle}>
                    서비스 가능 지역{" "}
                    <span className={styles.requiredMark}>
                      * <span className={styles.selectionGuide}> 복수 선택 가능</span>
                    </span>
                  </h2>

                  {fieldState.error && (
                    <p className={styles.errorMessage}>{fieldState.error.message}</p>
                  )}
                </div>

                <div className={`${styles.chipGroup} ${styles.serviceChipGroup}`}>
                  <FilterChip
                    label="전국"
                    selected={isNationwideSelected}
                    onClick={handleNationwideToggle}
                    className={styles.profileChip}
                  />

                  {REGION_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={!isNationwideSelected && field.value.includes(option.value)}
                      onClick={() => handleRegionToggle(option.value)}
                      className={styles.profileChip}
                    />
                  ))}
                </div>
              </section>
            );
          }}
        />

        <Button type="submit" disabled={isSubmitting || !isValid} className={styles.submitButton}>
          저장하기
        </Button>
      </form>
    </section>
  );
}
