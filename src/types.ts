export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ClefClientConfig {
  accountId: string;
  apiToken: string;
  failureThreshold?: number;
  cooldownPeriodMs?: number;
  rateLimitTokensPerSec?: number;
  maxBucketCapacity?: number;
}

export interface InferOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface InferResult {
  text: string;
  tokensGenerated: number;
  latencyMs: number;
}
