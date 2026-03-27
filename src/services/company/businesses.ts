import { authAxios } from '../axios'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/businesses'

/**
 * Helper to normalize business data from API (handles snake_case fallback)
 */
const mapBusinessData = (data: any) => {
  if (!data)
    return null

  return {
    ...data,
    id: data.id,
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    businessRepittCode: data.businessRepittCode || data.business_repitt_code,
    openingHours: data.openingHours || data.opening_hours,
    logoPath: data.logoPath || data.logo_path,
    isActive: typeof data.isActive !== 'undefined' ? data.isActive : data.is_active,
    category: data.category || data.segment,
    stampCards: data.stampCards || data.stamp_cards || [],
  }
}

const getAllBusinessesMe = async () => {
  return await authAxios.get(`${baseUrl}/me`)
    .then(response => {
      const data = response.data.data
      if (Array.isArray(data))
        return data.map(mapBusinessData)

      return data ? [mapBusinessData(data)] : []
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getAllBusinessAsCurrentCompany = getAllBusinessesMe

const getBusinessByRepittCodeAsCurrentCompany = async (repittCode: string) => {
  return await authAxios.get(`${baseUrl}/${repittCode}`)
    .then(response => {
      return mapBusinessData(response.data.data)
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const createBusinessAsCompany = async (data: any) => {
  const companyStore = useCompanyStore()

  return await authAxios.post(`${baseUrl}`, data)
    .then(response => {
      const business = mapBusinessData(response.data.data)

      if (business && business.businessRepittCode)
        companyStore.refreshCompany(business.businessRepittCode)

      return business
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const updateBusinessAsCurrentCompany = async (id: number, data: any) => {
  return await authAxios.patch(`${baseUrl}/${id}`, data)
    .then(response => {
      return mapBusinessData(response.data.data)
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const uploadBusinessLogo = async (id: number, file: File) => {
  const companyStore = useCompanyStore()
  const formData = new FormData()
  formData.append('file', file)

  return await authAxios.post(`${baseUrl}/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      const business = mapBusinessData(response.data.data)

      if (business && business.businessRepittCode)
        companyStore.refreshCompany(business.businessRepittCode)

      return business
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export {
  createBusinessAsCompany,
  getAllBusinessAsCurrentCompany,
  getAllBusinessesMe,
  getBusinessByRepittCodeAsCurrentCompany,
  updateBusinessAsCurrentCompany,
  uploadBusinessLogo,
}
