import { authAxios } from '../axios'

const baseUrl = 'visitor/user'

const getCurrentVisitorData = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      // console.log('get Current Visitor Data', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getCurrentVisitorData }
