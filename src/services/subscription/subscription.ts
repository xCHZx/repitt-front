import { authAxios } from '../axios'

const createCheckoutSession = async (businessId: number, planId?: string) => {
  return await authAxios.post('/subscriptions/checkout', { businessId, ...(planId ? { planId } : {}) })
    .then(response => response.data)
    .catch(error => { throw error.response?.data?.message || error.message })
}

const createPortalSession = async (businessId: number) => {
  return await authAxios.post('/subscriptions/portal', { businessId })
    .then(response => response.data)
    .catch(error => { throw error.response?.data?.message || error.message })
}

const getSubscriptionStatus = async (businessId: number) => {
  return await authAxios.get(`/subscriptions/business/${businessId}`)
    .then(response => response.data)
    .catch(error => { throw error.response?.data?.message || error.message })
}

const cancelSubscription = async (businessId: number) => {
  return await authAxios.post('/subscriptions/cancel', { businessId })
    .then(response => response.data)
    .catch(error => { throw error.response?.data?.message || error.message })
}

export { cancelSubscription, createCheckoutSession, createPortalSession, getSubscriptionStatus }
