import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, Sparkles } from 'lucide-react'
import type { NlpParseResult } from '@/types'
import { useNlp } from '@/hooks/use-nlp'

interface NlpInputBarProps {
  onResult: (result: NlpParseResult) => void
}

/**
 * NLP quick-entry card (Minh design).
 * bg-primary-soft card, free-text input + mic icon → AI parse on submit.
 */
export function NlpInputBar({ onResult }: NlpInputBarProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const nlp = useNlp()

  const canSubmit = text.trim().length > 0 && text.length <= 200 && !nlp.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    nlp.mutate(text.trim(), {
      onSuccess: (result) => {
        onResult(result)
        setText('')
      },
    })
  }

  return (
    <div className="bg-primary-soft rounded-xl p-4 border border-primary/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-primary shrink-0" aria-hidden="true" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-primary">
          {t('nlp.label')}
        </span>
      </div>

      {/* Input + actions */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 bg-surface rounded-lg px-3 h-10 border border-line focus-within:border-primary transition-colors">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={nlp.isPending}
            placeholder={t('nlp.placeholder')}
            maxLength={200}
            aria-label={t('nlp.inputAria')}
            className="flex-1 bg-transparent border-none text-ink text-sm font-medium outline-none min-w-0 placeholder:text-muted"
          />
          {/* Mic icon — visual affordance only */}
          <Mic
            size={14}
            className="text-muted shrink-0"
            aria-hidden="true"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label={t('nlp.analyze')}
          className="h-10 px-4 rounded-lg bg-primary text-primary-ink text-[12px] font-semibold shrink-0 hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-button"
        >
          {nlp.isPending ? (
            <span
              className="inline-block w-4 h-4 border-2 border-primary-ink/30 border-t-primary-ink rounded-full animate-spin"
              aria-hidden="true"
            />
          ) : (
            t('nlp.analyze')
          )}
        </button>
      </form>

      {nlp.isError && (
        <p role="alert" className="mt-2 text-[11px] text-negative">
          {nlp.error?.message === 'Thao tác quá nhanh. Vui lòng chở một chút rồi thử lại.'
            ? t('nlp.rateLimit')
            : t('nlp.parseError')}
        </p>
      )}
    </div>
  )
}
