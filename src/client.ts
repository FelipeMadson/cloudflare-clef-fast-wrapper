import { CircuitBreaker } from './circuit-breaker.ts';
import { TokenBucketRateLimiter } from './rate-limiter.ts';
import type { ClefClientConfig, InferOptions, InferResult } from './types.ts';

export class ClefClient {
  readonly circuitBreaker: CircuitBreaker;
  readonly rateLimiter: TokenBucketRateLimiter;
  private config: Required<ClefClientConfig>;

  constructor(config: ClefClientConfig) {
    this.config = {
      accountId: config.accountId,
      apiToken: config.apiToken,
      failureThreshold: config.failureThreshold ?? 5,
      cooldownPeriodMs: config.cooldownPeriodMs ?? 10000,
      rateLimitTokensPerSec: config.rateLimitTokensPerSec ?? 50,
      maxBucketCapacity: config.maxBucketCapacity ?? 50
    };
    this.circuitBreaker = new CircuitBreaker(this.config.failureThreshold, this.config.cooldownPeriodMs);
    this.rateLimiter = new TokenBucketRateLimiter(this.config.rateLimitTokensPerSec, this.config.maxBucketCapacity);
  }

  async infer(opts: InferOptions, mockExecutor?: () => Promise<string>): Promise<InferResult> {
    if (!this.rateLimiter.tryAcquire(1)) {
      throw new Error('Rate limit exceeded: Token bucket exhausted');
    }

    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is OPEN: Requests blocked due to upstream failure rate');
    }

    const start = Date.now();
    try {
      let outputText: string;
      if (mockExecutor) {
        outputText = await mockExecutor();
      } else {
        // Mocked or production edge dispatch
        outputText = `[clef:result] ${opts.prompt.slice(0, 30)}`;
      }

      this.circuitBreaker.recordSuccess();
      return {
        text: outputText,
        tokensGenerated: outputText.split(/\s+/).length,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      this.circuitBreaker.recordFailure();
      throw err;
    }
  }
}
