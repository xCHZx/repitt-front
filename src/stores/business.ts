// Active business for the /empresa area (guide §3).
// Keeps the list of businesses where the user is an active member (owner first, ≤ 50), the
// selected one and its role + entitlement. Only the selected id is remembered between reloads;
// business data is always re-read from the API (no caching of business responses across sessions).
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getBusiness, listBusinesses } from '@/api/endpoints/businesses'
import { isApiError } from '@/api/errors'
import type { Business } from '@/api/types'
import { useSessionStore } from '@/stores/session'
import { DEFAULT_TIMEZONE } from '@/utils/dates'

const ACTIVE_KEY = 'repitt.activeBusinessId'

function readActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  }
  catch {
    return null
  }
}

function writeActiveId(id: string | null) {
  try {
    if (id)
      localStorage.setItem(ACTIVE_KEY, id)
    else
      localStorage.removeItem(ACTIVE_KEY)
  }
  catch {}
}

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref<Business[]>([])
  const activeId = ref<string | null>(readActiveId())
  const loaded = ref(false)

  let loading: Promise<void> | null = null

  const active = computed(() => businesses.value.find(b => b.id === activeId.value) ?? null)
  const role = computed(() => active.value?.role ?? null)
  const isOwner = computed(() => role.value === 'owner')
  const isCashier = computed(() => role.value === 'cashier')
  const entitlement = computed(() => active.value?.entitlement ?? null)
  const canOperate = computed(() => !!entitlement.value?.allowed)
  const timezone = computed(() => active.value?.timezone ?? DEFAULT_TIMEZONE)

  function select(id: string | null) {
    activeId.value = id
    writeActiveId(id)
  }

  /**
   * A membership was lost (§3.3): re-read GET /v1/me too, because routing (`homeRoute()`, the guard,
   * the "Ir a mi negocio" shortcuts) reads `session.memberships`. Best effort.
   */
  async function syncMemberships() {
    await useSessionStore().loadMe().catch(() => {})
  }

  async function load() {
    const list = await listBusinesses()

    // Refresh /me before touching the list: the company layout leaves the page as soon as the
    // active business disappears, and the guard must already see the fresh memberships.
    if (activeId.value && !list.some(b => b.id === activeId.value))
      await syncMemberships()

    businesses.value = list
    loaded.value = true

    if (activeId.value && !businesses.value.some(b => b.id === activeId.value))
      select(null)
    if (!activeId.value && businesses.value.length === 1)
      select(businesses.value[0].id)
  }

  function ensureLoaded() {
    if (loaded.value)
      return Promise.resolve()
    loading ??= load().finally(() => {
      loading = null
    })

    return loading
  }

  /** Replace a business in the list with fresh data from any endpoint returning BusinessWithRoleDto. */
  function upsert(business: Business) {
    const i = businesses.value.findIndex(b => b.id === business.id)
    if (i === -1)
      businesses.value.push(business)
    else
      businesses.value[i] = business
  }

  /**
   * Re-read the active business (entitlement, trial…). A 404 means "no longer a member, or the
   * business no longer exists": refresh /me, drop it and reload the list (§3.3).
   */
  async function refreshActive() {
    const id = activeId.value
    if (!id)
      return null
    try {
      const fresh = await getBusiness(id)

      upsert(fresh)

      return fresh
    }
    catch (e) {
      if (isApiError(e) && e.status === 404) {
        await syncMemberships()
        businesses.value = businesses.value.filter(b => b.id !== id)
        select(null)
        await load()

        return null
      }
      throw e
    }
  }

  function reset() {
    businesses.value = []
    loaded.value = false
    select(null)
  }

  return {
    businesses,
    activeId,
    loaded,
    active,
    role,
    isOwner,
    isCashier,
    entitlement,
    canOperate,
    timezone,
    select,
    load,
    ensureLoaded,
    upsert,
    refreshActive,
    reset,
  }
})
