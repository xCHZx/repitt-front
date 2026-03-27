import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/auth'
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const loginUser = async (credentials: any) => {
  return await authAxios.post(`${baseUrl}/login`, credentials)
    .then(response => {
      // console.log('Login successful', response.data)

      authStore.deleteAuthData()
      companyStore.deleteCompanyData()

      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const onboardingUser = async (userPayload: any) => {
  return await authAxios.post(`${baseUrl}/onboarding`, userPayload)
    .then(response => {
      authStore.deleteAuthData()
      companyStore.deleteCompanyData()

      authStore.populateAuthData(response.data)

      // If business was created during onboarding, pre-populate the company store
      if (response.data?.data?.business) {
        companyStore.selectCompany({
          id: response.data.data.business.id,
          name: response.data.data.business.name,
          isActive: response.data.data.business.isActive,
          category: { id: response.data.data.business.categoryId, name: null },
          stampCards: response.data.data.stampCard ? [response.data.data.stampCard] : [],
        })
      }

      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const logoutUser = async () => {
  try {
    // Notify server to invalidate token (optional for stateless, but polite)
    await authAxios.post(`${baseUrl}/logout`)
  }
  catch (error) {
    // If the server fails or token is already expired, we intentionally ignore
    // as we are discarding the session client-side anyway.
  }
  finally {
    // ALWAYS clear local state afterward
    authStore.deleteAuthData()
    companyStore.deleteCompanyData()
  }
}

const sendRecoveryEmail = async (email: any) => {
  return await authAxios.post(`${baseUrl}/forgot-password`, { email })
    .then(response => {
      // console.log('Recovery Email sent successfully', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const recoverPassword = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/reset-password`, payload)
    .then(response => {
      // console.log('Password recovered successfully', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const loginVisitor = async (phone: string) => {
  return await authAxios.post(`${baseUrl}/visitor/login`, { phone })
    .then(response => {
      authStore.deleteAuthData()
      companyStore.deleteCompanyData()
      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

const registerVisitor = async (payload: { firstName: string; lastName: string; phone: string }) => {
  return await authAxios.post(`${baseUrl}/visitor/register`, payload)
    .then(response => {
      authStore.deleteAuthData()
      companyStore.deleteCompanyData()
      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export { loginUser, loginVisitor, logoutUser, onboardingUser, recoverPassword, registerVisitor, sendRecoveryEmail }
