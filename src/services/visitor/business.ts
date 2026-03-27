import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_API_URL}/businesses`

const getBusinessByRepittCodeAsVisitor = async (repittCode: string) => {
  return await axios.get(`${baseUrl}/${repittCode}`)
    .then(response => {
      return response.data.data
    })
    .catch(error => {
      throw error.response?.data?.message || error.message
    })
}

export {
  getBusinessByRepittCodeAsVisitor,
}
