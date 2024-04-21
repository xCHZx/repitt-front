import { authAxios } from '../axios'

const createStampcard = async (payload: any) => {
  try {
    const response = await authAxios.post('http://127.0.0.1:8000/api/stampcard', payload)

    console.log('Estampita creada:', response.data)
  }
  catch (error) {
    console.error('Error al crear estampa', error.response.data)
  }
}

export { createStampcard }
