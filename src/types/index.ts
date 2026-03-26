// ============================================================
// WALLET APP — TypeScript Types
// ============================================================

export type WalletType = 'CASH' | 'BANK' | 'E_WALLET' | 'POSTPAID'
export type CategoryType = 'INCOME' | 'EXPENSE'
export type GroupType = 'BNPL' | 'DEBT' | 'LOAN_GIVEN' | 'PURCHASE_CREDIT'
export type GroupStatus = 'OPEN' | 'PARTIAL' | 'SETTLED'
export type TxnType = 'INCOME' | 'EXPENSE'
export type TxnSubType = 'PRINCIPAL' | 'PAYMENT' | 'FINAL_PAYMENT' | 'INTEREST'

// ── Wallet ──────────────────────────────────────────────────
export interface Wallet {
  id: number
  userId: string
  name: string
  type: WalletType
  balance: number
  currency: string
  icon: string
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWalletRequest {
  name: string
  type: WalletType
  currency?: string
  icon?: string
  color?: string
}

// ── Category ────────────────────────────────────────────────
export interface Category {
  id: number
  userId: string
  name: string
  icon: string
  color: string
  type: CategoryType
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Debt Group ──────────────────────────────────────────────
export interface DebtGroup {
  id: number
  userId: string
  walletId: number | null
  title: string
  groupType: GroupType
  totalAmount: number
  paidAmount: number
  remaining: number
  currency: string
  status: GroupStatus
  dueDate: string | null
  interestRate: number
  counterparty: string | null
  notes: Record<string, unknown>
  wallet?: { id: number; name: string; icon: string; color: string; type: string }
  createdAt: string
  updatedAt: string
}

export interface CreateDebtGroupRequest {
  title: string
  groupType: GroupType
  totalAmount: number
  walletId?: number
  dueDate?: string
  interestRate?: number
  counterparty?: string
}

export interface SettleDebtRequest {
  amount: number
  walletId: number
  note?: string
}

// ── Transaction ─────────────────────────────────────────────
export interface Transaction {
  id: number
  userId: string
  walletId: number
  categoryId: number | null
  groupId: number | null
  amount: number
  type: TxnType
  txnType: TxnSubType | null
  note: string | null
  date: string
  wallet?: { id: number; name: string; icon: string; color: string; type: string }
  category?: { id: number; name: string; icon: string; color: string }
  group?: { id: number; title: string; groupType: GroupType }
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionRequest {
  walletId: number
  categoryId?: number
  groupId?: number
  amount: number
  type: TxnType
  txnType?: TxnSubType
  note?: string
  date?: string
}

// ── Dashboard ───────────────────────────────────────────────
export interface DashboardSummary {
  totalAssets: number
  totalDebt: number
  totalReceivable: number
  netWorth: number
  currency: string
}

export interface DebtSummary {
  groupId: number
  title: string
  groupType: GroupType
  remaining: number
  dueDate: string | null
  walletName: string
  walletIcon: string
  isOverdue: boolean
}
