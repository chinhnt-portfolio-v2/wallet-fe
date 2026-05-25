import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { WALLET_TYPE_LABEL } from '@/lib/utils'
import { NlpInputBar } from '@/components/nlp/nlp-input-bar'
import { NlpConfirmationCard } from '@/components/nlp/nlp-confirmation-card'
import {
  DisplayAmount,
  SectionLabel,
  CategoryChip,
  Pill,
} from '@/design-system'
import type { TxnType, CreateTransactionRequest, NlpParseResult } from '@/types'

// Helper: today's date + N days as YYYY-MM-DD
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
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
  const [txType, setTxType] = useState<TxnType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // BNPL debt creation fields
  const [createDebt, setCreateDebt] = useState(false)
  const [debtTitle, setDebtTitle] = useState('')
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

  // F3: BNPL Auto-Expand — when POSTPAID wallet is selected, auto-expand the advanced section
  useEffect(() => {
    if (isPostpaid) {
      setShowAdvanced(true)
    }
  }, [isPostpaid])

  useEffect(() => {
    if (isExpenseOnPostpaid && selectedCategory && !debtTitle) {
      setDebtTitle(`Mua hàng: ${selectedCategory.name}`)
    }
  }, [isExpenseOnPostpaid, selectedCategory, debtTitle])

  const handleSubmit = () => {
    if (!walletId || !amount) {
      toast.error('Chọn ví và nhập số tiền')
      return
    }

    const payload: CreateTransactionRequest = {
      walletId,
      amount: parseFloat(amount),
      type: txType,
      categoryId: categoryId ?? undefined,
      note: note || undefined,
    }

    // If expense on POSTPAID wallet and user opted to create BNPL debt
    if (isExpenseOnPostpaid && createDebt) {
      payload.groupTitle = debtTitle || `Mua trả sau ${new Date().toLocaleDateString('vi-VN')}`
      payload.groupDueDate = debtDueDate || undefined
      payload.groupCounterparty = debtCounterparty || undefined
    }

    createTx.mutate(payload, {
      onSuccess: (res) => {
        toast.success('Đã thêm giao dịch!')
        if (res.group) {
          toast.success('Đã tạo nhóm nợ trả sau!', {
            action: {
              label: 'Xem ngay',
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

  return (
    <div className="space-y-5 pb-8">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">
            ◇ Quick log
          </div>
          <h2 className="font-display italic text-[28px] leading-none text-primary">
            Log a transaction
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
                toast.success('Đã thêm giao dịch!')
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
            setShowAdvanced(true)
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
            or enter manually
          </span>
        </div>
      </div>

      {/* ── Type tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface rounded-[10px] p-[3px] border border-border">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTxType(t)
              if (t !== 'EXPENSE') setCreateDebt(false)
              setCategoryId(null)
            }}
            className={`flex-1 h-[34px] rounded-[8px] border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              txType === t
                ? 'bg-surface-3 text-primary shadow-[inset_0_0_0_1px_var(--color-border-hi)]'
                : 'bg-transparent text-muted hover:text-primary'
            }`}
          >
            {t === 'EXPENSE' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {/* ── Amount display (serif italic hero) ───────────────────────── */}
      <div className="py-2 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-3">Amount</div>
        <div className="flex items-baseline justify-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className={`w-full max-w-xs h-14 px-4 rounded-[var(--radius-md)] border bg-surface text-primary font-mono text-3xl outline-none tabular-nums transition-colors ${
              amountNum > 0 ? 'border-accent/60 focus:border-accent' : 'border-border focus:border-border-hi'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}
          />
          <span className="font-mono text-sm text-muted shrink-0">VND</span>
        </div>
        {amountNum > 0 && (
          <div className="mt-3 flex justify-center">
            <DisplayAmount value={amountNum} size={42} />
          </div>
        )}
      </div>

      {/* ── Category strip (horizontal scroll, expense only) ─────────── */}
      {txType === 'EXPENSE' && (
        <div>
          <SectionLabel className="mb-3">Category</SectionLabel>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-0" style={{ scrollbarWidth: 'none' }}>
            {filteredCategories.map((c) => {
              const sel = categoryId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(sel ? null : c.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-[12px] border transition-colors min-w-[70px] ${
                    sel
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface hover:border-border-hi'
                  }`}
                >
                  <CategoryChip
                    cat={c.name.toLowerCase()}
                    name={c.name}
                    size={22}
                  />
                  <span className={`font-mono text-[9px] uppercase tracking-[0.05em] ${
                    sel ? 'text-primary' : 'text-muted'
                  }`}>
                    {c.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Wallet selector ──────────────────────────────────────────── */}
      <div>
        <SectionLabel className="mb-3">From wallet</SectionLabel>
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
                  aria-label={`Chọn ví ${w.name}`}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-[10px] border transition-colors font-sans text-xs ${
                    sel
                      ? 'border-border-hi bg-surface-3 text-primary'
                      : 'border-border bg-surface text-secondary hover:border-border-hi'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-[2px] shrink-0"
                    style={{ background: w.color }}
                  />
                  <span>{w.name}</span>
                  <span className="font-mono text-[10px] text-muted">
                    {WALLET_TYPE_LABEL[w.type] ?? w.type}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="font-sans text-sm text-muted">No wallets yet.</p>
            <a href="/wallets" className="font-mono text-[11px] text-accent hover:underline mt-1 block">
              Create wallet →
            </a>
          </Card>
        )}
      </div>

      {/* ── Advanced toggle ───────────────────────────────────────────── */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent hover:underline"
      >
        {showAdvanced ? '▲ Collapse' : '▼ More details'}
      </button>

      {showAdvanced && (
        <div className="space-y-4 border-t border-border pt-4">
          {/* date */}
          <Field label="Date">
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
            label="Merchant / note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={txType === 'INCOME' ? 'e.g. Salary, freelance, gift…' : 'e.g. Pizza 4Ps, Grab, rent…'}
          />

          {/* income category strip */}
          {txType === 'INCOME' && filteredCategories.length > 0 && (
            <Field label="Category">
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
                    ◈ BNPL debt tracking
                  </p>
                  <p className="font-sans text-xs text-muted mt-1">
                    Create a debt group to track this buy-now-pay-later purchase
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={createDebt}
                  aria-label="Ghi nhận nợ trả sau"
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
                    label="Tên khoản nợ"
                    value={debtTitle}
                    onChange={(e) => setDebtTitle(e.target.value)}
                    placeholder="VD: Mua trả sau tháng 3"
                  />
                  <Input
                    label="Ngày hết hạn"
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    hint="Mặc định: 30 ngày sau"
                  />
                  <Input
                    label="Đơn vị / người bán (tùy chọn)"
                    value={debtCounterparty}
                    onChange={(e) => setDebtCounterparty(e.target.value)}
                    placeholder="VD: Shopee, MoMo, Lazada…"
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
            Postpaid wallet — enable{' '}
            <strong className="font-mono text-[11px] text-negative uppercase tracking-[0.06em]">BNPL tracking</strong>
            {' '}above to create a debt group and track payments on time.
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
          {createTx.isPending ? 'Saving…' : `Save ${txType === 'EXPENSE' ? 'expense' : 'income'} →`}
        </Pill>
      </div>
    </div>
  )
}
