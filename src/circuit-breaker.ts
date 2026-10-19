import type { CircuitState } from './types.ts';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly cooldownPeriodMs: number;

  constructor(threshold = 5, cooldownPeriodMs = 10000) {
    this.threshold = threshold;
    this.cooldownPeriodMs = cooldownPeriodMs;
  }

  getState(): CircuitState {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  canExecute(): boolean {
    const s = this.getState();
    return s === 'CLOSED' || s === 'HALF_OPEN';
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
