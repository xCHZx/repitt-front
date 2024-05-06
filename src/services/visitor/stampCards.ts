import { authAxios } from '../axios'

const baseUrl = 'http://127.0.0.1:8000/api/visitor/stampcard'

const getAllByCurrentVisitor = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdByCurrentVisitor = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}`)
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getAllByCurrentVisitor, getByIdByCurrentVisitor }
