"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";

import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import CareTypeSelector from "@/features/care-requests/owner/components/CareTypeSelector/CareTypeSelector";

import AddressSearch, {
  type SelectedAddress,
} from "@/features/care-requests/owner/components/AddressSearch/AddressSearch";

import CareDatePicker, {
  formatDate,
  getTodayKST,
  parseDate,
} from "@/features/care-requests/owner/components/CareDatePicker/CareDatePicker";

import type { CreateCareRequestInput } from "@/features/care-requests/owner/types/careRequest";

import styles from "./CareRequestForm.module.css";

type DateFieldType = "start" | "end";

export interface CareRequestFormProps {
  mode: "create" | "edit";
  initialValues?: CreateCareRequestInput;
  isSubmitting: boolean;
  onSubmit: (values: CreateCareRequestInput) => Promise<void>;
}

export default function CareRequestForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: CareRequestFormProps) {
  const { showToast } = useToast();

  // 돌봄 방식
  const [careType, setCareType] = useState<CreateCareRequestInput["serviceType"] | null>(
    initialValues?.serviceType ?? null,
  );

  // 돌봄 일정
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");

  // 날짜 선택 모달
  const [activeDateField, setActiveDateField] = useState<DateFieldType | null>(null);

  // 종료일 초기화 안내
  const [showDateResetNotice, setShowDateResetNotice] = useState(false);

  // 주소 검색 모달
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 선택한 주소
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(
    initialValues
      ? {
          zonecode: initialValues.zonecode,
          address: initialValues.address,
          sido: initialValues.sido,
          sigungu: initialValues.sigungu,
          bname: initialValues.bname,
        }
      : null,
  );

  // 상세 주소
  const [detailAddress, setDetailAddress] = useState(initialValues?.detailAddress ?? "");

  // 한국 시간 기준 내일부터 돌봄 시작 가능
  const minStartDate = getTodayKST();
  minStartDate.setDate(minStartDate.getDate() + 1);

  // 종료일은 시작일과 같거나 이후
  const minEndDate = startDate ? parseDate(startDate) : minStartDate;

  // 버튼 활성화 조건
  const isFormComplete =
    careType !== null &&
    startDate !== "" &&
    endDate !== "" &&
    startDate > formatDate(getTodayKST()) &&
    endDate >= startDate &&
    selectedAddress !== null;

  // 날짜 선택 모달 닫힌 뒤 안내
  useEffect(() => {
    if (!showDateResetNotice || activeDateField !== null) {
      return;
    }

    showToast({
      message: "시작일이 변경되어 종료일을 다시 선택해 주세요.",
      duration: 4000,
    });
  }, [showDateResetNotice, activeDateField, showToast]);

  // 날짜 모달 열기
  const handleOpenDatePicker = (field: DateFieldType) => {
    if (field === "end" && !startDate) {
      return;
    }

    setShowDateResetNotice(false);
    setActiveDateField(field);
  };

  // 날짜 선택 완료
  const handleDateSelect = (date: string) => {
    if (activeDateField === "start") {
      const shouldResetEndDate = Boolean(endDate && date > endDate);

      setStartDate(date);

      if (shouldResetEndDate) {
        setEndDate("");
        setShowDateResetNotice(true);
      }
    }

    if (activeDateField === "end") {
      setEndDate(date);
    }

    setActiveDateField(null);
  };

  // 주소 선택 완료
  const handleAddressSelect = (address: SelectedAddress) => {
    setSelectedAddress(address);
    setDetailAddress("");
    setIsAddressModalOpen(false);
  };

  // 입력값 유효성 검사
  const validateForm = (): boolean => {
    if (!careType) {
      showToast({
        message: "돌봄 방식을 선택해 주세요.",
      });
      return false;
    }

    if (!startDate) {
      showToast({
        message: "돌봄 시작일을 선택해 주세요.",
      });
      return false;
    }

    if (!endDate) {
      showToast({
        message: "돌봄 종료일을 선택해 주세요.",
      });
      return false;
    }

    const today = formatDate(getTodayKST());

    if (startDate <= today) {
      showToast({
        message: "돌봄 시작일은 오늘 이후로 선택해 주세요.",
      });
      return false;
    }

    if (endDate < startDate) {
      showToast({
        message: "돌봄 종료일은 시작일보다 빠를 수 없습니다.",
      });
      return false;
    }

    if (!selectedAddress) {
      showToast({
        message: "돌봄 장소를 선택해 주세요.",
      });
      return false;
    }

    if (
      !/^\d{5}$/.test(selectedAddress.zonecode) ||
      !selectedAddress.address.trim() ||
      !selectedAddress.sido.trim()
    ) {
      showToast({
        message: "주소 정보가 올바르지 않습니다. 주소를 다시 검색해 주세요.",
      });
      return false;
    }

    return true;
  };

  // 등록 또는 수정 제출
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    if (!careType || !selectedAddress) {
      return;
    }

    const requestBody: CreateCareRequestInput = {
      serviceType: careType,
      startDate,
      endDate,
      zonecode: selectedAddress.zonecode,
      address: selectedAddress.address,
      detailAddress: detailAddress.trim() || null,
      sido: selectedAddress.sido,
      sigungu: selectedAddress.sigungu,
      bname: selectedAddress.bname?.trim() || null,
    };

    await onSubmit(requestBody);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* 돌봄 방식 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>돌봄 방식</h2>

          <CareTypeSelector value={careType} onChange={setCareType} disabled={isSubmitting} />
        </section>

        {/* 돌봄 일정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>돌봄 일정</h2>

          <div className={styles.dateFields}>
            {/* 시작일 */}
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>돌봄 시작일</span>

              <div className={styles.fieldControl}>
                <button
                  type="button"
                  className={`${styles.fieldTrigger} ${startDate ? styles.fieldSelected : ""}`}
                  onClick={() => handleOpenDatePicker("start")}
                  disabled={isSubmitting}
                  aria-label={
                    startDate ? `돌봄 시작일 ${startDate}, 다시 선택하기` : "돌봄 시작일 선택하기"
                  }
                >
                  <Image
                    src="/icons/ic_datePicker.svg"
                    alt=""
                    width={20}
                    height={20}
                    className={styles.fieldTriggerIcon}
                  />

                  <span>{startDate || "시작일 선택하기"}</span>
                </button>
              </div>
            </div>

            {/* 종료일 */}
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>돌봄 종료일</span>

              <div className={styles.fieldControl}>
                <button
                  type="button"
                  className={`${styles.fieldTrigger} ${endDate ? styles.fieldSelected : ""}`}
                  onClick={() => handleOpenDatePicker("end")}
                  disabled={!startDate || isSubmitting}
                  aria-label={
                    endDate ? `돌봄 종료일 ${endDate}, 다시 선택하기` : "돌봄 종료일 선택하기"
                  }
                >
                  <Image
                    src="/icons/ic_datePicker.svg"
                    alt=""
                    width={20}
                    height={20}
                    className={styles.fieldTriggerIcon}
                  />

                  <span>{endDate || "종료일 선택하기"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 돌봄 장소 */}
        <section className={styles.addressSection}>
          <h2 className={styles.sectionTitle}>돌봄 장소</h2>

          <div className={styles.addressFields}>
            {/* 기본 주소 */}
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>돌봄 장소</span>

              <div className={styles.fieldControl}>
                <button
                  type="button"
                  className={`${styles.fieldTrigger} ${
                    selectedAddress ? styles.fieldSelected : ""
                  }`}
                  onClick={() => setIsAddressModalOpen(true)}
                  disabled={isSubmitting}
                  aria-label={
                    selectedAddress
                      ? `선택한 주소 ${selectedAddress.address}, 다시 선택하기`
                      : "주소 선택하기"
                  }
                >
                  <span>{selectedAddress?.address || "주소 선택하기"}</span>
                </button>
              </div>
            </div>

            {/* 상세 주소 */}
            {selectedAddress && (
              <div className={styles.fieldRow}>
                <label htmlFor="detail-address" className={styles.fieldLabel}>
                  상세 주소
                </label>

                <div className={styles.fieldControl}>
                  <input
                    id="detail-address"
                    type="text"
                    value={detailAddress}
                    onChange={(event) => setDetailAddress(event.target.value)}
                    placeholder="상세 주소를 입력해 주세요."
                    className={styles.detailAddressInput}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 제출 버튼 */}
        <div className={styles.submitArea}>
          <Button
            type="submit"
            variant="solid"
            size="md"
            className={styles.submitButton}
            disabled={!isFormComplete || isSubmitting}
          >
            {isSubmitting
              ? mode === "create"
                ? "돌봄 요청 등록 중..."
                : "돌봄 요청 수정 중..."
              : mode === "create"
                ? "돌봄 요청하기"
                : "돌봄 요청 수정하기"}
          </Button>
        </div>
      </form>

      {/* 날짜 선택 모달 */}
      {activeDateField && (
        <CareDatePicker
          isOpen
          title={activeDateField === "start" ? "돌봄 시작일 선택" : "돌봄 종료일 선택"}
          value={activeDateField === "start" ? startDate || null : endDate || null}
          minDate={activeDateField === "start" ? minStartDate : minEndDate}
          onSelect={handleDateSelect}
          onClose={() => setActiveDateField(null)}
        />
      )}

      {/* 주소 검색 모달 */}
      {isAddressModalOpen && (
        <AddressSearch
          isOpen
          onClose={() => setIsAddressModalOpen(false)}
          onSelect={handleAddressSelect}
        />
      )}
    </>
  );
}
