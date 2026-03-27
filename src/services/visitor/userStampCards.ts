import { authAxios } from '../axios'

const getAllUserStampCardsByCurrentVisitor = async () => {
  return await authAxios.get(`/users/me/stamp-cards`)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const getUserStampCardByIdAsVisitor = async (id: number) => {
  return await authAxios.get(`/users/me/stamp-cards/${id}`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getAllUserStampCardsByCurrentVisitor, getUserStampCardByIdAsVisitor }
