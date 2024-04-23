import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/company/business'

const getAllByCurrentCompany = async () => {
  return await axios.get(`${baseUrl}/logged-user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      console.log(response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdByCurrentCompany = async (id: number) => {
  return await axios.get(`${baseUrl}/${id}/logged-user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      console.log(response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getAllByCurrentCompany, getByIdByCurrentCompany }