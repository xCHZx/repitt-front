import { authAxios } from '@/services/auth'

const createBusiness = async (payload: any) => {
  try {
    const response = await authAxios.post('http://127.0.0.1:8000/api/business', payload)

    console.log('Business created successfully:', response.data)

    return response.data // Devuelve los datos del negocio creado si es necesario
  }
  catch (error) {
    console.error('Error creating business:', error.response.data)
    throw error // Relanza el error para que pueda ser manejado por el componente que llama a esta función
  }
}

export { createBusiness }
