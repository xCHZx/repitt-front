import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/stampcard/user/current'

const getMyVisitorStampCards = async () => {
  return await axios.get(baseUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getMyVisitorStampCards }
