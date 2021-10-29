import React, { useState } from 'react';
import { View, Alert, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Heading, Button,Text, Spinner } from '@shoutem/ui';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment'
import { baseUrl } from '../config/API'
import { useDarkMode } from 'react-native-dark-mode'
import { useStateValue } from '../redux/state-context'
import { useNavigation } from 'react-navigation-hooks'
import { showMessage } from "react-native-flash-message";
import { post, put } from '../api/Http' 
import { Notifications } from 'react-native-notifications';

export default function SignUp(props) {
  const [username, setUsername] = useState('');
  const [isLoading, setLoading] = useState(false)
  const isDarkMode = useDarkMode();
  // const [isAuthLoading, fetchedData] = usePost('https://swapi.co/api/people', []);

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const color = isDarkMode ? 'white' : 'black';
  
  const [{ user, auth }, dispatch] = useStateValue();
  const { navigate } = useNavigation();

  const validateFields = () => {
    if (username) {
      createUser();
    }else {
      Alert.alert('Oops', 'Please fill out all fields')
    }
  }

  const handleChangeUsername = (username) => {
    const newUsername = username.replace(/\s/g, '').trim()
    setUsername(newUsername)
  }

  const updateToken = async (devicetoken, auth, userid) => {
    //send up new token
    const data = {
      userid,
      devicetoken
    }
    try{
      await put(`${baseUrl}devices/`, auth, navigate, data)
      const oldUser = await AsyncStorage.getItem('user');
      const parsedOld = JSON.parse(oldUser)
      const newUser = {...parsedOld, devicetoken}
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (e){
      console.log(e)
    }
  }

  const registerForNotifications = () => {
    Notifications.registerRemoteNotifications(); 
  }

  const listenForToken = (u, auth) => {
    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      const { deviceToken } = event;
      if(deviceToken && u.devicetoken !== deviceToken){
        updateToken(deviceToken, auth, u.id)
        navigate('App')
      } else {
        navigate('App')
      }
    });
  }

  const createUser = async () => {
    const userData = {
      username,
      email: user.email,
      createddate: moment.utc().local()
    }

    try{
      setLoading(true)
      const newUser = await post(`${baseUrl}users`, auth, navigate, userData)
      setLoading(false)
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('hasOpened', 'true');
      dispatch({type: 'saveUser', user: newUser})

      registerForNotifications()
      listenForToken(newUser, auth)
    } catch(e){
      setLoading(false)
      showMessage({
        message: "Oops",
        description: e,
        type: "danger",
      });
    }
  }

  return (
    <ImageBackground source={require('../assets/loginBG.jpg')} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior="height"
        // enabled
      >
      <View style={styles.topContainer}>
        <Text style={styles.headingText}>Let's finish setting up your account</Text>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={{backgroundColor: '#fff', width: '100%', textAlign: 'center'}}
            placeholder={'username'}
            maxLength={15}
            value={username}
            onChangeText={handleChangeUsername}
          />
        </View>
        <Button 
          disabled={isLoading}
          styleName="secondary"
          style={styles.button}
          onPress={validateFields}>
          {isLoading ? <Spinner color="#fff"/> : <Text style={{fontSize: 20, color: '#571C39'}}>Create Account</Text>}
        </Button>
      </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = {
  container: {
    flex: 1, 
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%'
  },
  topContainer: {
    flex: 0.4,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headingText: {
    fontSize: 30,
    height: '50%',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff'
  },
  bottomContainer: {
    flex: 0.7,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 0.4,
    width: '100%',
    justifyContent: 'space-around'
  },
  button: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 0,
  }
}