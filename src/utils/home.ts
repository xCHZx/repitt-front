// Where a signed-in user lands (product decision 2026-10-06):
// no memberships → visitor wallet; one → that business; several → business selector.
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

export function homeRoute(): string {
  const session = useSessionStore()
  const memberships = session.memberships

  if (memberships.length === 0)
    return '/visitante'

  if (memberships.length === 1) {
    useBusinessStore().select(memberships[0].businessId)

    return '/empresa'
  }

  const business = useBusinessStore()
  if (business.activeId && memberships.some(m => m.businessId === business.activeId))
    return '/empresa'

  return '/empresa/seleccionar'
}

/** After login: honour a safe in-app `?redirect=` first. */
export function afterLoginRoute(redirect: unknown): string {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/auth'))
    return redirect

  return homeRoute()
}
