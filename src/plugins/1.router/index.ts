import type { App } from 'vue'

import { setupLayouts } from 'virtual:generated-layouts'
import type { RouteRecordRaw } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router/auto'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'
import { homeRoute } from '@/utils/home'

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),

    // Business QR (guide §4.A.4): `${APP_URL}/n/<repittCode>`
    { path: '/n/:repittCode', redirect: to => ({ path: `/visitante/negocios/${String(to.params.repittCode)}` }) },
  ],
})

/**
 * Access rules (guide §3):
 * - `meta.public`: no session needed; `meta.guestOnly` sends signed-in users home.
 * - Everything else needs a session (boot = refresh + GET /v1/me).
 * - `meta.area === 'business'`: needs a membership; unless `meta.needsBusiness === false`, an
 *   active business too. `meta.ownerOnly` hides owner screens from cashiers.
 *   `meta.requiresEntitlement`: counter screens are blocked when `entitlement.allowed` is false.
 *   Access is decided by `entitlement`, never by `isPublished` or the subscription status.
 */
router.beforeEach(async to => {
  const session = useSessionStore()

  await session.ensureReady()

  if (session.status === 'suspended')
    return to.path === '/cuenta-suspendida' ? true : { path: '/cuenta-suspendida' }

  if (to.meta.public) {
    if (to.meta.guestOnly && session.isAuthenticated)
      return homeRoute()

    return true
  }

  if (!session.isAuthenticated)
    return { path: '/auth/login', query: to.fullPath === '/' ? undefined : { redirect: to.fullPath } }

  if (to.path === '/')
    return homeRoute()

  if (to.meta.area !== 'business')
    return true

  if (!session.hasMemberships)
    return { path: '/visitante' }

  const business = useBusinessStore()

  await business.ensureLoaded()

  // Stripe returns to /empresa/planes?businessId=<id>
  const queryBusinessId = typeof to.query.businessId === 'string' ? to.query.businessId : null
  if (queryBusinessId && business.businesses.some(b => b.id === queryBusinessId))
    business.select(queryBusinessId)

  if (to.meta.needsBusiness === false)
    return true

  if (!business.active)
    return { path: '/empresa/seleccionar' }

  if (to.meta.ownerOnly && !business.isOwner)
    return { path: '/empresa' }

  if (to.meta.requiresEntitlement && !business.canOperate)
    return business.isOwner ? { path: '/empresa/planes' } : { path: '/empresa' }

  return true
})

export { router }

export default function (app: App) {
  app.use(router)
}
