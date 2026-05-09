import { useMutation } from '@tanstack/react-query'
import { parseNlpTransaction } from '@/api/nlp'
import type { NlpParseResult } from '@/types'

export function useNlp() {
  return useMutation<NlpParseResult, Error, string>({
    mutationFn: (text: string) => parseNlpTransaction(text),
  })
}
