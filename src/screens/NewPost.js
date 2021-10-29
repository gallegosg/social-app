import React, { useState } from 'react';
import { SafeAreaView, View, Dimensions, KeyboardAvoidingView } from 'react-native';
import { TextInput, Image, Heading, Button, TouchableOpacity, Title } from '@shoutem/ui'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import PhotoModal from '../components/PhotoModal'
import  ImageCropPicker  from 'react-native-image-crop-picker'
import { baseUrl } from '../config/API';
import moment from 'moment'
import { useStateValue } from '../redux/state-context'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground } from '../styles/colors'
import { showMessage } from "react-native-flash-message";
import { post, upload } from '../api/Http'
import Loading from '../components/Loading'
import { useNavigation } from 'react-navigation-hooks'

const cameraOptions = {
  width: 1000,
  height: 1000,
  cropping: true,
  compressImageQuality: 0.8
}

const { width, height } = Dimensions.get('window')
const widthPercent = width / height

export default NewPost = () => {
  const [{ user, auth }] = useStateValue();
  const [ image, setImage ] = useState({photo: {}, imagePath: ''})
  const [ description, setDescription ] = useState('')
  const [ isUploading, setUploading ] = useState(false)
  const [ isModalVisible, setModalVisible ] = useState(false)
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  const { navigate } = useNavigation();

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
      ImageCropPicker.openCamera(cameraOptions).then(image => {
        savePhoto(image)
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

  const submitPost = async () => {
    try{
      setUploading(true)
      const urls = await upload(image.photo, navigate)
      const {originalUrl, thumbnailUrl} = urls;

      const data = {
        userid: user.id,
        description: description,
        createdDate: moment.utc().format(),
        originalUrl,
        thumbnailUrl
      }
      await post(`${baseUrl}posts`, auth, navigate, data)

      setUploading(false)
      setImage({photo: {}, imagePath: ''})
      setDescription('')
      showMessage({
        message: 'Success',
        description: "Nice post!",
        type: "success",
      });
    } catch(e){
      setUploading(false)
      showMessage({
        message: 'Oops',
        description: "Something went wrong with this post",
        type: "danger",
      });
    }
  }

  const toggleModal = () => setModalVisible(prev => !prev)
  const isPhotoSet = image.imagePath.length > 0
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="postition" enabled>
      <Loading isLoading={isUploading} />
      <PhotoModal
        openCameraRoll={openCameraRoll}
        openCamera={openCamera}
        toggleModal={toggleModal}
        isVisible={isModalVisible} />
      {/* <View style={{ height: widthPercent/3, backgroundColor: 'blue'}}> */}
        <TextInput
          placeholder={'Say something about this....'}
          maxLength={100}
          multiLine
          editable={!isUploading}
          returnKeyType={'done'}
          value={description}
          style={{...styles.description, color: textColor}}
          onChangeText={(description) => setDescription(description)}
        />
      {/* </View> */}
      <View style={{height: width, width}}>
        <TouchableOpacity onPress={toggleModal} style={{...styles.imageContainer, backgroundColor: imageBackgroundColor}}>
          {isPhotoSet ? 
          <Image style={styles.image} source={{uri: image.imagePath}} /> :
          <Icon name={'camera'} size={50} color={'#ddd'} />
          }
        </TouchableOpacity>
      </View>
      <Button
        disabled={!isPhotoSet}
        style={styles.postContainer} 
        onPress={submitPost}
        styleName="secondary full-width">
        <Heading style={{color: isPhotoSet ? '#fff' : '#999'}}>Post</Heading>
      </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

NewPost.navigationOptions = ({theme}) => ({
  headerTitle: <Title style={{color: theme === 'dark' ? 'white' : 'black'}}>New Post</Title>,
});

const styles = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainer: {
    height: widthPercent/2
  },
  heading: {
    marginLeft: 15
  },
  image: {
    width,
    height: width
  },
  description: {
    flex: 1,
    fontSize: 20, 
    flexWrap: 'wrap', 
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
}

  /**
   * upload photo to api
   */
  // const uploadPhoto = async () => {
  //   const data = new FormData();
  //   data.append('fileData', {
  //     uri : image.photo.uri,
  //     type: image.photo.type,
  //     name: image.photo.name
  //   });

  //   data.append('postData', JSON.stringify({
  //     userid: user.id,
  //     description: description,
  //     createdDate: moment.utc().format(),
  //     image: image.photo
  //   }))

  //   const config = {
  //     method: 'POST',
  //     url: `${baseUrl}posts`,
  //     headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'multipart/form-data',
  //     },
  //     data,
  //     onUploadProgress: (progressEvent) => {
  //       let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
  //     }
  //   };
  // }