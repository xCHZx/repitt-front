import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'

const baseUrl = 'utils'

const authStore = useAuthStore()

const getAllSegments = async () => {
  return await authAxios.get(`${baseUrl}/segments`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const refreshUserData = async () => {
  return await authAxios.get(`${baseUrl}/refresh/user-data`)
    .then(response => {
      console.log(response.data)

      authStore.refreshUserData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllSegments, refreshUserData }
