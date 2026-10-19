export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRatePerMs: number;

  constructor(tokensPerSecond = 50, capacity = 50) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRatePerMs = tokensPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRatePerMs);
      this.lastRefill = now;
    }
  }

  tryAcquire(count = 1): boolean {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}
