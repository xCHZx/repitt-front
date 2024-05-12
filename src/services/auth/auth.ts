import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

const baseUrl = '/auth'
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const loginUser = async (credentials: any) => {
  return await authAxios.post(`${baseUrl}/login`, credentials)
    .then(response => {
      console.log('Login successful')

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

export { dualRegisterUser, loginUser, logoutUser }

// import axios from 'axios'

// const registerUser = async (payload: any) => {
//   return axios.post ('http://127.0.0.1:8000/api/auth/register', payload)
//     .then (response => {
//       return response.data
//     })
//     .catch (e => {
//       console.log(e)

//       return e
//     })
// }

// // Función para iniciar sesión y obtener el token JWT
// const loginUser = async (credentials: any) => {
//   return axios.post('http://127.0.0.1:8000/api/auth/login', credentials)
//     .then(response => {
//       // const token = response.data

//       // localStorage.setItem('token', token)
//       return response.data
//     })
//     .catch(error => {
//       console.error('Login error:', error.response.data)
//       throw error
//     })
// }

// export { loginUser, registerUser }
