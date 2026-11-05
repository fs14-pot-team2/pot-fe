export const ownerQuoteKeys = {
  all: ["ownerQuotes"] as const,
  detail: (quoteId: string) => [...ownerQuoteKeys.all, "detail", quoteId] as const,
};
