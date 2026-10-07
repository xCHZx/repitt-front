// Icon upload that failed right after creating a card. The create page hands it to the card
// detail page so the owner can retry only the upload (never re-create the card, §4.A.5).
// In-memory only: after a reload the owner can still change the icon from the edit page.
import { shallowRef } from 'vue'
import type { DescribedError } from '@/api/messages'

export interface PendingIconUpload {
  cardId: string

  /** Ready-to-upload file; null when the predefined icon could not be prepared. */
  file: File | null

  /** API error of the failed upload; null when the icon could not be prepared. */
  error: DescribedError | null
}

export const pendingIconUpload = shallowRef<PendingIconUpload | null>(null)
