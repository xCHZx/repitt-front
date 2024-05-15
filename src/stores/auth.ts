import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authUser: {
      first_name: null,
      last_name: null,
      email: null,
    },
    authToken: null,
    authRole: null,
    authSubscriptionStatus: null,
  }),
  getters: {
    user: state => state.authUser,
    token: state => state.authToken,
    role: state => state.authRole,
    subscriptionStatus: state => state.authSubscriptionStatus,
  },
  actions: {
    async populateAuthData(response: any) {
      this.authToken = response.token
      this.authRole = response.role
      this.authUser = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
      }
      if (response.data.subscriptions && response.data.subscriptions.length > 0)
        this.authSubscriptionStatus = response.data.subscriptions[0].stripe_status
    },

    async refreshUserData(response: any) {
      this.authRole = response.role
      this.authUser = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
      }
      if (response.data.subscriptions && response.data.subscriptions.length > 0)
        this.authSubscriptionStatus = response.data.subscriptions[0].stripe_status
    },

    async deleteAuthData() {
      this.authToken = null
      this.authUser = {
        first_name: null,
        last_name: null,
        email: null,
      }
      this.authRole = null
      this.authSubscriptionStatus = null
    },
  },
  persist: true,
})
