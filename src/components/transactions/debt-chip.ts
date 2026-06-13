import type { Transaction } from '@/types'

/**
 * Resolve the i18n key for a debt-linked transaction's chip, or null when the
 * transaction is not linked to a debt group.
 *
 * The label depends on TWO axes — the group direction and the transaction's
 * sub-type — so a debt's principal (the borrow/purchase) is never confused with
 * a repayment:
 *
 *   | group           | principal (PRINCIPAL/INTEREST/null) | payment (PAYMENT/FINAL_PAYMENT) |
 *   | --------------- | ----------------------------------- | ------------------------------- |
 *   | you owe (debt)  | chipDebt   — "Ghi nợ"               | chipPayDebt — "Trả nợ"          |
 *   | you lent (loan) | chipLent   — "Cho vay"              | chipCollect — "Thu nợ"          |
 */
export function debtChipKey(tx: Transaction): string | null {
  if (!tx.groupId) return null

  const isPayment = tx.txnType === 'PAYMENT' || tx.txnType === 'FINAL_PAYMENT'
  const isLoanGiven = tx.group?.groupType === 'LOAN_GIVEN'

  if (isLoanGiven) {
    return isPayment ? 'transaction.chipCollect' : 'transaction.chipLent'
  }
  return isPayment ? 'transaction.chipPayDebt' : 'transaction.chipDebt'
}
