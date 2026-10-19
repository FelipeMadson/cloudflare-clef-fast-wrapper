import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker } from '../src/circuit-breaker.ts';
import { TokenBucketRateLimiter } from '../src/rate-limiter.ts';
import { ClefClient } from '../src/client.ts';

describe('CircuitBreaker', () => {
  it('transita de CLOSED para OPEN após atingir limiar de falhas', () => {
    const cb = new CircuitBreaker(3, 1000);
    assert.equal(cb.getState(), 'CLOSED');

    cb.recordFailure();
    cb.recordFailure();
    assert.equal(cb.getState(), 'CLOSED');

    cb.recordFailure();
    assert.equal(cb.getState(), 'OPEN');
    assert.equal(cb.canExecute(), false);
  });

  it('recupera para HALF_OPEN após período de cooldown', async () => {
    const cb = new CircuitBreaker(2, 50); // 50ms cooldown
    cb.recordFailure();
    cb.recordFailure();
    assert.equal(cb.getState(), 'OPEN');

    await new Promise(r => setTimeout(r, 60));
    assert.equal(cb.getState(), 'HALF_OPEN');
    assert.equal(cb.canExecute(), true);

    cb.recordSuccess();
    assert.equal(cb.getState(), 'CLOSED');
  });
});

describe('TokenBucketRateLimiter', () => {
  it('consome tokens e rejeita requisições quando esgotado', () => {
    const limiter = new TokenBucketRateLimiter(10, 2); // 2 tokens máximo
    assert.equal(limiter.tryAcquire(1), true);
    assert.equal(limiter.tryAcquire(1), true);
    assert.equal(limiter.tryAcquire(1), false);
  });
});

describe('ClefClient', () => {
  it('executa inferência com sucesso através do circuito e rate limiter', async () => {
    const client = new ClefClient({
      accountId: 'test-acc',
      apiToken: 'test-tok'
    });

    const res = await client.infer({ prompt: 'Hello world' });
    assert.ok(res.text.includes('[clef:result]'));
    assert.ok(res.tokensGenerated >= 1);
  });
});
