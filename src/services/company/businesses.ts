import { authAxios } from '../axios'

const baseUrl = '/company/business'

const getAllByCurrentCompany = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('getAllByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdByCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      console.log('getByIdByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const createBusinessAsCompany = async (data: any) => {
  console.log('Payload', data)

  return await authAxios.post(`${baseUrl}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('Business creation success', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
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
    .catch(error => { return error })
}

export { createBusinessAsCompany, getAllByCurrentCompany, getByIdByCurrentCompany, updateBusinessAsCurrentCompany }
