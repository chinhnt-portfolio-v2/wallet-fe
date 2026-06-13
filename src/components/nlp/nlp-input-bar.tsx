import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { NlpParseResult } from '@/types'
import { useNlp } from '@/hooks/use-nlp'

interface NlpInputBarProps {
  onResult: (result: NlpParseResult) => void
}

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
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-secondary">
        {t('nlp.label')}
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={nlp.isPending}
          placeholder={t('nlp.placeholder')}
          maxLength={200}
          aria-label={t('nlp.inputAria')}
          className="input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label={t('nlp.analyze')}
          className="btn-primary px-4 py-2 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nlp.isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
          ) : (
            `✨ ${t('nlp.analyze')}`
          )}
        </button>
      </form>

      {nlp.isError && (
        <p role="alert" className="text-xs text-negative">
          {nlp.error?.message === 'Thao tác quá nhanh. Vui lòng chở một chút rồi thử lại.'
            ? t('nlp.rateLimit')
            : t('nlp.parseError')}
        </p>
      )}
    </div>
  )
}
