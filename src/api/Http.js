import { useState, useEffect } from 'react'
import axios from 'axios'
import { vKey, vSecret } from 'react-native-dotenv'
import {auth0config} from '../config/auth0config'
import moment from 'moment'
import Auth0 from 'react-native-auth0';
const auth0 = new Auth0(auth0config);

export const usePost = (url, body, dependencies) => {
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    post(url, body)
  }, dependencies)

  return [isLoading, fetchedData]
}

const handleError = (error, navigate) => {
  if(error.response){
    const { status, data } = error.response
    if (status == 401) navigate('Auth');
  }
  throw Error(error.message || 'An error occurred')
}

export const refreshAccessToken = async (refreshToken) => {
  try{
    const newToken = await auth0.auth.refreshToken({refreshToken})
    return newToken.accessToken
  } catch(error){
    return Error(error.message || 'An error occurred')
  }
}

export const post = async (url, auth, navigate, data = {}) => {
  try{
    data.createddate = moment.utc().local();
    const accessToken = await refreshAccessToken(auth)
    const config = {
      method: 'POST',
      url,
      data,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
    const response = await axios(config);
    return response.data
  } catch(error) {
    handleError(error, navigate)
  }
}

export const get = async (url, auth, navigate) => {
  try{
    const accessToken = await refreshAccessToken(auth)
    const config = {
      method: 'GET',
      url,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
    const response = await axios(config);
    return response.data
  } catch(error) {
    handleError(error, navigate)
  }
}

export const put = async (url, auth, navigate, data = {}) => {
  try{
    data.createddate = moment.utc().local();
    const accessToken = await refreshAccessToken(auth)
    const config = {
      method: 'PUT',
      url,
      data,
      headers: {
        contentType: 'application/json',
        authorization: `Bearer ${accessToken}`
      }
    }
    const response = await axios(config);
    return response.data
  } catch(error) {
    handleError(error, navigate)
  }
}

export const deleet = async (url, auth, navigate, body = {}) => {
  try{
    const accessToken = await refreshAccessToken(auth)
    const config = {
      method: 'DELETE',
      url,
      body,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
    const response = await axios(config);
    return response.data
  } catch(error) {
    handleError(error, navigate)
  }
}

export const upload = async (photo, navigate) => {
  const data = new FormData();
  data.append('file', photo)
  
  try{
    const config = {
      method: 'POST',
      url: 'https://vincentapi.com/api/images/upload',
      headers: {
        'vKey': vKey,
        'vSecret': vSecret,
        'Content-Type': 'multipart/form-data',
      },
      data
    }
    const response = await axios(config)
    const res = JSON.parse(JSON.stringify(response))
    return res.data
  } catch (error){
    handleError(error, navigate)
  }
}

// export const get = async (initialUrl, auth) => {
//   const [url, setUrl] = useState(initialUrl)
//   const [isLoading, setIsLoading] = useState(false)
//   const [fetchedData, setFetchedData] = useState(null)
//   const [error, setError] = useState(null)

//   const config = {
//     method: 'GET',
//     url,
//     data,
//     headers: {
//       authorization: `Bearer ${auth.accessToken}`
//     }
//   }

//   useEffect(() => {
//     setIsLoading(true)
//     const getData = async () => {
//       try{
//         const response = await axios(config);
//         setFetchedData(response.data)
//         setIsLoading(false)
//       } catch(error) {
//         setIsLoading(false)
//         setError(error.response.data.message || 'An error occurred')
//         showMessage({
//           message: 'Oops',
//           description: "Something went wrong",
//           type: "error",
//         });
//       }
//     }

//     getData();
//   }, [url])

//   return[{isLoading, fetchedData, error}, setUrl]
// }