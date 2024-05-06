import type { App } from 'vue'

import { setupLayouts } from 'virtual:generated-layouts'
import type { RouteRecordRaw } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router/auto'

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

router.beforeEach((to, from, next) => {
  // Convert localStorage.getItem('auth') to JSON to access the authToken
  const authData = JSON.parse(localStorage.getItem('auth') || '{}')
  const authToken = authData.authToken

  // Redirect to login page if not logged in
  if (to.meta.requiresAuth && !authToken) {
    console.log(to.meta.requiresAuth, authToken)
    next({ name: 'auth-login' })
  }
  else {
    next()
  }
})

export { router }

export default function (app: App) {
  app.use(router)
}
