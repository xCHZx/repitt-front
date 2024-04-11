import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const baseUrl = 'http://127.0.0.1:8000/api/business'

async function createBusiness(payload: object) {
  return axios.post(`${baseUrl}`, payload)
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.error(error)

      return error
    })
}

export {
  createBusiness,
}
