import { authAxios } from '../axios'

const baseUrl = 'visitor/stampcard'

const getAllStampCardsByCurrentVisitor = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('get All StampCards By Current Visitor', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getStampCardByIdAsVisitor = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}`)
    .then(response => {
      console.log('get StampCard By Id As Visitor', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllStampCardsByCurrentVisitor, getStampCardByIdAsVisitor }
