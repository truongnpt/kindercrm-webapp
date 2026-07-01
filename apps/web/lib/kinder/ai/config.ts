import 'server-only';

export function getAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  return {
    apiKey: apiKey || null,
    model,
    isConfigured: Boolean(apiKey),
  };
}

/** Rough token estimate for credit metering (1 credit ≈ 100 chars). */
export function estimateCredits(text: string) {
  return Math.max(1, Math.ceil(text.length / 100));
}
