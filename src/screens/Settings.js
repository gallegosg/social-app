import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, View, TouchableOpacity } from 'react-native';
import { Button, Text, Image, Spinner } from '@shoutem/ui'
import moment from 'moment';
import  TextInput  from '../components/CustomTextInput'
import { baseUrl } from '../config/API'
import AsyncStorage from '@react-native-community/async-storage';
import { useNavigation } from 'react-navigation-hooks'
import { useStateValue } from '../redux/state-context'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground } from '../styles/colors'
import PhotoModal from '../components/PhotoModal'
import  ImageCropPicker  from 'react-native-image-crop-picker'
import {cameraOptions} from '../config/App'
import { showMessage } from "react-native-flash-message";
import {auth0config} from '../config/auth0config'
import { post, upload } from '../api/Http'

import Auth0 from 'react-native-auth0';
const auth0 = new Auth0(auth0config);

export default Settings = () => {
  const [{ user, auth }, dispatch] = useStateValue();
  const [ modifiedUser, setModifiedUser ] = useState({})
  const [isLoading, setLoading] = useState(false);
  const { navigate } = useNavigation();
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  const [ isModalVisible, setModalVisible ] = useState(false)
  //{photo} has image data, {imagePath} it to display
  const [ image, setImage ] = useState({photo: {}, imagePath: ''})

  useEffect(() => {
    setModifiedUser(user)
    setImage({photo: {}, imagePath: user.profileimage})
  }, [])

  const logout = async () => {
    try{
      await auth0.webAuth.clearSession({})
      dispatch({type: 'logoutUser'})
      await AsyncStorage.setItem('user', '');
      navigate('Auth')
    } catch(error) {
      Alert.alert('Oops', 'error')
    }
    
  }

  const saveUser = async () => {
    let urls = {}
    try {
      setLoading(true)
      
      if(image.photo.uri) urls = await upload(image.photo, navigate)

      const data = {
        bio: modifiedUser.bio,
        modifiedDate: moment.utc().format(),
        username: modifiedUser.username,
        originalUrl: urls.originalUrl || '',
        thumbnailUrl: urls.thumbnailUrl || '',
        hasPhoto: urls.hasOwnProperty('originalUrl') ? true : false
      }
      const newUser = await post(`${baseUrl}users/${user.id}`, auth, navigate, data)
      await AsyncStorage.setItem('user', JSON.stringify(newUser))
      dispatch({
        type: 'saveUser',
        user: newUser
      })
      setImage({photo: {}, imagePath: newUser.profileimage})
      showMessage({
        message: "Success",
        description: 'Profile Saved',
        type: "success",
      });
      setLoading(false)
    } catch(e){
      console.log(e)
      setLoading(false)
      showMessage({
        message: 'Oops',
        description: "Something went wrong saving profile",
        type: "danger",
      });
    }
  }

  const openCameraRoll = async () => {
    toggleModal()  
    setTimeout(() => {
      ImageCropPicker.openPicker(cameraOptions).then(image => {
        savePhoto(image)
      }).catch((e) => console.warn(e))
    }, 500)
  }
  
  const openCamera = async () => {
    toggleModal()
    setTimeout(() => {
      ImageCropPicker.openCamera(cameraOptions).then(img => {
        savePhoto(img)
      }).catch((e) => console.warn(e))
    }, 500)
  }

  const savePhoto = (image) => {
    const parts = image.path.split('/')
    const name = parts[parts.length - 1]
    const photo = {
      uri: image.path,
      type: image.mime,
      name: image.filename || name
    }
    setImage({photo, imagePath: image.path})
  }

  const toggleModal = () => setModalVisible(prev => !prev)

  return (
    <SafeAreaView style={styles.container}>
      <PhotoModal
        openCameraRoll={openCameraRoll}
        openCamera={openCamera}
        toggleModal={toggleModal}
        isVisible={isModalVisible} />
      <View style={{marginTop: 10}}>
        <TouchableOpacity  style={styles.profileImage} onPress={toggleModal}>
          <Image
            style={{...styles.avatar, backgroundColor: imageBackgroundColor}}
            source={{uri: image.imagePath || ''}}
          />
          <Text style={{color: textColor}}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.textInputContainer}
        placeholder={'username'}
        returnKeyType={'done'}
        blurOnSubmit={true}
        maxLength={15}
        value={modifiedUser.username}
        onChangeText={(username) => setModifiedUser({...modifiedUser, username})}
      />
      <TextInput
        style={styles.bioContainer}
        multiline
        maxLength={250}
        placeholder={'bio'}
        returnKeyType={'done'}
        blurOnSubmit={true}
        value={modifiedUser.bio}
        onChangeText={(bio) => setModifiedUser({...modifiedUser, bio})}
      />
      <View style={{marginTop: 20}}>
        <Button onPress={saveUser}>
        {isLoading ? <Spinner color="#fff"/> : <Text>Save</Text>}
        </Button>
      </View>
      <View style={styles.logoutContainer}>
        <Button onPress={logout}><Text>Logout</Text></Button>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
  },
  textInputContainer: {
    backgroundColor: '#eee',
    width: '100%',
    textAlign: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1
  },
  bioContainer: {
    backgroundColor: '#eee',
    width: '100%',
    textAlign: 'center',
    height: 75,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1
  },
  profileImage: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  logoutContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 0.9,
  }
}

/**
 * UPLOAD TO API
 */
// const uploadPhoto = () => {
//   const data = new FormData();
//   if(image.photo.uri){
//     data.append('fileData', {
//       uri : image.photo.uri,
//       type: image.photo.type,
//       name: image.filename || 'AndroidDefaultFilename'
//     });
//   } else {
//     data.append('fileData', {
//       empty: ''
//     });
//   }
  

//   data.append('postData', JSON.stringify({
//     bio: modifiedUser.bio,
//     modifiedDate: moment.utc().format(),
//     username: modifiedUser.username,
//     hasPhoto: image.photo.uri ? true : false
//   }))
  
//   const config = {
//     method: 'PUT',
//     url: `${baseUrl}users/${user.id}`,
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'multipart/form-data',
//     },
//     data
//   };
// }