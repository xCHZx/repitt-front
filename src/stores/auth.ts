import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authUser: {
      firstName: null,
      lastName: null,
      email: null,
    },
    authToken: null,
    authRole: null,
  }),
  getters: {
    user: state => state.authUser,
    token: state => state.authToken,
    role: state => state.authRole,
  },
  actions: {
    async populateAuthData(response: any) {
      this.authToken = response.token
      this.authRole = response.role
      this.authUser = {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
      }
    },

    async refreshUserData(response: any) {
      const userData = response.data?.firstName ? response.data : response

      this.authUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      }
    },

    async deleteAuthData() {
      this.authToken = null
      this.authUser = {
        firstName: null,
        lastName: null,
        email: null,
      }
      this.authRole = null
    },
  },
  persist: {
    afterRestore(ctx) {
      const validRoles = ['Owner', 'Visitor']
      const state = ctx.store.$state

      // Limpiar campos obsoletos del localStorage
      if ('authSubscriptionStatus' in state)
        delete (state as any).authSubscriptionStatus
      if ('authSubscription' in state)
        delete (state as any).authSubscription

      // Si hay token pero el rol es inválido, limpiar toda la sesión
      if (state.authToken && !validRoles.includes(state.authRole)) {
        ctx.store.$patch({
          authToken: null,
          authRole: null,
          authUser: { firstName: null, lastName: null, email: null },
        })
      }
    },
  },
})
