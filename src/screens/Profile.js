import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, View, Alert } from 'react-native';
import { Text, Button, Image, Title } from '@shoutem/ui'
import { baseUrl } from '../config/API'
import Post from '../components/Post'
import Empty from '../components/Empty'
import { useStateValue } from '../redux/state-context'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground } from '../styles/colors'
import { showMessage } from "react-native-flash-message";
import {get, put, deleet, post} from '../api/Http'
import { useNavigation } from 'react-navigation-hooks'

const initialState = {
  profile: {
    username: '',
    id: '',
    firstname: '',
    lastname: ''
  },
  profilePosts: [],
  isRefreshing: false
}

export default Profile = (props) => {
  const [{ user, auth }] = useStateValue();
  const [profile, setProfile] = useState(initialState.profile)
  const [profilePosts, setProfilePosts] = useState(initialState.profilePosts)
  const [isRefreshing, setRefreshing] = useState(initialState.isRefreshing)
  const [isLoading, setLoading] = useState(false)
  const isSelf = profile.id === user.id
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  const { navigate } = useNavigation();

  useEffect(() => {
    // get user profile
    const profile = props.navigation.getParam('profile', '')
    setProfile(profile)
    refreshProfile(profile.id)
  }, [])

  const refreshProfile = async (id = null) => {
    try {
      //update users profile
      const profId = id ? id : profile.id
      setRefreshing(true)
      //34/24
      const prof = await get(`${baseUrl}users/profile/${user.id}/${profId}`, auth, navigate)
      setProfile(prof[0])
      //get users posts
      const profilePosts = await get(`${baseUrl}posts/${user.id}/${profId}`, auth, navigate)

      setProfilePosts(profilePosts)
      setRefreshing(false)
    } catch (e) {
      setRefreshing(false)
      Alert.alert('Oops', 'Something went wrong')
    }
  }

  const handleFollow = async () => {
    const oldProfile = JSON.parse(JSON.stringify(profile))
    setLoading(true)
    try {
      let newProfile = JSON.parse(JSON.stringify(profile))
      newProfile.isfollowed = true
      setProfile(newProfile)

      await put(`${baseUrl}follows/${user.id}/${profile.id}`, auth, navigate)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setProfile(oldProfile)
      Alert.alert('Oops', 'Something went wrong following')
    }
  }
  
  const handleUnfollow = async () => {
    const oldProfile = JSON.parse(JSON.stringify(profile))
    setLoading(true)
    try {
      let newProfile = JSON.parse(JSON.stringify(profile))
      newProfile.isfollowed = false
      setProfile(newProfile)
      
      await deleet(`${baseUrl}follows/${user.id}/${profile.id}`, auth, navigate)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setProfile(oldProfile)
      Alert.alert('Oops', 'Something went wrong unfollowing')
    }
  }

  const handleLike = async (postid, index, isLiked) => {
    const body = {
      userid: user.id,
      postid
    }
    const oldFeed = JSON.parse(JSON.stringify(profilePosts));
    setLoading(true)
    try {
      const newPosts = JSON.parse(JSON.stringify(profilePosts));
      newPosts[index - 1].likes = isLiked ? Number(newPosts[index - 1].likes) - 1 :  Number(newPosts[index - 1].likes) + 1
      newPosts[index - 1].isliked = !isLiked
      setProfilePosts(newPosts)

      let response = ''
      if (isLiked) response = await deleet(`${baseUrl}likes/${user.id}/${postid}`, auth, body);
      else response = await post(`${baseUrl}likes`, auth, navigate, body);
      setLoading(false)
      if(!response) throw Error()
    } catch (error) {
      setLoading(false)
      setProfilePosts(oldFeed)
      showMessage({
        message: 'Oops',
        description: "Something went wrong",
        type: "error",
      });
    }
  }

  renderPost = ({item}) => {
    const profile = {
      username: item.username,
      image: item.image,
      profileimage: item.profileimage,
      id: item.userid,
      postid: item.id,
      index: item.index
    };
    return <Post 
      item={item}
      profile={profile}
      isLoading={isLoading}
      handleLike={handleLike}
    />
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Image style={{...styles.avatar, backgroundColor: imageBackgroundColor}} source={{uri: profile.profileimage || ''}} />
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-around'}}>
            {profile.followers && <Text style={{color: textColor, fontWeight: 'bold'}}>
                {profile.followers}
                <Text style={{color: textColor, fontWeight: 'normal'}}>  Followers</Text>
              </Text>}
            {profile.following && <Text style={{color: textColor, fontWeight: 'bold'}}>
                {profile.following}
                <Text style={{color: textColor, fontWeight: 'normal'}}>  Following</Text>
              </Text>}
          </View>
          {isSelf || <Button 
            disabled={isLoading}
            onPress={profile.isfollowed ? handleUnfollow : handleFollow} styleName="primary">
            <Text>{profile.isfollowed ? 'Unfollow' : 'Follow'}</Text>
          </Button>}
        </View>
        <View style={styles.bioContainer}>
          <Text style={{color: textColor}}>{profile.bio || ''}</Text> 
        </View>
      </View>
      {profilePosts.length > 0 ? <FlatList
        onRefresh={refreshProfile}
        refreshing={isRefreshing}
        data={profilePosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
      /> :
      <Empty onRefresh={refreshProfile} isRefreshing={isRefreshing} />
      }
    </SafeAreaView>
  );
}

Profile.navigationOptions = ({navigation, theme}) => {
  const username = navigation.getParam('profile', '').username;
  return {
    headerTitle: <Title style={{color: theme === 'dark' ? 'white' : 'black'}}>{username}</Title>,
  };
};

const styles = {
  container: {
    flex: 1,
  },
  header: {
    justifySelf: 'flex-start',
    paddingVertical: 20,
    marginBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    width: '100%',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  postContainer: {
    marginVertical: 10
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  topRow: {
    width: '100%',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bioContainer: {

  }
}