import { authAxios } from '../axios'

const baseUrl = '/subscription'

const getCheckoutUrl = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/checkout`, payload)
    .then(response => {
      console.log('Checkout Session successful', response.data.url)

      return response.data.url
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const getBillingPortalUrl = async () => {
  return await authAxios.get(`${baseUrl}/billing-portal`)
    .then(response => {
      console.log('Billing portal Session successful', response.data.url)

      return response.data.url
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { getBillingPortalUrl, getCheckoutUrl }
