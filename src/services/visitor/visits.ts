import { authAxios } from '../axios'

const getAllVisitsAsCurrentVisitor = async () => {
  return await authAxios.get(`/users/me/visits`)
    .then(response => response.data)
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getAllVisitsAsCurrentVisitor }
