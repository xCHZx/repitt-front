import { authAxios } from '../axios'

const baseUrl = '/company/metric'

const getGlobalMetrics = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/global/`, payload)
    .then(response => {
      console.log('getGlobalMetrics', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getGlobalMetrics }
