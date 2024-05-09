import { authAxios } from '../axios'

const baseUrl = '/subscription'

const getCheckoutUrl = async () => {
  return await authAxios.get(`${baseUrl}/checkout`)
    .then(response => {
      console.log('Checkout successful', response.data.url)

      return response.data.url
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getCheckoutUrl }
