import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.VUE_APP_AXIOS_BASE_URL || 'http://localhost:5000'
})

export default instance
