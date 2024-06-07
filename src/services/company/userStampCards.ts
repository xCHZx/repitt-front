import { authAxios } from '../axios'

const baseUrl = '/company/user-stampcard'

const getUserStampCardByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      // console.log('get UserStampCard By Id As CurrentCompany', response.data.data[0])

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const redeemRewardAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/redeem`, payload)
    .then(response => {
      // console.log('Redeem reward successful', response.data.data[0])

      return response.data.message
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getUserStampCardByIdAsCurrentCompany, redeemRewardAsCompany }
