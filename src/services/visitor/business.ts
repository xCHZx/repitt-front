import { authAxios } from '../axios'

const baseUrl = '/visitor/business'

const getBusinessByIdAsVisitor = async (businessId: string) => {
  return await authAxios.get(`${baseUrl}/${businessId}`)
    .then(response => {
      // console.log('Business fetched successfully', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export {
  getBusinessByIdAsVisitor,
}
