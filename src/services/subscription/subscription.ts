import { authAxios } from '../axios'

const baseUrl = '/subscription'

const getCheckoutUrl = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/checkout`, payload)
    .then(response => {
      console.log('Checkout successful', response.data.url)

      return response.data.url
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getCheckoutUrl }
