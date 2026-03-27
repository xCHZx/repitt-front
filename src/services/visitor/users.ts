import { authAxios } from '../axios'

const baseUrl = '/users'

const getCurrentVisitorData = async () => {
  return await authAxios.get(`${baseUrl}/me`)
    .then(response => {
      return response.data.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const updateCurrentVisitorData = async (data: { firstName?: string; lastName?: string; phone?: string }) => {
  return await authAxios.patch(`${baseUrl}/me`, data)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getCurrentVisitorData, updateCurrentVisitorData }
