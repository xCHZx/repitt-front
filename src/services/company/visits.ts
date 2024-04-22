import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/company/visit'

export const storeAsCompany = async (payload: any) => {
  return await axios.post(`${baseUrl}`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      return response.data
    })
    .catch(error => { return error })
}
