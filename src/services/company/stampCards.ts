import { authAxios } from '../axios'

const baseUrl = '/company/stampcard'

const getAllByIdByCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/business/${id}/logged-user/`)
    .then(response => {
      console.log('getAllByIdByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdAsCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user/`)
    .then(response => {
      console.log('getByIdAsCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getAllByIdByCurrentCompany, getByIdAsCurrentCompany }
