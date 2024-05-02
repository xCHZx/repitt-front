import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/company/segment'

const getAllSegments = async () => {
  return await axios.get(`${baseUrl}/`, {
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

export { getAllSegments }
