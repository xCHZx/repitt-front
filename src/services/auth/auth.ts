import { authAxios } from '../axios'
import { useAuthStore } from '@/stores/auth'

const baseUrl = '/auth'
const authStore = useAuthStore()

const loginUser = async (credentials: any) => {
  return await authAxios.post(`${baseUrl}/login`, credentials)
    .then(response => {
      console.log('Login successful')

      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      console.error('Login error:', error.response.data)
      throw error
    })
}

const registerUser = async (payload: any) => {
  return await authAxios.post(`${baseUrl}/register`, payload)
    .then(response => {
      console.log('Registration successful')

      authStore.populateAuthData(response.data)

      return response.data
    })
    .catch(error => {
      console.error('Registration error:', error.response.data)
      throw error
    })
}

const logoutUser = async () => {
  return await authAxios.post(`${baseUrl}/logout`)
    .then(response => {
      console.log('Logout successful')

      authStore.deleteAuthData()

      return response.data
    })
    .catch(error => {
      console.error('Logout error:', error.response.data)
      throw error
    })
}

export { loginUser, logoutUser, registerUser }

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
