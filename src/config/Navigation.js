import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Feed from '../screens/Feed'
import UserProfile from '../screens/UserProfile'
import NewPost from '../screens/NewPost'
import Search from '../screens/Search'
import Profile from '../screens/Profile'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import SignIn from '../screens/SignIn'
import AuthLoading from '../screens/AuthLoading'
import Settings from '../screens/Settings'
import SignUp from '../screens/SignUp'
import PostScreen from '../screens/PostScreen'

const defaultNavigationOptions = {
  headerBackTitle: null,
  headerTintColor: '#444',
  borderWidth: 0,
  headerStyle: {
    borderBottomWidth: 0,
    elevation: 0
  }
}

const searchStack = createStackNavigator(
  {
    Search,
    Profile,
    PostScreen
  },
  {
    defaultNavigationOptions
  }
)
const feedStack = createStackNavigator(
  {
    Feed,
    Profile,
  },
  {
    defaultNavigationOptions
  }
)

const userProfileStack = createStackNavigator(
  {
    UserProfile,
    Settings,
  },
  {
    defaultNavigationOptions
  }
)
const newPostStack = createStackNavigator(
  {
    NewPost,
  },
  {
    defaultNavigationOptions
  }
)

const TabNavigator = createBottomTabNavigator({
  Feed: feedStack,
  Search: searchStack,
  NewPost: newPostStack,
  UserProfile: userProfileStack
},
{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Feed') {
        iconName = 'home';
      } else if (routeName === 'UserProfile') {
        iconName = `user`;
      } else if (routeName === 'Search') {
        iconName = `magnifier`;
      } else if (routeName === 'NewPost') {
        iconName = `plus`;
      }
      return <Icon name={iconName} size={25} color={tintColor} />;
    }
  }),
  tabBarOptions: {
    activeTintColor: '#444',
    inactiveTintColor: 'lightgray',
    showLabel: false
  },
});

const AuthStack = createStackNavigator({ 
  SignIn: {
    screen: SignIn,
    navigationOptions: {
      header: null
    }
  },
  SignUp: {
    screen: SignUp,
    navigationOptions: {
      header: null
    }
  }
});

const Navigation = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading,
      App: TabNavigator,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
);

export default Navigation;