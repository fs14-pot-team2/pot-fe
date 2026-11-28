import { isAxiosError } from "axios";

export function getReviewErrorCode(error: unknown) {
  return isAxiosError<{ code?: string }>(error) ? error.response?.data?.code : undefined;
}

type ReviewErrorPolicy = {
  refresh: "none" | "owner" | "owner-and-sitter";
  blockSubmit: boolean;
};

export function getReviewErrorPolicy(code: string | undefined): ReviewErrorPolicy {
  switch (code) {
    case "REVIEW_ALREADY_EXISTS":
    case "REVIEW_ALREADY_DELETED":
    case "REVIEW_NOT_FOUND":
      return { refresh: "owner-and-sitter", blockSubmit: true };

    case "CARE_REQUEST_NOT_FOUND":
      return { refresh: "owner", blockSubmit: true };

    case "REVIEW_NOT_WRITABLE":
      return { refresh: "owner", blockSubmit: false };

    default:
      return { refresh: "none", blockSubmit: false };
  }
}
