// Form model for creating / editing a stamp card (guide §4.A.5, §1.4).
// Dates are local `YYYY-MM-DD` in the business zone: the form reads `startsOn`/`endsOn`,
// never `startsAt`/`endsAt`.
import { DEFAULT_CARD_COLOR } from './cardMeta'
import type { StampCard, StampCardCreate, StampCardUpdate } from '@/api/types'

export interface CardFormModel {
  name: string
  reward: string
  description: string
  primaryColor: string
  requiredStamps: number
  cooldownHours: number
  unlimitedCycles: boolean
  maxCycles: number
  startsAt: string
  noEnd: boolean
  endsAt: string
}

export const CARD_LIMITS = {
  name: 80,
  reward: 200,
  description: 500,
  stamps: { min: 1, max: 50 },
  cooldown: { min: 0, max: 168 },
  cycles: { min: 1, max: 100 },
} as const

export function emptyCardForm(today: string): CardFormModel {
  return {
    name: '',
    reward: '',
    description: '',
    primaryColor: DEFAULT_CARD_COLOR,
    requiredStamps: 8,
    cooldownHours: 4,
    unlimitedCycles: true,
    maxCycles: 1,
    startsAt: today,
    noEnd: true,
    endsAt: '',
  }
}

export function cardToForm(card: StampCard): CardFormModel {
  return {
    name: card.name,
    reward: card.reward,
    description: card.description ?? '',
    primaryColor: card.primaryColor || DEFAULT_CARD_COLOR,
    requiredStamps: card.requiredStamps,
    cooldownHours: card.cooldownHours,
    unlimitedCycles: card.maxCycles == null,
    maxCycles: card.maxCycles ?? 1,
    startsAt: card.startsOn,
    noEnd: card.endsOn == null,
    endsAt: card.endsOn ?? '',
  }
}

function normalized(form: CardFormModel) {
  return {
    name: form.name.trim(),
    reward: form.reward.trim(),
    description: form.description.trim() || null,
    primaryColor: form.primaryColor.toUpperCase(),
    requiredStamps: Number(form.requiredStamps),
    cooldownHours: Number(form.cooldownHours),
    maxCycles: form.unlimitedCycles ? null : Number(form.maxCycles),
    startsAt: form.startsAt,
    endsAt: form.noEnd ? null : form.endsAt,
  }
}

export function formToCreateBody(form: CardFormModel): StampCardCreate {
  return normalized(form)
}

/** Only the fields that changed against the card (the backend treats the same date as no change, §4.A.5). */
export function formToUpdateBody(form: CardFormModel, card: StampCard): StampCardUpdate {
  const next = normalized(form)
  const body: StampCardUpdate = {}

  if (next.name !== card.name)
    body.name = next.name
  if (next.reward !== card.reward)
    body.reward = next.reward
  if (next.description !== (card.description ?? null))
    body.description = next.description
  if (next.primaryColor !== card.primaryColor.toUpperCase())
    body.primaryColor = next.primaryColor
  if (next.requiredStamps !== card.requiredStamps)
    body.requiredStamps = next.requiredStamps
  if (next.cooldownHours !== card.cooldownHours)
    body.cooldownHours = next.cooldownHours
  if (next.maxCycles !== (card.maxCycles ?? null))
    body.maxCycles = next.maxCycles
  if (next.startsAt !== card.startsOn)
    body.startsAt = next.startsAt
  if (next.endsAt !== (card.endsOn ?? null))
    body.endsAt = next.endsAt

  return body
}
