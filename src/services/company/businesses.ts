import { authAxios } from '../axios'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/company/business'

const getAllBusinessAsCurrentCompany = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('getAllByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getBusinessByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      console.log('getByIdByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const createBusinessAsCompany = async (data: any) => {
  const companyStore = useCompanyStore()

  console.log('Business Payload', data)

  return await authAxios.post(`${baseUrl}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('Business creation success', response.data.data[0])

      companyStore.refreshCompany(response.data.data[0].id)

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const updateBusinessAsCurrentCompany = async (id: number, data: any) => {
  console.log('Payload', data)

  return await authAxios.post(`${baseUrl}/${id}/logged-user`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('Business update success', response.data)

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { createBusinessAsCompany, getAllBusinessAsCurrentCompany, getBusinessByIdAsCurrentCompany, updateBusinessAsCurrentCompany }
