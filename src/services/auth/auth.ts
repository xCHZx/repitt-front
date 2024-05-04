import axios from 'axios'

const registerUser = async (payload: any) => {
  return axios.post ('http://127.0.0.1:8000/api/auth/register', payload)
    .then (response => {
      return response.data
    })
    .catch (e => {
      console.log(e)

      return e
    })
}

// Función para iniciar sesión y obtener el token JWT
const loginUser = async (credentials: any) => {
  return axios.post('http://127.0.0.1:8000/api/auth/login', credentials)
    .then(response => {
      // const token = response.data

      // localStorage.setItem('token', token)
      return response.data
    })
    .catch(error => {
      console.error('Login error:', error.response.data)
      throw error
    })
}

export { loginUser, registerUser }
