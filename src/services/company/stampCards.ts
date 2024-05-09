import { authAxios } from '../axios'

const baseUrl = '/company/stampcard'

const getAllByIdByCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user/`)
    .then(response => {
      console.log('getAllByIdByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user/`)
    .then(response => {
      console.log('getByIdAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const createStampCardAsCompany = async (data: any) => {
  console.log('Payload', data)

  return await authAxios.post(`${baseUrl}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('StampCard creation success', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const updateStampCardAsCompany = async (id: number, data: any) => {
  console.log('Payload', data)

  return await authAxios.post(`${baseUrl}/${id}/logged-user`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('StampCard update success', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { createStampCardAsCompany, getAllByIdByCurrentCompany, getByIdAsCurrentCompany, updateStampCardAsCompany }
