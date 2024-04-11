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
      const token = response.data.token

      localStorage.setItem('token', token)
    })
    .catch(error => {
      console.error('Login error:', error.response.data)
      throw error
    })
}

// Función para realizar solicitudes autenticadas utilizando el token JWT
const authAxios = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
})

// Interceptar cada solicitud para incluir el token JWT en el encabezado
authAxios.interceptors.request.use(config => {
  // Obtener el token guardado en localStorage
  const token = localStorage.getItem('token')
  if (token) {
    // Incluir el token en el encabezado de la solicitud
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export { authAxios, loginUser, registerUser }
