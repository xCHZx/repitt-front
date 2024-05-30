import { authAxios } from '../axios'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/company/business'

const getAllBusinessAsCurrentCompany = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('get All Business As Current Company', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getBusinessByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      console.log('get Business By Id As Current Company', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const createBusinessAsCompany = async (data: any) => {
  const companyStore = useCompanyStore()

  return await authAxios.post(`${baseUrl}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('Business creation successful', response.data.data[0])

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
      console.log('Business update successful', response.data)

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const publishBusiness = async (id: any) => {
  const companyStore = useCompanyStore()

  return await authAxios.post(`${baseUrl}/${id}/publish`)
    .then(response => {
      console.log('Business publish success', response.data.data)

      companyStore.refreshCompany(response.data.data.id)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const unpublishBusiness = async (id: any) => {
  const companyStore = useCompanyStore()

  return await authAxios.post(`${baseUrl}/${id}/unpublish`)
    .then(response => {
      console.log('Business unpublish success', response.data.data)

      companyStore.refreshCompany(response.data.data.id)

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export {
  createBusinessAsCompany,
  getAllBusinessAsCurrentCompany,
  getBusinessByIdAsCurrentCompany,
  publishBusiness,
  unpublishBusiness,
  updateBusinessAsCurrentCompany,
}
