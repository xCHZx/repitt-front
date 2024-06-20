import { authAxios } from '../axios'

const baseUrl = '/company/visit'

const registerVisitAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}`, payload)
    .then(response => {
      // console.log('register Visit As Company', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const registerVisitByUserStampCardAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/user-stampcard`, payload)
    .then(response => {
      // console.log('register Visit By User StampCard As Company', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllVisitsByStampCardIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/stampcard/${id}/logged-user`)
    .then(response => {
      // console.log('get All Visits By StampCardId As Current Company', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getAllVisitsByBusinessIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user`)
    .then(response => {
      // console.log('get All Visits By BusinessId As Current Company', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllVisitsByBusinessIdAsCurrentCompany, getAllVisitsByStampCardIdAsCurrentCompany, registerVisitAsCompany, registerVisitByUserStampCardAsCompany }
