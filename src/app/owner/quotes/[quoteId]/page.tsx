"use client";

import { useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import CareInfo from "@/components/common/CareInfo/CareInfo";
import SocialShare from "@/components/common/SocialShare/SocialShare";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import QuoteStatus from "@/components/ui/QuoteStatus/QuoteStatus";
import Tag from "@/components/ui/Tag/Tag";
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
      return "해당 견적을 조회할 권한이 없습니다.";

    case "QUOTE_NOT_FOUND":
      return "견적을 찾을 수 없습니다.";

    default:
      return "견적 정보를 불러오지 못했습니다.";
  }
}

function QuoteDetailContent({ data }: { data: QuoteDetailResponse }) {
  const { quote, careRequest, sitter } = data;

  const shareUrl = useShareUrl();

  const isConfirmed = careRequest.confirmedQuoteId === quote.id;

  const isExpired = careRequest.status === "EXPIRED";

  const location = [careRequest.address, careRequest.detailAddress].filter(Boolean).join(" ");

  return (
    <>
      <div className={styles.hero} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <div className={styles.layout}>
          <article className={styles.detail}>
            <div className={styles.profile}>
              <div className={styles.avatar}>
                <ProfileImage
                  src={sitter.profileImageUrl}
                  alt={`${sitter.nickname} 프로필 이미지`}
                  sizes="96px"
                />
              </div>

              {quote.type === "DESIGNATED" && <Tag variant="designated" />}

              <div className={styles.introductionRow}>
                <p className={styles.introduction}>{sitter.shortIntroduction}</p>

                {isConfirmed && <QuoteStatus status="confirmed" />}

                {isExpired && <QuoteStatus status="expired" />}
              </div>

              <div className={styles.nickname}>
                <span className={styles.partnerIcon}>✿</span>

                <strong>{sitter.nickname} 팟트너</strong>
              </div>

              <div className={styles.activity}>
                <span className={styles.rating}>★ {sitter.averageRating.toFixed(1)}</span>

                <span className={styles.reviewCount}>({sitter.reviewCount})</span>

                <span className={styles.separator} aria-hidden="true" />

                <span>확정 {sitter.confirmedQuoteCount}건</span>
              </div>
            </div>

            <section className={styles.quoteSection}>
              <dl className={styles.priceRow}>
                <dt>견적가</dt>

                <dd>{quote.price.toLocaleString("ko-KR")}원</dd>
              </dl>

              <div className={styles.comment}>
                <h2>견적 내용</h2>

                <p>{quote.comment}</p>
              </div>
            </section>

            <CareInfo
              variant="detail"
              createdAt={careRequest.createdAt}
              serviceType={careRequest.serviceType}
              startDate={careRequest.startDate}
              endDate={careRequest.endDate}
              location={location}
            />
          </article>

          <aside className={styles.shareArea}>
            {shareUrl && <SocialShare url={shareUrl} title="견적서 공유하기" />}
          </aside>
        </div>
      </div>
    </>
  );
}

export default function OwnerQuoteDetailPage() {
  const router = useRouter();

  const params = useParams<{ quoteId: string }>();
  const quoteId = params.quoteId;

  const { data, isPending, isError, error, refetch } = useQuoteDetail(quoteId);

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.pageHeader}>
          <button type="button" className={styles.backButton} onClick={() => router.back()}>
            ← 뒤로가기
          </button>

          <h1>견적 상세</h1>
        </header>
      </div>

      {isPending ? (
        <div className={`container ${styles.feedback}`}>
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
