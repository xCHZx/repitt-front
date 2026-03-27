import { authAxios } from '../axios'

const getUserStampCardByIdAsCurrentCompany = async (businessId: number, userStampCardId: number) => {
  return await authAxios.get(`/businesses/${businessId}/user-stamp-cards/${userStampCardId}`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const redeemRewardAsCompany = async (businessId: number, userStampCardId: number) => {
  return await authAxios.post(`/businesses/${businessId}/user-stamp-cards/${userStampCardId}/redeem`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getUserStampCardReadyToRedeemAsCurrentCompany = async (businessId: number) => {
  return await authAxios.get(`/businesses/${businessId}/user-stamp-cards/pending-redeem`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export {
  getUserStampCardByIdAsCurrentCompany,
  getUserStampCardReadyToRedeemAsCurrentCompany,
  redeemRewardAsCompany,
}
