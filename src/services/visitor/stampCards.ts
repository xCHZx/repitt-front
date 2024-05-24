import { authAxios } from '../axios'

const baseUrl = 'http://127.0.0.1:8000/api/visitor/stampcard'

const getAllStampCardsByCurrentVisitor = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getStampCardByIdAsVisitor = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllStampCardsByCurrentVisitor, getStampCardByIdAsVisitor }
