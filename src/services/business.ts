import { authAxios } from './axios'

const createBusiness = async (payload: any) => {
  try {
    const response = await authAxios.post('http://127.0.0.1:8000/api/business', payload)

    console.log('Business created successfully:', response.data)
  }
  catch (error) {
    console.error('Error creating business:', error.response.data)
  }
}

export { createBusiness }
