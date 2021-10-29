import axios from 'axios'
import { baseUrl } from '../config/API'

export const NewFollow = async (userid, usertofollowid) => {
  try {
    const users = await axios.get(`${baseUrl}/follows/${userid}/${usertofollowid}`)
    return users.data
  } catch (e){
    throw new e
  }
}