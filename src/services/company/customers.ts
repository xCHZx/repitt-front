import { authAxios } from '../axios'

const getCustomersAsCompany = async (businessId: number) => {
  return await authAxios.get(`/businesses/${businessId}/customers`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getCustomerAsCompany = async (businessId: number, customerId: number) => {
  return await authAxios.get(`/businesses/${businessId}/customers/${customerId}`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getCustomerAsCompany, getCustomersAsCompany }
