// Owner registration form state (UI) → POST /v1/auth/owner/register body (guide §2.6).
import type { components } from '@/api/types'
import { DEFAULT_TIMEZONE } from '@/utils/dates'

export interface OwnerRegisterFormState {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  businessName: string
  categoryId: string | null
  timezone: string
  acceptsPrivacy: boolean
}

export function emptyOwnerRegisterForm(): OwnerRegisterFormState {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    categoryId: null,
    timezone: DEFAULT_TIMEZONE,
    acceptsPrivacy: false,
  }
}

export function toOwnerRegisterBody(f: OwnerRegisterFormState): components['schemas']['OwnerRegisterDto'] {
  const lastName = f.lastName.trim()

  return {
    firstName: f.firstName.trim(),
    ...(lastName ? { lastName } : {}),
    email: f.email.trim(),
    password: f.password,
    phone: f.phone.trim(),
    business: {
      name: f.businessName.trim(),
      categoryId: f.categoryId ?? '',
      timezone: f.timezone,
    },
  }
}
