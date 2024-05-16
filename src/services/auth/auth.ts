import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/auth'
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const loginUser = async (credentials: any) => {
  return await authAxios.post(`${baseUrl}/login`, credentials)
    .then(response => {
      console.log('Login successful', response.data)

      authStore.deleteAuthData()
      companyStore.deleteCompanyData()

      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const dualRegisterUser = async (userPayload: any) => {
  console.log('User Payload', userPayload)

  return await authAxios.post(`${baseUrl}/register`, userPayload)
    .then(response => {
      console.log('Registration successful')

      authStore.deleteAuthData()
      companyStore.deleteCompanyData()

      authStore.populateAuthData(response.data)

      // if (businessPayload.name !== '') // Fix: Changed the comparison operator from '===' to '!=='.
      //   createBusinessAsCompany(businessPayload)

      return response.data
    })

    // .then(() => {
    //   if (businessPayload.name !== '') // Fix: Changed the comparison operator from '===' to '!=='.
    //     createBusinessAsCompany(businessPayload)
    // })
    .catch(error => {
      throw error.response.data.message
    })
}

const logoutUser = async () => {
  return await authAxios.post(`${baseUrl}/logout`)
    .then(response => {
      console.log('Logout successful')

      authStore.deleteAuthData()
      companyStore.deleteCompanyData()

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const sendRecoveryEmail = async (email: any) => {
  return await authAxios.post(`${baseUrl}/sendpasswordrecoverymail`, { email })
    .then(response => {
      console.log('Email sent successfully', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

const recoverPassword = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/password-recover`, payload)
    .then(response => {
      console.log('Password recovered successfully', response.data)

      return response.data
    })
    .catch(error => {
      throw error.response.data.message
    })
}

export { dualRegisterUser, loginUser, logoutUser, recoverPassword, sendRecoveryEmail }
