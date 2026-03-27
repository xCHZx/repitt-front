import { authAxios } from '../axios'

const getGlobalMetrics = async (businessId: number, timePeriod = 'month') => {
  return await authAxios.get(`/businesses/${businessId}/metrics`, {
    params: { timePeriod },
  })
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getGlobalMetrics }
