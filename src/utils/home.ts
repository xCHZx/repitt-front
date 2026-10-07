// Where a signed-in user lands (product decision 2026-10-06):
// no memberships → visitor wallet; one → that business; several → business selector.
import type { RouteLocationRaw } from 'vue-router'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

export function homeRoute(): RouteLocationRaw {
  const session = useSessionStore()
  const memberships = session.memberships

  if (memberships.length === 0)
    return { path: '/visitante' }

  if (memberships.length === 1) {
    useBusinessStore().select(memberships[0].businessId)

    return { path: '/empresa' }
  }

  const business = useBusinessStore()
  if (business.activeId && memberships.some(m => m.businessId === business.activeId))
    return { path: '/empresa' }

  return { path: '/empresa/seleccionar' }
}

/** After login: honour a safe in-app `?redirect=` first. */
export function afterLoginRoute(redirect: unknown): RouteLocationRaw {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/auth'))
    return redirect

  return homeRoute()
}
