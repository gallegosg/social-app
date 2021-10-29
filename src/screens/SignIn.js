import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import {  Heading, Button,Text, Spinner } from '@shoutem/ui';
import AsyncStorage from '@react-native-community/async-storage';
import { baseUrl } from '../config/API'
import { useDarkMode } from 'react-native-dark-mode'
import { useStateValue } from '../redux/state-context'
import { useNavigation } from 'react-navigation-hooks'
import { showMessage } from "react-native-flash-message";
import { put, post } from '../api/Http'
import {auth0config, auth0authorize} from '../config/auth0config'
import Auth0 from 'react-native-auth0';
const auth0 = new Auth0(auth0config);
import * as Keychain from 'react-native-keychain';
import moment from 'moment';
import { Notifications } from 'react-native-notifications';

export default function SignIn() {
  const [isLoading, setLoading] = useState(false)
  // const isDarkMode = useDarkMode();

  // const backgroundColor = isDarkMode ? 'black' : 'white';
  // const color = isDarkMode ? 'white' : 'black';
  
  const [{ user }, dispatch] = useStateValue();
  const { navigate } = useNavigation();

  useEffect(() => { 
    clearUser() 
  }, [])

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

  const clearUser = async () => {
    await AsyncStorage.removeItem('user')
    await AsyncStorage.removeItem('auth')
    dispatch({type: 'logoutUser'})
  }

  const authLogin = async () => {
    try {
      setLoading(true)
      const auth = await auth0.webAuth.authorize(auth0authorize)
      auth.currentTime = moment.utc().local();
      const user = await post(`${baseUrl}auth`, auth.refreshToken, navigate, auth)

      dispatch({type: 'saveUser', user})
      dispatch({type: 'updateAuth', auth: auth.refreshToken})

      await Keychain.setGenericPassword('refreshToken', auth.refreshToken);

      if (user.isExisting) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('hasOpened', 'true');
        registerForNotifications();
        listenForToken(user, auth.refreshToken);
      } else {
        navigate('SignUp')
      }
      setLoading(false)
    } catch (e) {
      console.log(e)
      setLoading(false)
      showMessage({
        message: "Oops",
        description: "An Error occurred",
        type: "danger",
      });
    }
  }

  return (
    <ImageBackground source={require('../assets/loginBG.jpg')} style={styles.container}>
      <KeyboardAvoidingView 
        enabled={Platform.OS === 'ios'}
        style={styles.container} behavior="padding" enabled>
      <View style={styles.topContainer}>
        <Text style={{...styles.headingText}}>Social</Text>
        <Text style={{...styles.headingText}}>App</Text>
      </View>
      <View style={styles.bottomContainer}>
        <Button 
          disabled={isLoading} 
          styleName="secondary" 
          style={styles.button} 
          onPress={authLogin}>
          {isLoading ? <Spinner color="#fff"/> : <Text style={{fontSize: 20, color: '#571C39'}}>Enter</Text>}
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
    width: '100%',
    heigth: '100%'
  },
  topContainer: {
    flex: 0.6,
    justifyContent: 'center',
  },
  headingText: {
    fontSize: 60,
    // flex: 0.5, 
    // height: '40%',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: '400',
    color: '#fff',
  },
  bottomContainer: {
    flex: 0.4,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 0,
  }
}