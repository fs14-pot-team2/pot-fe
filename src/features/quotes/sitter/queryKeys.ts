import type { SentQuotesParams } from "./types/sentQuote";

export const sitterQuoteKeys = {
  all: ["quotes", "sitter"] as const,

  sent: () => [...sitterQuoteKeys.all, "sent"] as const,

  sentList: (params: SentQuotesParams) => [...sitterQuoteKeys.sent(), params] as const,

  detail: (quoteId: string) => [...sitterQuoteKeys.all, "detail", quoteId] as const,
};
