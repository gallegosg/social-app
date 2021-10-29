import axios from 'axios'
import { baseUrl } from '../config/API'

export const GetFeed = async (id, op) => {
  try {
    const users = await axios.get(`${baseUrl}/posts/${id}/${op}`)
    return users.data
  } catch (e){
    throw new e
  }
}