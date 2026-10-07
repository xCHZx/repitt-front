// Named aliases over the generated contract types (src/api/v1.d.ts).
// Never hand-write API shapes: add an alias here if a schema is used in more than one place.
import type { components, paths } from './v1'

export type { components, paths }

type Schemas = components['schemas']

export type ApiErrorDto = Schemas['ApiErrorDto']
export type ErrorCode = ApiErrorDto['code']
export type ErrorDetail = Schemas['ErrorDetailDto']

// Auth / session
export type MeDto = Schemas['MeDto']
export type MembershipSummary = Schemas['MembershipSummaryDto']
export type AccessToken = Schemas['AccessTokenDto']
export type AuthSession = Schemas['AuthSessionDto']
export type OtpSession = Schemas['OtpSessionDto']
export type OwnerRegistered = Schemas['OwnerRegisteredDto']
export type Challenge = Schemas['ChallengeDto']
export type Amr = MeDto['amr']

// Businesses
export type Business = Schemas['BusinessWithRoleDto']
export type BusinessRole = Business['role']
export type Entitlement = Schemas['EntitlementDto']
export type EntitlementReason = Entitlement['reason']
export type BusinessAssets = Schemas['BusinessAssetsDto']
export type OpeningHours = Schemas['OpeningHoursDto']
export type OpeningHoursSlot = Schemas['OpeningHoursSlotDto']
export type Category = Schemas['CategoryDto']
export type PublicBusiness = Schemas['PublicBusinessDto']
export type PublicCard = Schemas['PublicCardDto']
export type Member = Schemas['MemberDto']

// Cards
export type StampCard = Schemas['StampCardDto']
export type StampCardStatus = StampCard['status']
export type StampCardCreate = Schemas['StampCardCreateDto']
export type StampCardUpdate = Schemas['StampCardUpdateDto']

// Loyalty / counter
export type Cycle = Schemas['CycleDto']
export type CycleDetail = Schemas['CycleDetailDto']
export type StampResult = Schemas['StampResultDto']
export type StampRequest = Schemas['StampRequestDto']
export type CounterEnroll = Schemas['CounterEnrollDto']
export type CounterEnrollResult = Schemas['CounterEnrollResultDto']
export type RedeemResult = Schemas['RedeemResultDto']
export type VoidResult = Schemas['VoidResultDto']
export type PendingRedemption = Schemas['PendingRedemptionDto']
export type LoyaltyEvent = Schemas['LoyaltyEventDto']
export type LoyaltyEventType = LoyaltyEvent['type']

// CRM / metrics / billing
export type CustomerSummary = Schemas['CustomerSummaryDto']
export type CustomerDetail = Schemas['CustomerDetailDto']
export type Metrics = Schemas['MetricsDto']
export type MetricsPeriod = Metrics['period']
export type Billing = Schemas['BillingDto']

// Visitor
export type MeCard = Schemas['MeCardDto']
export type MeCardDetail = Schemas['MeCardDetailDto']
export type MeActivityEvent = Schemas['MeActivityEventDto']
export type MeBusiness = Schemas['MeBusinessDto']
export type MeExport = Schemas['MeExportDto']
export type PrivacyNotice = Schemas['PrivacyNoticeDto']

/** Cursor page returned by paginated lists (`{ data, page }`). */
export interface CursorPage<T> {
  data: T[]
  page: { nextCursor: string | null; limit: number }
}
