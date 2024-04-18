import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/visitor/user'

const getCurrentVisitorData = async () => {
  return await axios.get(`${baseUrl}/logged-user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      return response.data.data[0]
    })
    .catch(error => { return error })
}

export { getCurrentVisitorData }
