import type { App } from 'vue'

import { setupLayouts } from 'virtual:generated-layouts'
import type { RouteRecordRaw } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router/auto'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

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
  ],
})

const VALID_ROLES = ['Owner', 'Visitor']

// Rutas de empresa accesibles sin suscripción activa
const EMPRESA_NO_SUB_REQUIRED = ['/empresa/planes', '/empresa/seleccionar', '/empresa/crear']

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const authToken = authStore.authToken
  const authRole = authStore.authRole

  // Si hay token pero la sesión está corrupta (sin rol válido), limpiar y redirigir a login
  if (authToken && !VALID_ROLES.includes(authRole)) {
    authStore.deleteAuthData()
    localStorage.removeItem('company')
    next({ name: 'auth-login' })

    return
  }

  if (to.meta.requiresAuth && !authToken) {
    next({ name: 'auth-login' })
  }
  else if (to.meta.requiredRole && !to.meta.requiredRole.includes(authRole)) {
    next('/404')
  }
  else if (
    authRole === 'Owner'
    && to.path.startsWith('/empresa')
    && !EMPRESA_NO_SUB_REQUIRED.some(p => to.path.startsWith(p))
  ) {
    // isActive es la fuente de verdad: false = negocio sin suscripción pagada
    const companyStore = useCompanyStore()
    const isBusinessActive = companyStore.selectedCompany?.isActive

    if (isBusinessActive === false) {
      next({ path: '/empresa/planes' })
    }
    else {
      next()
    }
  }
  else {
    next()
  }
})

export { router }

export default function (app: App) {
  app.use(router)
}
