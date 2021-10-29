/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  StatusBar,
} from 'react-native';
import Navigation from './src/config/Navigation'
import { StateProvider } from './src/redux/state-context'
import { useDarkModeContext } from 'react-native-dark-mode'
import FlashMessage from "react-native-flash-message";

const initialState = {
  theme: { backgroundColor: '', textColor: '' },
  something: true,
  user: {},
  auth: ""
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'saveUser':
      return {
        ...state,
        user: action.user
      };
    case 'logoutUser':
      return {
        ...state,
        user: {},
        auth: {}
      }
    case 'changeTheme':
      return {
        ...state,
        theme: action.newTheme
      };
    case 'updateAuth':
      return {
        ...state,
        auth: action.auth
      };
    default:
      return state;
  }
};

const App = () => {
  const mode = useDarkModeContext();
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <StateProvider initialState={initialState} reducer={reducer}>
          <Navigation theme={mode} />
      </StateProvider>
      <FlashMessage position="top" />
    </>
  );
};

export default App;