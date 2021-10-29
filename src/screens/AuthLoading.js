import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  View,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useStateValue } from '../redux/state-context'
import { useNavigation } from 'react-navigation-hooks'
import { put } from '../api/Http'
import { baseUrl } from '../config/API'
import { Notifications } from 'react-native-notifications';
import * as Keychain from 'react-native-keychain';

const getRefreshToken = async () => {
  try {
    // Retrieve the credentials
    const credentials = await Keychain.getGenericPassword();
    if (credentials.username === 'refreshToken') {
      return credentials.password;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

const AuthLoading = () => {
  const [{ user, auth }, dispatch] = useStateValue();
  const { navigate } = useNavigation();

  useEffect(()=> {
    _bootstrapAsync()
    if (Platform.OS !== 'ios') listenForNotifications()
  }, [])

  const updateToken = async (devicetoken, auth, userid) => {
    //send up new token
    const data = {
      userid,
      devicetoken
    }
    try{
      await put(`${baseUrl}devices/`, auth, navigate, data)
    } catch (e){
      console.log(e)
    }
  }

  const notificationInit = async (auth, user) => {
    try{
      const hasOpened = await AsyncStorage.getItem('hasOpened')
      const hasPermissions = await Notifications.isRegisteredForRemoteNotifications()
      if(hasOpened && hasPermissions){
        registerForNotifications()
        listenForToken(auth, user)
      } else {
        navigate('App');
      }
    } catch(e) {
      console.log(e)
    }
  }

  const registerForNotifications = () => {
    Notifications.registerRemoteNotifications(); 
  }

  const listenForToken = (auth, user) => {
    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      const { deviceToken } = event;
      if(deviceToken && user.devicetoken !== deviceToken){
        updateToken(deviceToken, auth, user.id)
        navigate('App');
      } else {
        navigate('App');
      }
    });
  }

  const listenForNotifications = () => {
    Notifications.events().registerNotificationReceivedForeground(notification => {
      const { payload } = notification;
      if(payload){
        Notifications.postLocalNotification({
          title: payload.title,
          body: payload.message,
          icon: 'ic_stat_ic_notification'
        })
      }
    })
  }

  // Fetch the token from storage then navigate to our appropriate place
  const _bootstrapAsync = async () => {  
    try{
      const user = await AsyncStorage.getItem('user');
      const refreshToken = await getRefreshToken();

      if(user && refreshToken){
        const parsedUser = JSON.parse(user)

        dispatch({ type: 'saveUser', user: parsedUser })
        dispatch({ type: 'updateAuth', auth: refreshToken })

        notificationInit(refreshToken, parsedUser)
      }else{
        navigate('Auth');
      }
    } catch(e) {
      console.log(e)
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator />
      <StatusBar barStyle="default" />
    </View>
  );
};

export default AuthLoading;
