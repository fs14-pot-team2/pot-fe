"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import CareTypeSelector, {
  type CareType,
} from "@/features/care-requests/owner/components/CareTypeSelector/CareTypeSelector";

import AddressSearch, {
  type SelectedAddress,
} from "@/features/care-requests/owner/components/AddressSearch/AddressSearch";

import CareDatePicker, {
  formatDate,
  getTodayKST,
  parseDate,
} from "@/features/care-requests/owner/components/CareDatePicker/CareDatePicker";

import {
  useActiveCareRequest,
  useCreateCareRequest,
} from "@/features/care-requests/owner/hooks/useCareRequests";

import type { CreateCareRequestInput } from "@/features/care-requests/owner/types/careRequest";

import styles from "./page.module.css";

type DateFieldType = "start" | "end";

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

type AddressFields = SelectedAddress & {
  zonecode?: string;
  zipNo?: string;
  sido?: string;
  siNm?: string;
  sigungu?: string;
  sggNm?: string;
  bname?: string;
  emdNm?: string;
};

function getApiError(error: unknown): ApiErrorResponse {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return {
      code: error.response?.data?.code,
      message: error.response?.data?.message,
    };
  }

  return {};
}

export default function NewCareRequestPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // 활성 돌봄 요청 조회
  const {
    data: activeRequestData,
    isLoading: isCheckingActiveRequest,
    isError: isActiveRequestError,
    isFetching: isFetchingActiveRequest,
    error: activeRequestError,
    refetch: refetchActiveRequest,
  } = useActiveCareRequest();

  // 돌봄 요청 등록
  const { mutateAsync: createCareRequest, isPending: isCreating } = useCreateCareRequest();

  // 돌봄 방식
  const [careType, setCareType] = useState<CareType | null>(null);

  // 돌봄 일정
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 날짜 선택 모달
  const [activeDateField, setActiveDateField] = useState<DateFieldType | null>(null);

  // 종료일 초기화 안내
  const [showDateResetNotice, setShowDateResetNotice] = useState(false);

  // 주소 검색 모달
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 선택한 주소
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);

  // 상세 주소
  const [detailAddress, setDetailAddress] = useState("");

  // 한국 시간 기준 내일부터 돌봄 시작 가능
  const minStartDate = getTodayKST();
  minStartDate.setDate(minStartDate.getDate() + 1);

  // 종료일은 시작일과 같거나 이후
  const minEndDate = startDate ? parseDate(startDate) : minStartDate;

  // 버튼 활성화는 입력값 기준으로만 판단
  const isFormComplete =
    careType !== null &&
    startDate !== "" &&
    endDate !== "" &&
    startDate > formatDate(getTodayKST()) &&
    endDate >= startDate &&
    selectedAddress !== null;

  // 주소 정보 확인
  const getAddressFields = (selected: SelectedAddress) => {
    const address = selected as AddressFields;

    return {
      zonecode: address.zonecode ?? address.zipNo ?? "",
      address: address.address,
      sido: address.sido ?? address.siNm ?? "",
      sigungu: address.sigungu ?? address.sggNm ?? "",
      bname: address.bname ?? address.emdNm ?? "",
    };
  };

  // 날짜 모달이 닫힌 뒤 Toast 표시
  useEffect(() => {
    if (!showDateResetNotice || activeDateField !== null) {
      return;
    }

    showToast({
      message: "시작일이 변경되어 종료일을 다시 선택해 주세요.",
      duration: 4000,
    });
  }, [showDateResetNotice, activeDateField, showToast]);

  // 날짜 선택 모달 열기
  const handleOpenDatePicker = (field: DateFieldType) => {
    if (field === "end" && !startDate) return;

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

  // 주소 검색 모달 열기
  const handleOpenAddressSearch = () => {
    setIsAddressModalOpen(true);
  };

  // 주소 선택 완료
  const handleAddressSelect = (address: SelectedAddress) => {
    setSelectedAddress(address);
    setDetailAddress("");
    setIsAddressModalOpen(false);
  };

  // 필수값 유효성 검사
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

    return true;
  };

  // 돌봄 요청 등록
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreating || !isFormComplete) {
      return;
    }

    if (!validateForm() || !selectedAddress || !careType) {
      return;
    }

    // 조회 상태 확인 중에는 등록하지 않음
    if (isCheckingActiveRequest || isFetchingActiveRequest) {
      showToast({
        message: "돌봄 요청 상태를 확인하고 있어요. 다시 시도해 주세요.",
      });
      return;
    }

    // 인증 오류나 조회 실패 시 POST 요청 차단
    if (isActiveRequestError || !activeRequestData) {
      const isUnauthorized =
        isAxiosError(activeRequestError) && activeRequestError.response?.status === 401;

      showToast({
        message: isUnauthorized
          ? "로그인 인증이 완료되면 돌봄 요청을 등록할 수 있어요."
          : "돌봄 요청 상태를 확인할 수 없어 등록이 제한됩니다.",
      });

      return;
    }

    // 활성 요청 중복 방지
    if (activeRequestData.hasActiveCareRequest) {
      showToast({
        message: "이미 진행 중인 돌봄 요청이 있습니다.",
      });
      return;
    }

    const address = getAddressFields(selectedAddress);

    if (
      !/^\d{5}$/.test(address.zonecode) ||
      !address.address?.trim() ||
      !address.sido.trim() ||
      !address.sigungu.trim()
    ) {
      showToast({
        message: "주소 정보가 올바르지 않습니다. 주소를 다시 검색해 주세요.",
      });
      return;
    }

    const requestBody: CreateCareRequestInput = {
      serviceType: careType,
      startDate,
      endDate,
      zonecode: address.zonecode,
      address: address.address,
      detailAddress: detailAddress.trim() || null,
      sido: address.sido,
      sigungu: address.sigungu,
      bname: address.bname.trim() || null,
    };

    try {
      await createCareRequest(requestBody);

      showToast({
        message: "돌봄 요청이 등록되었습니다.",
      });

      // 실제 프로젝트 라우트와 최종 확인 필요
      router.push("/owner/quotes");
    } catch (error) {
      const { code, message } = getApiError(error);

      if (code === "ACTIVE_CARE_REQUEST_ALREADY_EXISTS") {
        showToast({
          message: "이미 진행 중인 돌봄 요청이 있습니다.",
        });

        await refetchActiveRequest();
        return;
      }

      if (code === "INVALID_CARE_DATE") {
        showToast({
          message: "돌봄 일정이 올바르지 않습니다. 날짜를 다시 확인해 주세요.",
        });
        return;
      }

      if (code === "INVALID_SERVICE_TYPE") {
        showToast({
          message: "돌봄 방식을 다시 선택해 주세요.",
        });
        return;
      }

      if (code === "INVALID_REGION") {
        showToast({
          message: "선택한 지역을 확인할 수 없습니다. 주소를 다시 검색해 주세요.",
        });
        return;
      }

      if (code === "INVALID_REQUEST") {
        showToast({
          message: "입력 정보를 확인해 주세요.",
        });
        return;
      }

      if (isAxiosError(error) && error.response?.status === 401) {
        showToast({
          message: "로그인 상태를 확인해 주세요.",
        });
        return;
      }

      if (isAxiosError(error) && error.response?.status === 403) {
        showToast({
          message: "팟오너 계정으로만 돌봄 요청을 등록할 수 있습니다.",
        });
        return;
      }

      showToast({
        message: message || "돌봄 요청을 등록하지 못했습니다. 다시 시도해 주세요.",
      });
    }
  };

  // 최초 활성 요청 조회 중
  if (isCheckingActiveRequest) {
    return (
      <main className={styles.main}>
        <div className="container">
          <div className={styles.careRequestWrap}>
            <section className={styles.feedbackSection}>
              <h1 className={styles.title}>돌봄 요청을 확인하고 있어요</h1>
              <p className={styles.description}>잠시만 기다려 주세요.</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  // 기존 활성 돌봄 요청이 있을 때
  if (activeRequestData?.hasActiveCareRequest) {
    return (
      <main className={styles.main}>
        <div className="container">
          <div className={styles.careRequestWrap}>
            <section className={styles.feedbackSection}>
              <h1 className={styles.title}>이미 진행 중인 돌봄 요청이 있어요</h1>

              <p className={styles.description}>
                한 번에 하나의 돌봄 요청만 등록할 수 있어요.
                <br />
                진행 중인 돌봄 요청을 확인해 주세요.
              </p>

              <Button
                variant="solid"
                size="md"
                className={styles.actionButton}
                onClick={() => router.push("/owner/quotes")}
              >
                요청한 견적 현황 보기
              </Button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  // 인증 오류 또는 조회 실패 시에도 폼 표시
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.careRequestWrap}>
          <header className={styles.header}>
            <h1 className={styles.title}>돌봄 방식, 일정과 지역을 선택해주세요</h1>

            <p className={styles.description}>돌봄 요청에 필요한 정보를 입력해 주세요.</p>
          </header>

          {isActiveRequestError && (
            <p role="alert" className={styles.apiNotice}>
              현재 인증 또는 요청 상태를 확인할 수 없어 등록은 제한됩니다. 입력 화면은 이용할 수
              있어요.
            </p>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* 돌봄 방식 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>돌봄 방식</h2>

              <CareTypeSelector value={careType} onChange={setCareType} />
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
                      aria-label={
                        startDate
                          ? `돌봄 시작일 ${startDate}, 다시 선택하기`
                          : "돌봄 시작일 선택하기"
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
                      disabled={!startDate}
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
                      onClick={handleOpenAddressSearch}
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
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 등록 버튼 */}
            <div className={styles.submitArea}>
              <Button
                type="submit"
                variant="solid"
                size="md"
                className={styles.submitButton}
                disabled={!isFormComplete || isCreating}
              >
                {isCreating ? "돌봄 요청 등록 중..." : "돌봄 요청하기"}
              </Button>
            </div>
          </form>
        </div>
      </div>

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
    </main>
  );
}
