import { useState, type FormEvent } from 'react'
import type { NlpParseResult } from '@/types'
import { useNlp } from '@/hooks/use-nlp'

interface NlpInputBarProps {
  onResult: (result: NlpParseResult) => void
}

export function NlpInputBar({ onResult }: NlpInputBarProps) {
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
        Nhập nhanh bằng ngôn ngữ tự nhiên
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={nlp.isPending}
          placeholder="VD: cafe 50k hom qua vi momo"
          maxLength={200}
          aria-label="Nhập mô tả giao dịch"
          className="input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Phân tích"
          className="btn-primary px-4 py-2 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nlp.isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
          ) : (
            '✨ Phân tích'
          )}
        </button>
      </form>

      {nlp.isError && (
        <p role="alert" className="text-xs text-negative">
          {nlp.error?.message === 'Thao tác quá nhanh. Vui lòng chở một chút rồi thử lại.'
            ? 'Bạn đã dùng quá giới hạn phân tích. Vui lòng thử lại sau.'
            : 'Không thể phân tích, vui lòng nhập thủ công.'}
        </p>
      )}
    </div>
  )
}
