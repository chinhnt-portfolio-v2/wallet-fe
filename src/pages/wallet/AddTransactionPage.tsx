import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { NlpInputBar } from '@/components/nlp/nlp-input-bar'
import { NlpConfirmationCard } from '@/components/nlp/nlp-confirmation-card'
import {
  DisplayAmount,
  SectionLabel,
  CategoryChip,
  Pill,
} from '@/design-system'
import { formatVndDigits } from '@/lib/utils'
import { ymdToInstant, todayYmd } from '@/lib/date-utils'
import type { TxnType, CreateTransactionRequest, NlpParseResult } from '@/types'

// Helper: today's date + N days as YYYY-MM-DD (local calendar day).
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Strip non-digits so state holds the raw integer string (no separators).
function toRawDigits(input: string): string {
  return input.replace(/\D/g, '')
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AddTransactionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [txType, setTxType] = useState<TxnType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayYmd())
  // Tri-state advanced toggle: null = follow auto rule (open for postpaid),
  // true/false = explicit user choice. Avoids a setState-in-effect.
  const [advancedOverride, setAdvancedOverride] = useState<boolean | null>(null)

  // BNPL debt creation fields. `debtTitleInput` holds the user's edits;
  // the effective title falls back to a category-derived default (derived
  // during render, not via a setState effect).
  const [createDebt, setCreateDebt] = useState(false)
  const [debtTitleInput, setDebtTitleInput] = useState('')
  const [debtDueDate, setDebtDueDate] = useState(addDays(30))
  const [debtCounterparty, setDebtCounterparty] = useState('')

  const [nlpResult, setNlpResult] = useState<NlpParseResult | null>(null)

  const { data: wallets, isLoading: loadingWallets } = useWallets()
  const { data: categories } = useCategories()
  const createTx = useCreateTransaction()

  const filteredCategories = categories?.filter((c) => c.type === txType) ?? []

  // Selected wallet info
  const selectedWallet = wallets?.find((w) => w.id === walletId)
  const isPostpaid = selectedWallet?.type === 'POSTPAID'
  const isExpenseOnPostpaid = txType === 'EXPENSE' && isPostpaid

  const selectedCategory = categories?.find((c) => c.id === categoryId)

  // F3: BNPL Auto-Expand — open advanced for POSTPAID unless the user overrode it.
  const showAdvanced = advancedOverride ?? isPostpaid

  // Default debt title derived from the selected category; the user's typed
  // value (debtTitleInput) takes precedence once entered.
  const debtTitleDefault =
    isExpenseOnPostpaid && selectedCategory
      ? t('transaction.defaultPurchaseTitle', { name: selectedCategory.name })
      : ''
  const debtTitle = debtTitleInput || debtTitleDefault

  const handleSubmit = () => {
    if (!walletId || !amount) {
      toast.error(t('transaction.selectWalletAndAmount'))
      return
    }

    const payload: CreateTransactionRequest = {
      walletId,
      amount: parseFloat(amount),
      type: txType,
      categoryId: categoryId ?? undefined,
      note: note || undefined,
      // F1: send the user-selected date as an ISO instant so the chosen day is kept.
      date: ymdToInstant(date),
    }

    // If expense on POSTPAID wallet and user opted to create BNPL debt
    if (isExpenseOnPostpaid && createDebt) {
      payload.groupTitle = debtTitle || t('transaction.defaultDebtTitle', { date: new Date().toLocaleDateString('vi-VN') })
      // F3: BNPL due date as ISO instant for a consistent contract.
      payload.groupDueDate = ymdToInstant(debtDueDate)
      payload.groupCounterparty = debtCounterparty || undefined
    }

    createTx.mutate(payload, {
      onSuccess: (res) => {
        toast.success(t('transaction.added'))
        if (res.group) {
          toast.success(t('transaction.debtGroupCreated'), {
            action: {
              label: t('transaction.viewNow'),
              onClick: () => navigate(`/debts/${res.group.id}`),
            },
          })
          navigate(`/debts/${res.group.id}`)
        } else {
          navigate('/')
        }
      },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const amountNum = parseFloat(amount) || 0
  // Display the raw digits with vi-VN thousands separators while keeping `amount`
  // as a bare digit string in state (so parseFloat / payload stays clean).
  const amountDisplay = amount ? formatVndDigits(amountNum) : ''

  return (
    <div className="page-enter space-y-5 pb-8">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">
            ◇ {t('transaction.quickLog')}
          </div>
          <h2 className="font-display italic text-[28px] leading-none text-primary">
            {t('transaction.logTransaction')}
          </h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-[8px] border border-border bg-surface text-secondary flex items-center justify-center font-mono text-sm hover:bg-surface-2 transition-colors mt-1"
        >
          ✕
        </button>
      </div>

      {/* ── NLP input ────────────────────────────────────────────────── */}
      {!nlpResult ? (
        <NlpInputBar onResult={setNlpResult} />
      ) : (
        <NlpConfirmationCard
          result={nlpResult}
          wallets={wallets ?? []}
          categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name, icon: c.icon, type: c.type }))}
          onConfirm={(req) => {
            createTx.mutate(req, {
              onSuccess: (res) => {
                toast.success(t('transaction.added'))
                setNlpResult(null)
                if (res.group) {
                  navigate(`/debts/${res.group.id}`)
                } else {
                  navigate('/')
                }
              },
              onError: (err: Error) => toast.error(err.message),
            })
          }}
          onEdit={(prefill) => {
            if (prefill.walletId != null) setWalletId(prefill.walletId)
            if (prefill.categoryId != null) setCategoryId(prefill.categoryId)
            if (prefill.amount != null) setAmount(String(prefill.amount))
            if (prefill.type) setTxType(prefill.type)
            if (prefill.note) setNote(prefill.note)
            setNlpResult(null)
            setAdvancedOverride(true)
          }}
          onDismiss={() => setNlpResult(null)}
        />
      )}

      {/* divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg px-2 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            {t('transaction.enterManually')}
          </span>
        </div>
      </div>

      {/* ── Type tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface rounded-[10px] p-[3px] border border-border">
        {(['EXPENSE', 'INCOME'] as const).map((tt) => (
          <button
            key={tt}
            onClick={() => {
              setTxType(tt)
              if (tt !== 'EXPENSE') setCreateDebt(false)
              setCategoryId(null)
            }}
            className={`flex-1 h-[34px] rounded-[8px] border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              txType === tt
                ? 'bg-surface-3 text-primary shadow-[inset_0_0_0_1px_var(--color-border-hi)]'
                : 'bg-transparent text-muted hover:text-primary'
            }`}
          >
            {t(tt === 'EXPENSE' ? 'transaction.expense' : 'transaction.income')}
          </button>
        ))}
      </div>

      {/* ── Amount input (serif numeral hero, like Transfer) ─────────── */}
      <div className="py-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-3 text-center">{t('transaction.amountLabel')}</div>
        <div className="relative mx-auto max-w-sm bg-surface border border-border rounded-[var(--radius-md)] overflow-hidden focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/20 transition-all">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amountDisplay}
            onChange={(e) => setAmount(toRawDigits(e.target.value))}
            placeholder="0"
            autoFocus
            aria-label={t('transaction.amountAria')}
            className="w-full bg-transparent px-4 pt-4 pb-3 font-numeral italic text-[40px] leading-none text-primary text-center outline-none pr-16 placeholder:text-muted/40"
          />
          <span className="absolute right-4 bottom-4 font-mono text-[11px] uppercase tracking-widest text-muted">
            VND
          </span>
        </div>
        {amountNum > 0 && (
          <div className="mt-3 flex justify-center">
            <DisplayAmount value={amountNum} size={28} />
          </div>
        )}
      </div>

      {/* ── Category chips (wrap, full names, expense only) ──────────── */}
      {txType === 'EXPENSE' && (
        <div>
          <SectionLabel className="mb-3">{t('transaction.category')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map((c) => {
              const sel = categoryId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(sel ? null : c.id)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-[12px] border transition-colors ${
                    sel
                      ? 'border-accent bg-accent/10 text-primary'
                      : 'border-border bg-surface text-secondary hover:border-border-hi'
                  }`}
                >
                  <CategoryChip
                    cat={c.name.toLowerCase()}
                    name={c.name}
                    size={22}
                  />
                  <span className="font-sans text-xs max-w-[10rem] truncate">
                    {c.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Wallet selector ──────────────────────────────────────────── */}
      <div>
        <SectionLabel className="mb-3">{t('transaction.fromWallet')}</SectionLabel>
        {loadingWallets ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-32 h-12 rounded-[10px] bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : wallets && wallets.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {wallets.map((w) => {
              const sel = walletId === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => setWalletId(w.id)}
                  aria-pressed={sel}
                  aria-label={t('wallet.selectWalletAria', { name: w.name })}
                  className={`min-h-[44px] flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-[10px] border transition-colors font-sans text-xs ${
                    sel
                      ? 'border-accent bg-accent/10 text-primary ring-1 ring-accent/20'
                      : 'border-border bg-surface text-secondary hover:border-border-hi'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                    style={{ background: w.color }}
                  />
                  <span className="font-medium">{w.name}</span>
                  <span className="font-mono text-[10px] text-muted">
                    {t(`wallet.types.${w.type}`)}
                  </span>
                  {sel && <span className="font-mono text-[11px] text-accent" aria-hidden="true">✓</span>}
                </button>
              )
            })}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="font-sans text-sm text-muted">{t('transaction.noWalletLink')}</p>
            <a href="/wallets" className="font-mono text-[11px] text-accent hover:underline mt-1 block">
              {t('transaction.createWalletLink')} →
            </a>
          </Card>
        )}
      </div>

      {/* ── Advanced toggle ───────────────────────────────────────────── */}
      <button
        onClick={() => setAdvancedOverride(!showAdvanced)}
        className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent hover:underline"
      >
        {showAdvanced ? `▲ ${t('transaction.collapse')}` : `▼ ${t('transaction.moreDetails')}`}
      </button>

      {showAdvanced && (
        <div className="space-y-4 border-t border-border pt-4">
          {/* date */}
          <Field label={t('transaction.date')}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-bg-2 text-primary font-mono text-sm outline-none focus:border-border-hi"
              style={{ colorScheme: 'dark' }}
            />
          </Field>

          {/* note */}
          <Input
            label={t('transaction.merchantNote')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={txType === 'INCOME' ? t('transaction.notePlaceholderIncome') : t('transaction.notePlaceholderExpense')}
          />

          {/* income category strip */}
          {txType === 'INCOME' && filteredCategories.length > 0 && (
            <Field label={t('transaction.category')}>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((c) => {
                  const sel = categoryId === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategoryId(sel ? null : c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border transition-colors text-xs ${
                        sel
                          ? 'border-accent bg-accent/10 text-primary'
                          : 'border-border bg-surface text-secondary hover:border-border-hi'
                      }`}
                    >
                      <CategoryChip cat={c.name.toLowerCase()} name={c.name} size={18} />
                      <span className="font-sans">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          {/* BNPL Debt toggle — shown only for EXPENSE on POSTPAID wallet */}
          {isExpenseOnPostpaid && (
            <div className="border border-negative/30 bg-negative/5 rounded-[var(--radius-md)] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-negative">
                    ◈ {t('transaction.bnplTracking')}
                  </p>
                  <p className="font-sans text-xs text-muted mt-1">
                    {t('transaction.bnplCreateGroup')}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={createDebt}
                  aria-label={t('transaction.bnplToggleAria')}
                  onClick={() => setCreateDebt(!createDebt)}
                  className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                    createDebt ? 'bg-negative' : 'bg-border'
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    createDebt ? 'right-1' : 'left-1'
                  }`} aria-hidden="true" />
                </button>
              </div>

              {createDebt && (
                <div className="space-y-2">
                  <Input
                    label={t('transaction.debtTitle')}
                    value={debtTitle}
                    onChange={(e) => setDebtTitleInput(e.target.value)}
                    placeholder={t('transaction.debtTitlePlaceholder')}
                  />
                  <Input
                    label={t('transaction.debtDueDate')}
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    hint={t('transaction.debtDueDateHint')}
                  />
                  <Input
                    label={t('transaction.debtCounterparty')}
                    value={debtCounterparty}
                    onChange={(e) => setDebtCounterparty(e.target.value)}
                    placeholder={t('transaction.debtCounterpartyPlaceholder')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BNPL info banner */}
      {isExpenseOnPostpaid && (
        <div className="flex items-start gap-2.5 p-3 border border-border rounded-[var(--radius-md)] bg-surface-2">
          <span className="font-mono text-negative text-sm shrink-0">ℹ</span>
          <p className="font-sans text-xs text-muted">
            {t('transaction.bnplInfo')}
          </p>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="pt-1">
        <Pill
          accent
          onClick={handleSubmit}
          disabled={createTx.isPending || !walletId || !amount}
          className="w-full h-[50px] rounded-[var(--radius-md)] text-[13px] tracking-[0.12em] justify-center"
        >
          {createTx.isPending ? t('common.saving') : (txType === 'EXPENSE' ? t('transaction.saveExpense') : t('transaction.saveIncome'))}
        </Pill>
      </div>
    </div>
  )
}
