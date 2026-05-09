import apiClient from '@/api/client'
import type { NlpParseResult } from '@/types'

export async function parseNlpTransaction(text: string): Promise<NlpParseResult> {
  const response = await apiClient.post<NlpParseResult>('/wallet/transactions/nlp', { text })
  return response.data
}
