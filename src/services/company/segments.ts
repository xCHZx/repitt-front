import { authAxios } from '../axios'

const baseUrl = '/company/segment'

const getAllSegments = async () => {
  return await authAxios.get(`${baseUrl}/`)
    .then(response => {
      console.log('getAllSegments', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getAllSegments }
