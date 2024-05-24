import { authAxios } from '../axios'

const baseUrl = '/company/visit'

const registerVisitAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}`, payload)
    .then(response => {
      console.log('visit', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllVisitsByStampCardIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/stampcard/${id}/logged-user`)
    .then(response => {
      console.log('getAllVisitsByStampCardIdAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllVisitsByBusinessIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user`)
    .then(response => {
      console.log('getAllVisitsByBusinessIdAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllVisitsByBusinessIdAsCurrentCompany, getAllVisitsByStampCardIdAsCurrentCompany, registerVisitAsCompany }
