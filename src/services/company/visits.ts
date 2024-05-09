import { authAxios } from '../axios'

const baseUrl = '/company/visit'

const storeAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}`, payload)
    .then(response => {
      console.log('visit', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllByStampCardAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/stampcard/${id}/logged-user/`)
    .then(response => {
      console.log('getAllByStampCardAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllByBusinessAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user/`)
    .then(response => {
      console.log('getAllByBusinessAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllByBusinessAsCurrentCompany, getAllByStampCardAsCurrentCompany, storeAsCompany }
