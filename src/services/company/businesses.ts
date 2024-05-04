// import axios from 'axios'
import { authAxios } from '../axios'

const baseUrl = '/company/business'

const getAllByCurrentCompany = async () => {
  return await authAxios.get(`${baseUrl}/logged-user`)
    .then(response => {
      console.log('getAllByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const getByIdByCurrentCompany = async (id: number) => {
  return await authAxios.get(`${baseUrl}/${id}/logged-user`)
    .then(response => {
      console.log('getByIdByCurrentCompany', response.data.data[0])

      return response.data.data[0]
    })
    .catch(error => { return error })
}

const createBusinessAsCompany = async (data: any) => {
  console.log(data)

  return await authAxios.post(`${baseUrl}`, data, {
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

export { createBusinessAsCompany, getAllByCurrentCompany, getByIdByCurrentCompany }
