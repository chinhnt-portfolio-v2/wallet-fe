import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { AddTxFormBody } from '@/components/transactions/add-tx-form-body'
import { useIsSm } from '@/hooks/use-media-query'
import { ymdToInstant, todayYmd } from '@/lib/date-utils'
import type { TxnType, CreateTransactionRequest, NlpParseResult } from '@/types'

function addDays(days: number): string {
  const d = new Date(); d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // ── Form state (logic unchanged from pre-restyle) ──
  const [txType, setTxType] = useState<TxnType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayYmd())
  const [advancedOverride, setAdvancedOverride] = useState<boolean | null>(null)
  const [createDebt, setCreateDebt] = useState(false)
  const [debtTitleInput, setDebtTitleInput] = useState('')
  const [debtDueDate, setDebtDueDate] = useState(addDays(30))
  const [debtCounterparty, setDebtCounterparty] = useState('')
  const [nlpResult, setNlpResult] = useState<NlpParseResult | null>(null)

  const { data: wallets = [], isLoading: loadingWallets } = useWallets()
  const { data: categories = [] } = useCategories()
  const createTx = useCreateTransaction()

  const filteredCategories = categories.filter((c) => c.type === txType)
  const selectedWallet = wallets.find((w) => w.id === walletId)
  const isPostpaid = selectedWallet?.type === 'POSTPAID'
  const isExpenseOnPostpaid = txType === 'EXPENSE' && isPostpaid
  const showAdvanced = advancedOverride ?? isPostpaid
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const debtTitleDefault = isExpenseOnPostpaid && selectedCategory
    ? t('transaction.defaultPurchaseTitle', { name: selectedCategory.name }) : ''
  const debtTitle = debtTitleInput || debtTitleDefault

  const handleSubmit = () => {
    if (!walletId || !amount) { toast.error(t('transaction.selectWalletAndAmount')); return }
    const payload: CreateTransactionRequest = {
      walletId, amount: parseFloat(amount), type: txType,
      categoryId: categoryId ?? undefined, note: note || undefined, date: ymdToInstant(date),
    }
    if (isExpenseOnPostpaid && createDebt) {
      payload.groupTitle = debtTitle || t('transaction.defaultDebtTitle', { date: new Date().toLocaleDateString('vi-VN') })
      payload.groupDueDate = ymdToInstant(debtDueDate)
      payload.groupCounterparty = debtCounterparty || undefined
    }
    createTx.mutate(payload, {
      onSuccess: (res) => {
        toast.success(t('transaction.added'))
        if (res.group) {
          toast.success(t('transaction.debtGroupCreated'), { action: { label: t('transaction.viewNow'), onClick: () => navigate(`/debts/${res.group.id}`) } })
          navigate(`/debts/${res.group.id}`)
        } else { navigate('/') }
      },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleNlpConfirm = (req: CreateTransactionRequest) => {
    createTx.mutate(req, {
      onSuccess: (res) => { toast.success(t('transaction.added')); setNlpResult(null); navigate(res.group ? `/debts/${res.group.id}` : '/') },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleNlpEdit = (prefill: Partial<CreateTransactionRequest>) => {
    if (prefill.walletId != null) setWalletId(prefill.walletId)
    if (prefill.categoryId != null) setCategoryId(prefill.categoryId)
    if (prefill.amount != null) setAmount(String(prefill.amount))
    if (prefill.type) setTxType(prefill.type)
    if (prefill.note) setNote(prefill.note)
    setNlpResult(null); setAdvancedOverride(true)
  }

  const formProps = {
    txType, onTypeChange: (v: TxnType) => { setTxType(v); if (v !== 'EXPENSE') setCreateDebt(false); setCategoryId(null) },
    amount, onAmountChange: setAmount,
    walletId, onWalletSelect: setWalletId, wallets, loadingWallets,
    categoryId, onCategorySelect: setCategoryId, filteredCategories,
    note, onNoteChange: setNote, date, onDateChange: setDate,
    showAdvanced: showAdvanced ?? false, onToggleAdvanced: () => setAdvancedOverride(!showAdvanced),
    isExpenseOnPostpaid: isExpenseOnPostpaid ?? false,
    createDebt, onDebtToggle: () => setCreateDebt(!createDebt),
    debtTitle, onDebtTitleChange: setDebtTitleInput,
    debtDueDate, onDebtDueDateChange: setDebtDueDate,
    debtCounterparty, onDebtCounterpartyChange: setDebtCounterparty,
    nlpResult, onNlpResult: setNlpResult,
    onNlpConfirm: handleNlpConfirm, onNlpEdit: handleNlpEdit, onNlpDismiss: () => setNlpResult(null),
    allCategories: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, type: c.type })),
  }

  const isDesktop = useIsSm()

  const saveBtn = (dense?: boolean) => (
    <button type="button" onClick={handleSubmit}
      disabled={createTx.isPending || !walletId || !amount}
      className={`${dense ? 'flex-1 h-10 text-[12px]' : 'w-full h-[50px] text-[13px]'} rounded-xl bg-primary text-primary-ink font-bold tracking-[0.08em] hover:bg-primary-hover transition-colors shadow-button disabled:opacity-40 disabled:cursor-not-allowed`}>
      {createTx.isPending ? t('common.saving') : txType === 'EXPENSE' ? t('transaction.saveExpense') : t('transaction.saveIncome')}
    </button>
  )

  if (isDesktop) {
    return (
      /* ── Desktop modal (780px centered over scrim) ── */
      <div className="flex fixed inset-0 z-30 items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => navigate(-1)} aria-hidden="true" />
        <div className="relative w-full max-w-[780px] max-h-[90vh] flex flex-col bg-surface rounded-xl shadow-modal overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">{t('transaction.quickLog')}</p>
              <h1 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink leading-tight">{t('transaction.logTransaction')}</h1>
            </div>
            <button onClick={() => navigate(-1)} aria-label={t('common.back')}
              className="w-8 h-8 rounded-lg border border-line bg-surface-2 text-muted flex items-center justify-center hover:bg-hover transition-colors">
              <X size={14} />
            </button>
          </div>
          {/* Scrollable body — single AddTxFormBody instance */}
          <div className="overflow-y-auto px-6 py-5 flex-1">
            <AddTxFormBody {...formProps} />
          </div>
          {/* Footer */}
          <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-line">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 h-10 rounded-lg border border-line bg-surface text-sub text-[12px] font-semibold hover:bg-hover transition-colors">
              {t('common.cancel')}
            </button>
            {saveBtn(true)}
          </div>
        </div>
      </div>
    )
  }

  return (
    /* ── Mobile page ── */
    <div className="page-enter pb-28 space-y-0">
      <div className="flex items-start justify-between pb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">{t('transaction.quickLog')}</p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">{t('transaction.logTransaction')}</h1>
        </div>
        <button onClick={() => navigate(-1)} aria-label={t('common.back')}
          className="w-8 h-8 rounded-lg border border-line bg-surface text-muted flex items-center justify-center hover:bg-hover transition-colors mt-1">
          <X size={14} />
        </button>
      </div>
      {/* Single AddTxFormBody instance */}
      <AddTxFormBody {...formProps} />
      {/* Sticky save — pb-28 on wrapper clears the bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-bg/90 backdrop-blur-sm border-t border-line px-4 pt-3 pb-6">
        {saveBtn()}
      </div>
    </div>
  )
}
