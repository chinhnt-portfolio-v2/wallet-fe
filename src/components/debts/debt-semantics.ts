import type { GroupType } from '@/types'

/**
 * Debt direction semantics (audit §2.4 — correctness-adjacent fix).
 *
 * Receivables (LOAN_GIVEN = money lent out, owed TO you) must render positive /
 * green with a "Collect" action, NOT negative / red with "Pay". Everything else
 * (DEBT / BNPL / PURCHASE_CREDIT) is a payable: money you owe, red, "Pay".
 *
 * Drive all colour + action-label decisions off `groupType` here so the rule has
 * a single source of truth (never infer from sign/colour at call sites).
 */
export type DebtDirection = 'payable' | 'receivable'

export function debtDirection(groupType: GroupType): DebtDirection {
  return groupType === 'LOAN_GIVEN' ? 'receivable' : 'payable'
}

export function isReceivable(groupType: GroupType): boolean {
  return debtDirection(groupType) === 'receivable'
}

/** CSS var for the amount/accent colour: green for receivables, red for payables. */
export function debtAmountColor(groupType: GroupType): string {
  return isReceivable(groupType) ? 'var(--positive)' : 'var(--negative)'
}

/** i18n key for the list/CTA action label: "Collect" vs "Pay". */
export function debtActionKey(groupType: GroupType): string {
  return isReceivable(groupType) ? 'debt.collect' : 'debt.pay'
}

/** i18n key for the settle CTA on the detail page: "Collect debt" vs "Pay debt". */
export function debtSettleKey(groupType: GroupType): string {
  return isReceivable(groupType) ? 'debt.collectDebt' : 'debt.payDebt'
}
