import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/stampcard'

const getAllByCurrentVisitor = async () => {
  return await axios.get(`${baseUrl}/visitor/current`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdByCurrentVisitor = async (id: number) => {
  return await axios.get(`${baseUrl}/${id}/visitor/current/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getAllByCurrentVisitor, getByIdByCurrentVisitor }
