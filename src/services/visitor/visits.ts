import { authAxios } from '../axios'

const baseUrl = 'visitor/visit'

const getAllVisitsAsCurrentVisitor = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('get All Visits As Current Visitor', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllVisitsAsCurrentVisitor }
