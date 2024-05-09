import { authAxios } from '../axios'

const baseUrl = 'visitor/visit'

const getAllByCurrentVisitor = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('getAllByCurrentVisitor', response.data.data)

      return response.data.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getAllByCurrentVisitor }
