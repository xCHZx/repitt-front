import { authAxios } from '../axios'

const baseUrl = '/catalogs'

const getAllCategories = async () => {
  return await authAxios.get(`${baseUrl}/categories`)
    .then(response => {
      // return either response.data or response.data.data depending on structure.
      // Often backend returns { data: [...] } for collections. Assuming similar to utils/segments
      return response.data.data || response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { getAllCategories }
