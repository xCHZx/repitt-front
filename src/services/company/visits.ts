import { authAxios } from '../axios'

const baseUrl = '/company/visit'

export const storeAsCompany = async (payload: any) => {
  return await authAxios.post(`${baseUrl}`, payload)
    .then(response => {
      console.log('visit', response.data)

      return response.data
    })
    .catch(error => { return error })
}
