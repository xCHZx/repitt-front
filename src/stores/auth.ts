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
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
      }
    },
    async deleteAuthData() {
      this.authToken = null
      this.authUser = {
        first_name: null,
        last_name: null,
        email: null,
      }
      this.authRole = null
    },
  },
  persist: true,
})
