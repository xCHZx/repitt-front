import { authAxios } from '../axios'

const baseUrl = '/company/stampcard'

const getAllStampCardsByBusinessIdAsCurrentCompany = async (id: any) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user`)
    .then(response => {
      console.log('get All StampCards By BusinessId As CurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllActiveStampCardsByBusinessIdAsCurrentCompany = async (id: any) => {
  return await authAxios.get(`${baseUrl}/business/${id}/active/logged-user`)
    .then(response => {
      console.log('get All Active StampCards By BusinessId As CurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getStampCardByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      console.log('get StampCard By Id As CurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const createStampCardAsCompany = async (data: any) => {
  return await authAxios.post(`${baseUrl}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('StampCard creation successful', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const updateStampCardAsCompany = async (id: number, data: any) => {
  return await authAxios.post(`${baseUrl}/${id}/logged-user`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('StampCard update successful', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const publishStampCard = async (id: number) => {
  return await authAxios.post(`${baseUrl}/${id}/publish`)
    .then(response => {
      console.log('StampCard publish successful', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const unpublishStampCard = async (id: number) => {
  return await authAxios.post(`${baseUrl}/${id}/unpublish`)
    .then(response => {
      console.log('StampCard unpublish successful', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { createStampCardAsCompany, getAllActiveStampCardsByBusinessIdAsCurrentCompany, getAllStampCardsByBusinessIdAsCurrentCompany, getStampCardByIdAsCurrentCompany, publishStampCard, unpublishStampCard, updateStampCardAsCompany }
