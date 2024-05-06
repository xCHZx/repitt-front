import axios from 'axios'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authUser: null,
    authToken: null,
    authRole: null,
  }),
  getters: {
    user: state => state.authUser,
    token: state => state.authToken,
    role: state => state.authRole,
  },
  actions: {
    async loginUser(credentials: any) {
      await axios.post('http://127.0.0.1:8000/api/auth/login', credentials)
        .then(response => {
          this.authToken = response.data.token
          this.authRole = response.data.role
          this.authUser = response.data.data

          console.log('Login successful')

          return response.data
        })
        .catch(error => {
          throw error
        })
    },
    async registerUser(payload: any) {
      await axios.post('http://127.0.0.1:8000/api/auth/register', payload)
        .then(response => {
          this.authToken = response.data.token
          this.authRole = response.data.role
          this.authUser = response.data.data

          return response.data
        })
        .catch(error => {
          console.error('Login error:', error.response.data)
          throw error
        })
    },
    async logout() {
      this.authToken = null
      this.authUser = null
      this.authRole = null
    },
  },
  persist: true,
})
