# Phase 05 Report — Wallets & Transfer Minh Restyle

## Files Modified

| File | Lines | Action |
|---|---|---|
| `src/components/wallets/wallet-card.tsx` | 108 | Rewritten — Minh design |
| `src/pages/wallet/WalletsPage.tsx` | 205 | Rewritten — Minh design |
| `src/components/wallets/wallet-swap-card.tsx` | 137 | Created |
| `src/components/wallets/quick-amount-chips.tsx` | 46 | Created |
| `src/pages/wallet/TransferPage.tsx` | 276 | Rewritten — Minh design |
| `src/i18n/vi.ts` | +19 keys | wallet.* + transfer.* sections |
| `src/i18n/en.ts` | +19 keys | wallet.* + transfer.* sections |

## Components Changed / Created

### wallet-card.tsx (rewritten)
- Mobile: flex row with 3px left accent stripe (`border-l-[3px]`, `style={{ borderLeftColor: accent }}`), icon chip (40×40 rounded-xl, wallet-color bg tint), name/type label, balance right-aligned in `text-negative` when < 0
- Desktop (`lg:`): card with 3px top accent (`border-t-[3px]`), icon chip, type label, name, balance (21px/800 weight), hover-reveal Edit button
- Fallback color map updated: CASH→green, BANK→primary blue, E_WALLET→pink, POSTPAID/CREDIT→violet
- Both mobile/desktop renderers are parallel divs in one component (no duplicated logic)

### WalletsPage.tsx (rewritten)
- Hero card `WalletHeroCard`: `bg-primary rounded-xl` with total available balance (excludes POSTPAID/CREDIT types), active wallet count, inline desktop asset/debt stats (two frosted `bg-white/[0.13]` tiles)
- Action row: `bg-primary-soft text-primary` for "Chuyển tiền", outline `border-line` for "+ Thêm ví"
- Section label `text-[11px] font-extrabold uppercase` before wallet list
- Mobile: vertical `space-y-2` list; Desktop: 3-col grid + `AddWalletTile` (dashed border, primary text)
- All data hooks and CRUD flows preserved unchanged

### wallet-swap-card.tsx (new)
- `WalletPickerCard` — shows label (TỪ VÍ / ĐẾN VÍ), wallet icon chip with accent, name/type/balance, or empty state placeholder
- `WalletSwapCard` — stacks From card → 10px gap with overlapping swap button → To card
- Swap button: `bg-primary text-primary-ink border-[3px] border-bg rounded-xl` centered via `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10`
- Rotation: `useState<boolean>(rotated)` toggles `rotate-0 / rotate-180` CSS class via `transition: transform 0.2s ease` — purely visual, swap logic lives in parent via `onSwap` prop
- `aria-label={t('transfer.swapWalletsAria')}` on swap button (a11y)

### quick-amount-chips.tsx (new)
- Chips: 1tr/2tr/5tr/10tr (vi) / 1M/2M/5M/10M (en)
- Active chip: `bg-primary text-primary-ink`; inactive: `bg-surface border-line text-sub hover:bg-hover`
- All chips: `min-h-[44px] px-4 rounded-full` — WCAG 2.5.5 touch target
- `aria-pressed` on each button; `role="group" aria-label` on container

### TransferPage.tsx (rewritten, 276 lines)
- Back-header: icon button `← ` + subtitle/title (mobile sub-page pattern)
- Wallet selection replaced with `WalletSwapCard` — clicking either card opens `WalletPickerSheet` (BottomSheet). Old inline `WalletRow` list removed.
- `WalletPickerSheet`: BottomSheet wrapping wallet buttons with icon chip + name/type + balance; excludes fromId when picking To, and vice versa
- Amount: centered `text-[42px] font-extrabold text-primary tabular-nums` with `₫` suffix; `formatVndDigits` preserved for display
- Info banner: `bg-primary-soft rounded-xl` with InfoIcon SVG + `t('transfer.infoBanner', { from, to })`
- Confirm button: `h-14 text-[15px] font-extrabold rounded-xl shadow-button` with amount interpolation via `confirmWithAmount` key
- All mutation logic (transfer.mutate, fromId/toId/amount/note state, validation toasts) untouched

## Swap Button Approach
State-only CSS rotation (`rotate-0` / `rotate-180` class toggle on click). The actual swap of `fromId ↔ toId` is handled by parent `TransferPage.handleSwap`. The component is stateless re: wallet selection — it only holds cosmetic rotation state.

## New i18n Keys

### wallet.*
- `totalAvailableBalance`, `activeWalletsCount` (+ _one/_other), `totalAssets`, `creditDebt`
- `transferAction`, `addNewWallet`, `accountsLabel`

### transfer.*
- `swapWalletsAria`, `selectWalletPlaceholder`, `balanceLabel`
- `infoBanner` (interpolated: `{{from}}`, `{{to}}`)
- `quickAmount1m/2m/5m/10m`, `quickAmountsAria`, `confirmWithAmount` (interpolated: `{{amount}}`)

## Verification

- `npm run typecheck` → **PASS** (0 errors)
- `npm run lint` → **PASS** (0 warnings)

## E2E Risk Notes (for Phase 08 QA)

1. **Transfer form fill → submit**: Old flow selected from/to via `WalletRow` buttons with `aria-pressed`. New flow uses `WalletPickerCard` buttons that open a BottomSheet → click wallet row inside. Playwright selectors targeting `aria-pressed` on wallet rows will break. Tests should now target: click the "From wallet" card → wait for BottomSheet → click wallet name inside sheet.
2. **BottomSheet render-inline**: `WalletPickerSheet` uses existing `BottomSheet` component (render inline, no portal). Tests calling `waitFor({ state: 'visible' })` on sheet content remain valid.
3. **Amount input role preserved**: `aria-label={t('transfer.amountAria')}` kept on the amount `<input>` — E2E `getByLabel` still works.
4. **Back button**: Changed from `<Pill ghost>← Back</Pill>` to `<button aria-label={t('common.back')}>←</button>`. Any test targeting the back button by text "← Trở lại" may need updating to use `aria-label`.
5. **Confirm button text**: Now `"Chuyển 5.000.000 ₫"` when amount > 0, vs old fixed `"✓ Xác nhận chuyển tiền"`. E2E selectors using exact text need updating; prefer `getByRole('button', { name: /Chuyển/i })`.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Wallets and Transfer pages restyled to Minh design. Hero card, swap-card, quick-chips, wallet picker sheets all implemented. Typecheck + lint clean.
**Concerns:** TransferPage UX flow changed (wallet picker via BottomSheet instead of inline list). E2E tests for transfer form fill will require selector updates in Phase 08. Flagged specifically above.
