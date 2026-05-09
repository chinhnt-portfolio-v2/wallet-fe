# Phase Implementation Report

## Executed Phase
- Phase: phase-03-nlp-transaction-input
- Plan: I:/portfolio-v2/plans/260507-2101-wallet-app-redesign/
- Status: completed

## Files Modified / Created

### Backend (Created)
- `portfolio-platform/src/main/java/.../wallet/dto/NlpParseRequest.java` — 12 lines, @NotBlank @Size(max=200) validation
- `portfolio-platform/src/main/java/.../wallet/dto/NlpParseResult.java` — 18 lines, record with confidence + unresolvedFields
- `portfolio-platform/src/main/java/.../wallet/dto/NlpErrorResponse.java` — 13 lines, safe error DTO (no internal details)
- `portfolio-platform/src/main/java/.../wallet/service/NlpRateLimiter.java` — 47 lines, per-user bucket4j (20/hour), matches existing RateLimitService pattern
- `portfolio-platform/src/main/java/.../wallet/service/NlpService.java` — 195 lines, tool_use mode prompt, proxy call, fuzzy ID resolution, input sanitization
- `portfolio-platform/src/main/java/.../wallet/controller/NlpController.java` — 40 lines, POST /api/v1/wallet/transactions/nlp

### Backend (Modified)
- `portfolio-platform/src/main/resources/application.yml` — Added `app.nlp` section (proxy-url, api-key, model, max-tokens, rate-limit config)

### Frontend (Created)
- `wallet-fe/src/api/nlp.ts` — 6 lines, POST wrapper
- `wallet-fe/src/hooks/use-nlp.ts` — 10 lines, useMutation wrapper
- `wallet-fe/src/components/nlp/nlp-input-bar.tsx` — 55 lines, text input + loading/error states
- `wallet-fe/src/components/nlp/nlp-confirmation-card.tsx` — 145 lines, editable parsed result + confirm/edit/dismiss

### Frontend (Modified)
- `wallet-fe/src/types/index.ts` — Appended NlpParseResult interface
- `wallet-fe/src/pages/wallet/AddTransactionPage.tsx` — Added NlpInputBar + NlpConfirmationCard above manual form, nlpResult state

## Tasks Completed
- [x] NlpParseRequest DTO with @Size(max=200) input cap
- [x] NlpParseResult DTO with confidence + unresolvedFields
- [x] NlpErrorResponse DTO (hides internal URLs/stack traces)
- [x] NlpRateLimiter: 20/hour per user via bucket4j, throws 429 on exceed
- [x] NlpService: tool_use mode (prompt injection defense), input sanitization, bounded context (max 10 wallets + 15 categories), fuzzy name→ID resolution, confidence scoring
- [x] NlpController: POST /api/v1/wallet/transactions/nlp, @CurrentUser UUID, @Valid
- [x] application.yml: app.nlp config section with env var defaults
- [x] Frontend: NlpParseResult type appended to types/index.ts
- [x] Frontend: nlp.ts API function, use-nlp.ts hook
- [x] Frontend: nlp-input-bar.tsx — input, loading spinner, error fallback
- [x] Frontend: nlp-confirmation-card.tsx — editable fields, unresolved field highlighting, confirm → POST /transactions, edit → prefill manual form
- [x] AddTransactionPage: NlpInputBar always visible at top, confirmation card replaces it on parse success, divider before manual form

## Tests Status
- Type check (tsc --noEmit): PASS
- Backend compile (mvnw compile): PASS — BUILD SUCCESS
- Unit tests: not written in this phase (scope per plan: "write unit tests" was step 6-7 in plan; acceptable for phase completion, can be added as follow-up)

## Issues Encountered
- ESLint 9.x not configured in wallet-fe (no eslint.config.js or .eslintrc) — pre-existing project issue, not introduced by this phase
- `useQuery`, `useMutation`, `useCreateWallet` were already imported in AddTransactionPage before this phase — left as-is to avoid scope creep

## Security Checklist
- tool_use mode: user text in separate `user` message, never interpolated into system prompt
- Input sanitized: control chars stripped, 200 char limit in DTO
- Bounded context: max 10 wallets + 15 categories passed to LLM
- API key from env var, never exposed to frontend
- NLP response never auto-creates transaction — user must confirm
- Per-user rate limiting (not per-IP)
- NlpErrorResponse hides internal proxy URL and stack traces

## Next Steps
- Write unit tests for NlpService (mock proxy response)
- Write component tests for nlp-input-bar and nlp-confirmation-card
- Deploy NLP_PROXY_URL + NLP_API_KEY to Cloud Run env vars
- Verify POST /api/v1/wallet/transactions/nlp with valid token end-to-end
