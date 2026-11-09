"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button/Button";
import CareInfo from "@/components/common/CareInfo/CareInfo";
import SocialShare from "@/components/common/SocialShare/SocialShare";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import QuoteStatus from "@/components/ui/QuoteStatus/QuoteStatus";
import Tag from "@/components/ui/Tag/Tag";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import { useQuoteDetail } from "@/features/quotes/owner/hooks/useQuotes";
import type { QuoteDetailResponse } from "@/features/quotes/owner/types/quote";

import styles from "./page.module.css";

const subscribe = () => () => {};

function useShareUrl() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => "",
  );
}

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "견적 정보를 불러오지 못했습니다.";
  }

  const code = error.response?.data?.code;

  switch (code) {
    case "INVALID_ID":
      return "올바르지 않은 견적 번호입니다.";

    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
      return "로그인이 필요합니다.";

    case "QUOTE_ACCESS_FORBIDDEN":
    case "FORBIDDEN":
      return "해당 견적을 조회할 권한이 없습니다.";

    case "QUOTE_NOT_FOUND":
    case "RESOURCE_NOT_FOUND":
      return "견적을 찾을 수 없습니다.";

    case "SITTER_PROFILE_INCONSISTENT":
      return "팟트너 프로필 정보를 확인할 수 없습니다.";

    default:
      return "견적 정보를 불러오지 못했습니다.";
  }
}

function QuoteDetailContent({ data }: { data: QuoteDetailResponse }) {
  const { quote, designatedRequestId, careRequest, sitter } = data;

  const shareUrl = useShareUrl();
  const { showToast } = useToast();

  const isDesignated = designatedRequestId !== null;

  const isConfirmed = careRequest.confirmedQuoteId === quote.id;

  const isWaiting = careRequest.status === "OPEN" && careRequest.confirmedQuoteId === null;

  const quoteStatus: "waiting" | "confirmed" | "expired" | null =
    careRequest.status === "EXPIRED"
      ? "expired"
      : isConfirmed
        ? "confirmed"
        : isWaiting
          ? "waiting"
          : null;

  const handleConfirmQuote = () => {
    showToast({
      message: "견적 확정 기능은 추후 API 연동 예정입니다.",
    });
  };

  return (
    <>
      {/* 올리브색 영역 */}
      <div className={styles.hero} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <div className={styles.layout}>
          <article className={styles.detail}>
            {/* 팟트너 프로필 */}
            <section className={styles.profile} aria-label="팟트너 프로필">
              {/* 지정 견적 요청 + 견적 상태 */}
              <div className={styles.profileTopWrap}>
                <div className={styles.designatedTag}>
                  {isDesignated && <Tag variant="designated" size="md" />}
                </div>

                {quoteStatus && (
                  <div className={styles.quoteStatus}>
                    <QuoteStatus status={quoteStatus} />
                  </div>
                )}
              </div>

              {/* 프로필 이미지 */}
              <div className={styles.avatar}>
                <ProfileImage
                  src={sitter.profileImageUrl}
                  alt={`${sitter.nickname} 프로필 이미지`}
                  sizes="84px"
                />
              </div>

              {/* 한 줄 소개 */}
              <div className={styles.introductionRow}>
                <p className={styles.introduction}>{sitter.shortIntroduction}</p>
              </div>

              {/* 팟트너 정보 */}
              <div className={styles.sitterInfo}>
                {/* 닉네임 + 성별 */}
                <div className={styles.nickname}>
                  <Image
                    src="/icons/ic_sitter.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={styles.partnerIcon}
                  />

                  <strong>{sitter.nickname} 팟트너</strong>

                  <span className={styles.gender}>
                    {sitter.gender === "MALE" ? "남성" : "여성"}
                  </span>
                </div>

                {/* 별점 + 리뷰 + 확정 건수 */}
                <div className={styles.activity}>
                  <span className={styles.rating}>★ {sitter.averageRating.toFixed(1)}</span>

                  <span className={styles.reviewCount}>({sitter.reviewCount})</span>

                  <span className={styles.separator} aria-hidden="true" />

                  <span>확정 {sitter.confirmedQuoteCount}건</span>
                </div>
              </div>
            </section>

            {/* 견적 정보 */}
            <section className={styles.quoteSection}>
              <dl className={styles.priceWrap}>
                <dt>견적가</dt>

                <dd>{quote.price.toLocaleString("ko-KR")}원</dd>
              </dl>

              <div className={styles.comment}>
                <h2>견적 내용</h2>
                <p>{quote.comment}</p>
              </div>
            </section>

            {/* 돌봄 정보 */}
            <div className={styles.careInfo}>
              <CareInfo
                variant="detail"
                createdAt={careRequest.createdAt}
                serviceType={careRequest.serviceType}
                startDate={careRequest.startDate}
                endDate={careRequest.endDate}
                sido={careRequest.sido}
                sigungu={careRequest.sigungu}
                bname={careRequest.bname ?? ""}
                zonecode={careRequest.zonecode}
                address={careRequest.address}
                detailAddress={careRequest.detailAddress}
              />
            </div>
          </article>

          {/* 견적 확정 및 공유하기 */}
          <aside className={styles.shareArea}>
            {/* 대기 중인 견적에만 확정 버튼 표시 */}
            {isWaiting && (
              <div className={styles.confirmArea}>
                <Button
                  variant="solid"
                  size="md"
                  className={styles.confirmButton}
                  onClick={handleConfirmQuote}
                  disabled
                >
                  견적 확정하기
                </Button>
              </div>
            )}

            {shareUrl && (
              <div className={styles.socialShare}>
                <SocialShare url={shareUrl} title="견적서 공유하기" />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

export default function OwnerQuoteDetailPage() {
  const params = useParams<{ quoteId: string }>();
  const quoteId = params.quoteId;

  // 양의 정수 형태의 견적 ID만 허용
  const isValidQuoteId = /^\d+$/.test(quoteId) && BigInt(quoteId) > 0n;

  const { data, isPending, isError, error, refetch } = useQuoteDetail(quoteId);

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.pageHeader}>
          <h1>견적 상세</h1>
        </header>
      </div>

      {/* 잘못된 ID는 로딩 상태보다 먼저 처리 */}
      {!isValidQuoteId ? (
        <div className={`container ${styles.feedback}`} role="alert">
          <p>올바르지 않은 견적 번호입니다.</p>
        </div>
      ) : isPending ? (
        <div className={`container ${styles.feedback}`} role="status">
          <p>견적 정보를 불러오는 중입니다.</p>
        </div>
      ) : isError ? (
        <div className={`container ${styles.feedback}`} role="alert">
          <p>{getErrorMessage(error)}</p>

          <button type="button" onClick={() => void refetch()}>
            다시 시도
          </button>
        </div>
      ) : data ? (
        <QuoteDetailContent data={data} />
      ) : (
        <div className={`container ${styles.feedback}`}>
          <p>견적 정보를 찾을 수 없습니다.</p>
        </div>
      )}
    </main>
  );
}
