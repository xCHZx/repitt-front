import { authAxios } from '../axios'

const getAllStampCardsByBusinessIdAsCurrentCompany = async (id: any) => {
  return await authAxios.get(`/businesses/${id}/stamp-cards/me`)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getAllActiveStampCardsByBusinessIdAsCurrentCompany = async (id: any) => {
  return await authAxios.get(`/businesses/${id}/stamp-cards`)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getStampCardByIdAsCurrentCompany = async (businessId: number, stampCardId: number) => {
  return await authAxios.get(`/businesses/${businessId}/stamp-cards/${stampCardId}/me`)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const createStampCardAsCompany = async (businessId: number, data: any) => {
  return await authAxios.post(`/businesses/${businessId}/stamp-cards`, data)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const updateStampCardAsCompany = async (businessId: number, stampCardId: number, data: any) => {
  return await authAxios.patch(`/businesses/${businessId}/stamp-cards/${stampCardId}`, data)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const uploadStampCardIcon = async (businessId: number, stampCardId: number, file: File) => {
  const formData = new FormData()
  formData.append('stamp_icon_file', file)

  return await authAxios.post(`/businesses/${businessId}/stamp-cards/${stampCardId}/icon`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const setStampCardActiveStatus = async (businessId: number, stampCardId: number, isActive: boolean) => {
  return await authAxios.patch(`/businesses/${businessId}/stamp-cards/${stampCardId}`, { isActive })
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { createStampCardAsCompany, getAllActiveStampCardsByBusinessIdAsCurrentCompany, getAllStampCardsByBusinessIdAsCurrentCompany, getStampCardByIdAsCurrentCompany, setStampCardActiveStatus, updateStampCardAsCompany, uploadStampCardIcon }
