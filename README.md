# Cloudflare Clef Fast Wrapper

High-throughput, resilient client wrapper for Cloudflare Workers AI edge models featuring three-state circuit breakers, token bucket rate limiting, and exponential backoff retry mechanisms.

[![CI](https://github.com/FelipeMadson/cloudflare-clef-fast-wrapper/actions/workflows/ci.yml/badge.svg)](https://github.com/FelipeMadson/cloudflare-clef-fast-wrapper/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*Read this in [Português](README.pt-BR.md).*

---

## Key Features

- **Three-State Circuit Breaker**: Closed, Open, and Half-Open states preventing cascading failures during upstream edge outages.
- **Token Bucket Rate Limiter**: High-precision token replenishment preventing HTTP 429 penalties.
- **Autonomous Jittered Retry**: Configurable exponential backoff with decorrelated jitter.
- **Streaming Support**: Zero-copy response pipeline for high-token inference workloads.

---

## Usage

```typescript
import { ClefClient, CircuitBreaker } from './src/index.ts';

const client = new ClefClient({
  accountId: 'cf_acc_100',
  apiToken: 'cf_tok_xyz',
  rateLimitRps: 50,
  failureThreshold: 5
});

const response = await client.infer({
  prompt: 'Classify this log message',
  temperature: 0.2
});
```

## License

MIT © [Felipe Madson](https://github.com/FelipeMadson)
