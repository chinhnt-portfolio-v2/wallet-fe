# Phase 03 — Dashboard Restyle Report

## Files Modified
- `src/pages/wallet/DashboardPage.tsx` — 37 LOC (was 447; now thin compositor)
- `src/components/dashboard/zone-wishlist.tsx` — 75 LOC (restyled: Minh tokens, SectionLabel, emoji removed)

## Files Created
- `src/components/dashboard/use-count-up.ts` — 58 LOC
- `src/components/dashboard/cashflow-chart.tsx` — 119 LOC (Recharts AreaChart)
- `src/components/dashboard/cashflow-card.tsx` — 63 LOC (wraps chart + legend)
- `src/components/dashboard/net-worth-hero.tsx` — 146 LOC (full-bleed primary hero)
- `src/components/dashboard/open-debts.tsx` — 92 LOC
- `src/components/dashboard/budget-alerts.tsx` — 82 LOC
- `src/components/dashboard/recent-transactions.tsx` — 90 LOC

## Tasks Completed
- [x] `use-count-up.ts`: rAF ease-out cubic, mount-once via `hasAnimatedRef`, lazy `useState` init avoids `setState-in-effect` lint error, reduced-motion short-circuits
- [x] `cashflow-chart.tsx`: Recharts `<AreaChart>` + `<ResponsiveContainer>`; two `<linearGradient>` defs (positive/negative, 0.24→0 opacity); `vector-effect: non-scaling-stroke`; `isAnimationActive={!reducedMotion}`; `role="img"` + `aria-label`; custom tooltip
- [x] `net-worth-hero.tsx`: full-bleed `bg-primary rounded-xl`, `text-primary-ink`, count-up animated amount, delta pill `rgba(255,255,255,0.22)`, faint white Sparkline at bottom (opacity-25), triplet (assets/liabilities/receivable) inside hero
- [x] Budget alerts restyled: `ProgressBar` with `color` prop for warning/negative, correct `text-warning`/`text-negative` classes
- [x] Open debts restyled: colored dot indicator (bg-negative/bg-warning), hover rows, Pill actions
- [x] Recent transactions restyled: `CategoryChip` + `hover:bg-hover`, signed amounts with correct colors
- [x] `DashboardPage.tsx`: 37 LOC thin compositor; mobile single-column / desktop `lg:grid-cols-3` (2+1 split)
- [x] `zone-wishlist.tsx`: Minh tokens, `SectionLabel`, priority dots use `bg-negative/bg-warning/bg-positive`, emoji removed

## Chart Approach
- Recharts `<AreaChart>` with `<ResponsiveContainer width="100%" height={120}>`
- Two `<Area>` series: income (`var(--positive)`, 2.2px stroke) + expense (`var(--negative)`, 2px stroke)
- Gradient `id` via `useId()` to avoid SSR collisions; `defs` is native SVG element (not a Recharts import)
- `XAxis` tick-only (no axis line/tick line), muted color, `interval={0}`
- Custom tooltip: `bg-surface border-line rounded-lg shadow-pop`
- `isAnimationActive` driven by `prefers-reduced-motion` check at render time (no hook needed since it's a one-time read)

## Count-up Implementation
- `useState(() => prefersReducedMotion() || target === 0 ? target : 0)` — lazy initialiser avoids `setState-in-effect` lint error
- `useEffect([], [])` mount-only; `hasAnimatedRef` prevents re-run on StrictMode double-invoke
- Second `useEffect([target])` keeps value in sync after first mount without re-animating
- Duration: 800ms ease-out cubic (`1 - (1-t)^3`)

## New i18n Keys
None added — all strings reuse existing keys:
- `dashboard.*` (netWorth, updatedLive, assets, liabilities, receivable, spendChange, cashFlow, sixMonths, openDebts, budgetWatch, recentActivity, overBudget, nearLimit, due)
- `transaction.incomeShort`, `transaction.expenseShort` (used in chart legend)
- `common.viewAll`, `common.retry`

The Recharts `Area name` prop uses internal strings `"Thu"/"Chi"` for Recharts' legend-matching only (not visible i18n copy). The visible legend is rendered by `CashFlowCard` using `t('transaction.incomeShort')` / `t('transaction.expenseShort')`.

## Typecheck + Lint Results
- Our files: **0 errors, 0 warnings** (verified with targeted eslint run on `src/components/dashboard/` + `src/pages/wallet/DashboardPage.tsx`)
- Project-wide: pre-existing errors in `debt-type-picker.tsx`, `debt-edit-modal.tsx` (Phase 06 ownership), `transaction-row.tsx` (Phase 04 ownership), `TransactionsPage.tsx` (Phase 04 ownership) — not caused by this phase

## Phase 08 QA Checklist
- Verify hero count-up runs once on first load; does NOT re-run on tab focus or React StrictMode second mount
- Verify hero is static (shows final value) under `prefers-reduced-motion: reduce`
- Verify cashflow chart renders in both light and dark themes (uses CSS vars, not hex)
- Check `PhoneDash.dc.html` vs mobile render: hero full-bleed blue, triplet inside hero, cashflow area chart below
- Check `DeskDash.dc.html` vs desktop render: `lg:grid-cols-3` with 2/3 main + 1/3 side
- Confirm `dashboard.spec.ts` E2E selectors still resolve — `dashboard.recentActivity`, `dashboard.openDebts`, `dashboard.budgetWatch` section labels are present; `dashboard.cashFlow` as `aria-label` on chart
- Faint sparkline at hero bottom visible in light theme (white opacity-25 over blue)

---

**Status:** DONE
**Summary:** Dashboard restyled to Minh light-first design — full-bleed primary hero with count-up, Recharts AreaChart cashflow, all sub-components extracted to `components/dashboard/` (each <150 LOC), `DashboardPage.tsx` reduced to 37 LOC. Zero errors in owned files.
**Concerns:** None — pre-existing Phase 06/04 errors present in shared typecheck run but are not caused by this phase's changes.
