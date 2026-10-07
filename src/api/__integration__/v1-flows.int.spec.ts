// Contract smoke test against a LOCAL backend (fake OTP / mail / storage / Stripe providers).
// Runs the main flows through the real endpoint modules of the front.
//
//   BACKEND_LOG=<path to the backend dev log> pnpm test:integration
//
// The OTP codes are read from the backend log ("OTP fake para el reto <id>: <code>", level debug).
// Not part of `pnpm test`. Each run sends ~4 OTPs (backend limit: 20 per IP per hour).
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { configureApiClient, http } from '../client'
import * as auth from '../endpoints/auth'
import * as billing from '../endpoints/billing'
import * as businesses from '../endpoints/businesses'
import * as cards from '../endpoints/cards'
import * as crm from '../endpoints/crm'
import * as loyalty from '../endpoints/loyalty'
import * as me from '../endpoints/me'
import * as pub from '../endpoints/public'
import { ApiError } from '../errors'
import { withIdempotency } from '../idempotency'
import type { Business, MeDto, StampCard } from '../types'

const LOG = process.env.BACKEND_LOG ?? ''
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function otpFor(challengeId: string): Promise<string> {
  for (let i = 0; i < 40; i++) {
    const log = readFileSync(LOG, 'utf8')
    const m = new RegExp(`OTP fake para el reto ${challengeId}: (\\d{6})`).exec(log)
    if (m)
      return m[1]
    await sleep(250)
  }
  throw new Error(`OTP for ${challengeId} not found in ${LOG}`)
}

async function expectApiError(p: Promise<unknown>, code: string, detailCode?: string) {
  const e = await p.then(() => null, err => err)

  expect(e).toBeInstanceOf(ApiError)
  expect((e as ApiError).code, JSON.stringify({ ...(e as ApiError), message: (e as Error).message })).toBe(code)
  if (detailCode)
    expect((e as ApiError).detailCode).toBe(detailCode)

  return e as ApiError
}

const rnd = () => Math.floor(Math.random() * 1e8).toString().padStart(8, '0')

let token: string | null = null
const as = (t: string | null) => {
  token = t
}

const tokens = { owner: '', visitor: '' }
let ownerMe: MeDto
let visitorMe: MeDto
let business: Business
let card: StampCard

beforeAll(() => {
  if (!LOG)
    throw new Error('Set BACKEND_LOG to the backend dev log path')

  // Browsers send Origin; the backend checks it on POST /v1/auth/*
  http.defaults.headers.common.Origin = 'http://localhost:5173'
  configureApiClient({
    getAccessToken: () => token,
    setAccessToken: t => {
      token = t.accessToken
    },
    requestReauth: async () => false,
    canStepUpWithPassword: () => false,
  })
})

describe('v1 contract flows (local backend)', () => {
  it('lists public categories', async () => {
    const list = await pub.listCategories()

    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty('id')
  })

  it('registers an owner with a business in two steps (§2.6)', async () => {
    const [category] = await pub.listCategories()
    const n = rnd()

    const challenge = await auth.ownerRegister({
      email: `qa+${n}@repitt.test`,
      password: 'mi cafecito favorito de la esquina',
      firstName: 'Ana',
      lastName: 'QA',
      phone: `55${n}`,
      business: { name: `Café QA ${n}`, categoryId: category.id, timezone: 'America/Mexico_City' },
    })

    const session = await auth.ownerRegisterVerify({ challengeId: challenge.challengeId, code: await otpFor(challenge.challengeId) })

    expect(session.amr).toBe('pwd')
    expect(session.business?.role).toBe('owner')
    expect(session.business?.entitlement.reason).toBe('pre_trial')

    tokens.owner = session.accessToken
    ownerMe = session.user
    business = session.business as Business
    as(tokens.owner)

    const fresh = await me.getMe()

    expect(fresh.memberships.map(m => m.businessId)).toContain(business.id)
    expect(fresh.qrPayload).toMatch(/^repitt:u:[A-Z2-9]{8}$/)
  })

  it('rejects a wrong owner password with INVALID_CREDENTIALS', async () => {
    as(null)
    await expectApiError(auth.ownerLogin({ email: ownerMe.email ?? 'x@y.z', password: 'incorrecta 123456' }), 'INVALID_CREDENTIALS')
    as(tokens.owner)
  })

  it('lists businesses with role and entitlement (§3.1)', async () => {
    const list = await businesses.listBusinesses()

    expect(list.find(b => b.id === business.id)?.role).toBe('owner')
  })

  it('creates and publishes a card, which starts the trial (§4.A.5)', async () => {
    card = await cards.createCard(business.id, {
      name: 'Café gratis',
      reward: 'Un americano',
      requiredStamps: 2,
      cooldownHours: 0,
      maxCycles: null,
      primaryColor: '#6C3CE1',
    })

    expect(card.status).toBe('draft')
    expect(card.startsOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    const published = await cards.publishCard(business.id, card.id)

    expect(published.status).toBe('published')

    const b = await businesses.getBusiness(business.id)

    expect(b.entitlement.reason).toBe('trial')
    expect(b.entitlement.allowed).toBe(true)
  })

  it('shows the public page by repittCode', async () => {
    const page = await pub.getPublicBusiness(business.repittCode)

    expect(page.cards.map(c => c.id)).toContain(card.id)
    await expectApiError(pub.getPublicBusiness('ZZZZZZZZ'), 'NOT_FOUND')
  })

  it('signs a new visitor in by OTP (§2.5)', async () => {
    as(null)
    const phone = `55${rnd()}`
    const challenge = await auth.otpRequest({ phone })
    const session = await auth.otpVerify({ challengeId: challenge.challengeId, code: await otpFor(challenge.challengeId), firstName: 'Beto' })

    expect(session.isNew).toBe(true)
    expect(session.amr).toBe('otp')
    tokens.visitor = session.accessToken
    visitorMe = session.user
    expect(visitorMe.memberships).toHaveLength(0)
  })

  it('stamps by user QR with an Idempotency-Key, replays with the same key (§1.8, §4.B.2)', async () => {
    as(tokens.owner)

    const body = { code: visitorMe.qrPayload, cardId: card.id }
    const key = crypto.randomUUID()

    const first = await loyalty.stamp(business.id, body, key)

    expect(first.cycle.stampsCount).toBe(1)
    expect(first.customer.displayName).toBeTruthy()

    const replay = await loyalty.stamp(business.id, body, key)

    expect(replay.event.id).toBe(first.event.id)

    // Same key, different (valid) body → 409 IDEMPOTENCY_MISMATCH
    await expectApiError(loyalty.stamp(business.id, { phone: visitorMe.phone ?? '', cardId: card.id }, key), 'IDEMPOTENCY_MISMATCH')
  })

  it('maps scanner errors (§4.B.2)', async () => {
    await expectApiError(withIdempotency(k => loyalty.stamp(business.id, { code: 'ABC-DEF-GHI', cardId: card.id }, k)), 'INVALID_QR', 'invalidFormat')
    await expectApiError(withIdempotency(k => loyalty.stamp(business.id, { code: visitorMe.qrPayload }, k)), 'VALIDATION_FAILED')
  })

  it('enrolls a customer at the counter with a stamp, then voids that stamp (§4.B.3, §4.B.7)', async () => {
    const result = await withIdempotency(k => loyalty.enrollCustomer(business.id, {
      phone: `55${rnd()}`,
      displayName: 'Carla Mostrador',
      consentAttested: true,
      cardId: card.id,
    }, k))

    expect(result.isNew).toBe(true)
    expect(result.customer.phoneMasked).toMatch(/5|•/)
    expect(result.stamp?.event.id).toBeTruthy()

    const voided = await withIdempotency(k => loyalty.voidEvent(business.id, result.stamp!.event.id, { reason: 'Sello por error' }, k))

    expect(voided.event.type).toBe('void_stamp')
  })

  it('reads CRM, event log, pending redemptions and metrics', async () => {
    const customers = await crm.listCustomers(business.id, { limit: 100 })

    expect(customers.data.length).toBeGreaterThan(0)
    expect(customers.page).toHaveProperty('nextCursor')

    const detail = await crm.getCustomer(business.id, customers.data[0].id)

    expect(detail).toHaveProperty('cards')

    const events = await crm.listEvents(business.id, { limit: 10 })

    expect(events.data.length).toBeGreaterThan(0)

    const pending = await loyalty.listPendingRedemptions(business.id)

    expect(Array.isArray(pending.data)).toBe(true)

    const metrics = await crm.getMetrics(business.id, { period: 'month' })

    expect(metrics.timezone).toBe('America/Mexico_City')
    expect(metrics.indicators.stamps).toHaveProperty('current')
  })

  it('reads billing (§4.A.10)', async () => {
    const b = await billing.getBilling(business.id)

    expect(b.entitlement.reason).toBe('trial')
  })

  // Needs STRIPE_PRICE_ID in the backend env (the local .env may not have it): CHECKOUT=1 to run
  it.runIf(process.env.CHECKOUT)('opens a (fake) checkout (§4.A.10)', async () => {
    const checkout = await billing.createCheckout(business.id)

    expect(checkout.url).toMatch(/^https?:\/\//)
  })

  it('manages cashiers (§4.A.6)', async () => {
    const member = await businesses.createMember(business.id, { phone: `55${rnd()}`, displayName: 'Luis Cajero', role: 'cashier' })

    expect(member.role).toBe('cashier')
    expect((await businesses.listMembers(business.id))[0].role).toBe('owner')
    await businesses.removeMember(business.id, member.id)
  })

  it('shows the visitor wallet and activity (§4.C.2–§4.C.4)', async () => {
    as(tokens.visitor)

    const wallet = await me.listMyCards()
    const entry = wallet.find(c => c.card.id === card.id)

    expect(entry?.qrPayload).toMatch(/^repitt:c:/)
    expect(entry?.cycle.stampsCount).toBe(1)

    const detail = await me.getMyCard(entry!.cycle.id)

    expect(detail.events.length).toBeGreaterThan(0)

    const activity = await me.listMyActivity({ limit: 5 })

    expect(activity.data[0].cycleId).toBe(entry!.cycle.id)

    const mine = await me.listMyBusinesses()

    expect(mine.map(b => b.businessId)).toContain(business.id)
  })

  it('requires reauthentication to delete the account, then deletes it with {} (§2.9, §4.C.7)', async () => {
    const firstTry = await me.deleteAccount().then(() => null, e => e as ApiError)

    expect(firstTry?.code, JSON.stringify(firstTry)).toBe('REAUTH_REQUIRED')

    const challenge = await auth.stepUpOtpRequest().catch((e: ApiError) => {
      throw new Error(`step-up/otp/request → ${JSON.stringify({ ...e, message: e.message })}`)
    })

    await auth.stepUpOtpVerify({ challengeId: challenge.challengeId, code: await otpFor(challenge.challengeId) })
    await expect(me.deleteAccount()).resolves.toBeUndefined()
  })
})
