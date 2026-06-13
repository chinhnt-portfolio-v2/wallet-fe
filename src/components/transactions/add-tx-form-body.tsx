import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { NlpInputBar } from '@/components/nlp/nlp-input-bar'
import { NlpConfirmationCard } from '@/components/nlp/nlp-confirmation-card'
import { CategoryGrid } from '@/components/transactions/category-grid'
import { TxWalletPicker } from '@/components/transactions/tx-wallet-picker'
import { TxBnplForm } from '@/components/transactions/tx-bnpl-form'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { DisplayAmount, SectionLabel } from '@/design-system'
import { formatVndDigits } from '@/lib/utils'
import type { TxnType, NlpParseResult, CreateTransactionRequest, Category, Wallet } from '@/types'

function toRawDigits(s: string) { return s.replace(/\D/g, '') }

interface AddTxFormBodyProps {
  txType: TxnType
  onTypeChange: (t: TxnType) => void
  amount: string
  onAmountChange: (v: string) => void
  walletId: number | null
  onWalletSelect: (id: number) => void
  wallets: Wallet[]
  loadingWallets: boolean
  categoryId: number | null
  onCategorySelect: (id: number | null) => void
  filteredCategories: Category[]
  note: string
  onNoteChange: (v: string) => void
  date: string
  onDateChange: (v: string) => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
  isExpenseOnPostpaid: boolean
  createDebt: boolean
  onDebtToggle: () => void
  debtTitle: string
  onDebtTitleChange: (v: string) => void
  debtDueDate: string
  onDebtDueDateChange: (v: string) => void
  debtCounterparty: string
  onDebtCounterpartyChange: (v: string) => void
  nlpResult: NlpParseResult | null
  onNlpResult: (r: NlpParseResult) => void
  onNlpConfirm: (req: CreateTransactionRequest) => void
  onNlpEdit: (prefill: Partial<CreateTransactionRequest>) => void
  onNlpDismiss: () => void
  allCategories: { id: number; name: string; icon: string; type: string }[]
}

/**
 * Shared form body for AddTransactionPage (used in both mobile page and desktop modal).
 * All state is lifted to the parent page; this component is purely presentational.
 */
export function AddTxFormBody({
  txType, onTypeChange, amount, onAmountChange,
  walletId, onWalletSelect, wallets, loadingWallets,
  categoryId, onCategorySelect, filteredCategories,
  note, onNoteChange, date, onDateChange,
  showAdvanced, onToggleAdvanced,
  isExpenseOnPostpaid, createDebt, onDebtToggle,
  debtTitle, onDebtTitleChange, debtDueDate, onDebtDueDateChange,
  debtCounterparty, onDebtCounterpartyChange,
  nlpResult, onNlpResult, onNlpConfirm, onNlpEdit, onNlpDismiss,
  allCategories,
}: AddTxFormBodyProps) {
  const { t } = useTranslation()
  const amountNum = parseFloat(amount) || 0
  const amountDisplay = amount ? formatVndDigits(amountNum) : ''

  return (
    <div className="space-y-5">
      {/* NLP quick-entry */}
      {!nlpResult ? (
        <NlpInputBar onResult={onNlpResult} />
      ) : (
        <NlpConfirmationCard
          result={nlpResult} wallets={wallets} categories={allCategories}
          onConfirm={onNlpConfirm} onEdit={onNlpEdit} onDismiss={onNlpDismiss}
        />
      )}

      {/* Divider */}
      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
        <div className="relative flex justify-center">
          <span className="bg-bg px-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">
            {t('transaction.enterManually')}
          </span>
        </div>
      </div>

      {/* Type segmented */}
      <SegmentedControl
        size="md" ariaLabel={t('transaction.typeFilter')} value={txType}
        onChange={(v) => onTypeChange(v as TxnType)}
        options={[
          { value: 'EXPENSE', label: t('transaction.expense') },
          { value: 'INCOME', label: t('transaction.income') },
        ]}
        className="w-full"
      />

      {/* Big amount */}
      <div className="py-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-3 text-center">{t('transaction.amountLabel')}</p>
        <div className={`relative mx-auto max-w-sm bg-surface border rounded-xl overflow-hidden transition-all focus-within:ring-1 ${
          txType === 'EXPENSE' ? 'border-negative/30 focus-within:border-negative focus-within:ring-negative/20'
            : 'border-positive/30 focus-within:border-positive focus-within:ring-positive/20'
        }`}>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"
            value={amountDisplay} onChange={(e) => onAmountChange(toRawDigits(e.target.value))}
            placeholder="0" autoFocus aria-label={t('transaction.amountAria')}
            className={`w-full bg-transparent px-4 pt-4 pb-3 text-[40px] tabular-nums leading-none text-center outline-none pr-16 placeholder:text-muted/40 font-extrabold tracking-[-0.025em] ${
              txType === 'EXPENSE' ? 'text-negative' : 'text-positive'
            }`}
          />
          <span className="absolute right-4 bottom-4 text-[11px] uppercase tracking-widest text-muted">VND</span>
        </div>
        {amountNum > 0 && (
          <div className="mt-3 flex justify-center">
            <DisplayAmount value={txType === 'EXPENSE' ? -amountNum : amountNum} size={22} />
          </div>
        )}
      </div>

      {/* Category grid (expense default) */}
      <div>
        <SectionLabel className="mb-3">{t('transaction.category')}</SectionLabel>
        <CategoryGrid categories={filteredCategories} selectedId={categoryId} onSelect={onCategorySelect} ariaLabel={t('transaction.category')} />
      </div>

      {/* Wallet picker */}
      <div>
        <SectionLabel className="mb-3">{t('transaction.fromWallet')}</SectionLabel>
        <TxWalletPicker wallets={wallets} loading={loadingWallets} selectedId={walletId} onSelect={onWalletSelect} />
      </div>

      {/* Advanced toggle */}
      <button type="button" onClick={onToggleAdvanced}
        className="text-[11px] font-semibold uppercase tracking-[0.07em] text-primary hover:underline">
        {showAdvanced ? `▲ ${t('transaction.collapse')}` : `▼ ${t('transaction.moreDetails')}`}
      </button>

      {showAdvanced && (
        <div className="space-y-4 border-t border-line pt-4">
          <div>
            <SectionLabel className="mb-2">{t('transaction.date')}</SectionLabel>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-line bg-surface-2 text-ink text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Input label={t('transaction.merchantNote')} value={note} onChange={(e) => onNoteChange(e.target.value)}
            placeholder={txType === 'INCOME' ? t('transaction.notePlaceholderIncome') : t('transaction.notePlaceholderExpense')}
          />
          {txType === 'INCOME' && filteredCategories.length > 0 && (
            <div>
              <SectionLabel className="mb-2">{t('transaction.category')}</SectionLabel>
              <CategoryGrid categories={filteredCategories} selectedId={categoryId} onSelect={onCategorySelect} ariaLabel={t('transaction.category')} />
            </div>
          )}
          {isExpenseOnPostpaid && (
            <TxBnplForm
              enabled={createDebt} onToggle={onDebtToggle}
              title={debtTitle} onTitleChange={onDebtTitleChange}
              dueDate={debtDueDate} onDueDateChange={onDebtDueDateChange}
              counterparty={debtCounterparty} onCounterpartyChange={onDebtCounterpartyChange}
            />
          )}
        </div>
      )}

      {isExpenseOnPostpaid && (
        <div className="flex items-start gap-2.5 p-3 border border-line rounded-xl bg-surface-2">
          <span className="text-warning text-sm shrink-0" aria-hidden="true">ℹ</span>
          <p className="text-xs font-medium text-muted">{t('transaction.bnplInfo')}</p>
        </div>
      )}
    </div>
  )
}
