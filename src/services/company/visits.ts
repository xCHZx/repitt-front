import { authAxios } from '../axios'

const registerVisitAsCompany = async (businessId: number, payload: any) => {
  return await authAxios.post(`/businesses/${businessId}/visits/scan`, payload)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getAllVisitsByStampCardIdAsCurrentCompany = async (businessId: number, stampCardId: number) => {
  return await authAxios.get(`/businesses/${businessId}/stamp-cards/${stampCardId}/visits`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getAllVisitsByBusinessIdAsCurrentCompany = async (businessId: number) => {
  return await authAxios.get(`/businesses/${businessId}/visits`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const registerCustomerAsCompany = async (businessId: number, payload: {
  firstName: string
  lastName: string
  phone: string
  stampCardId: number
}) => {
  return await authAxios.post(`/businesses/${businessId}/visits/register-customer`, payload)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getAllVisitsByBusinessIdAsCurrentCompany, getAllVisitsByStampCardIdAsCurrentCompany, registerCustomerAsCompany, registerVisitAsCompany }
