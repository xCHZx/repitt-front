import { authAxios } from '../axios'

const baseUrl = 'utils'

const getAllSegments = async () => {
  return await authAxios.get(`${baseUrl}/segments`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllSegments }
