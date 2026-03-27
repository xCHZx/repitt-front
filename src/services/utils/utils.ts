import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const refreshUserData = async () => {
  return await authAxios.get('/users/me')
    .then(response => {
      authStore.refreshUserData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { refreshUserData }
