import React, {useState, useEffect} from 'react';
import {SafeAreaView, FlatList, View, Alert} from 'react-native';
import {Text, Image, Button, Title} from '@shoutem/ui';
import {baseUrl} from '../config/API';
import Post from '../components/Post';
import Empty from '../components/Empty';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { useStateValue } from '../redux/state-context'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground } from '../styles/colors'
import {get, post, deleet} from '../api/Http'
import { useNavigation } from 'react-navigation-hooks'

export default UserProfile = () => {
  const [{ user, auth }, dispatch] = useStateValue();
  const [isLoading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [isRefreshing, setRefreshing] = useState(false)
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  const { navigate } = useNavigation();

  useEffect(() => { getPosts() }, [])

  const getPosts = async () => {
    try {
      setRefreshing(true)
      
      const prof = await get(`${baseUrl}users/profile/${user.id}/${user.id}`, auth, navigate)
      if (prof) dispatch({ type: 'saveUser', user: prof[0] })
      const posts = await get(`${baseUrl}posts/${user.id}/${user.id}`, auth, navigate);
      setPosts(posts)
      setRefreshing(false)
    } catch (error) {
      setRefreshing(false)
      Alert.alert('Oops', 'Something went wrong getting');
    }
  };

  const handleLike = async (postid, index, isLiked) => {
    const body = {
      userid: user.id,
      postid
    }

    const oldFeed = JSON.parse(JSON.stringify(posts));
    setLoading(true)
    try {
      const newPosts = JSON.parse(JSON.stringify(posts));
      newPosts[index - 1].likes = isLiked ? Number(newPosts[index - 1].likes) - 1 :  Number(newPosts[index - 1].likes) + 1
      newPosts[index - 1].isliked = !isLiked

      setPosts(newPosts)

      let response = ''

      if (isLiked) response = await deleet(`${baseUrl}likes/${user.id}/${postid}`, auth, body, navigate);
      else response = await post(`${baseUrl}likes`, auth, navigate, body);
      setLoading(false)
      if(!response) throw Error()
    } catch (error) {
      setLoading(false)
      setPosts(oldFeed)
      showMessage({
        message: 'Oops',
        description: "Something went wrong",
        type: "error",
      });
    }
  }

  const renderPost = ({item}) => {
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
      handleLike={handleLike}
      isLoading={isLoading}
    />
  };

    const {bio, profileimage, thumbnail} = user;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Image
              style={{...styles.avatar, backgroundColor: imageBackgroundColor}}
              source={{uri: thumbnail || profileimage || ''}}
            />
            {user.followers && <Text style={{color: textColor, fontWeight: 'bold'}}>
              {user.followers}
              <Text style={{color: textColor, fontWeight: 'normal'}}>  Followers</Text>
              </Text>}
              {user.following && <Text style={{color: textColor, fontWeight: 'bold'}}>
              {user.following}
              <Text style={{color: textColor, fontWeight: 'normal'}}>  Following</Text>
              </Text>}
          </View>
          <View style={styles.bioContainer}>
            <Text style={{color: textColor}}>{bio || ''}</Text>
          </View>
        </View>
        {posts.length > 0 ? (
          <FlatList
            data={posts}
            refreshing={isRefreshing}
            onRefresh={getPosts}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPost}
          />
        ) : (
          <Empty onRefresh={getPosts} isRefreshing={isRefreshing} />
        )}
      </SafeAreaView>
    );
}

UserProfile.navigationOptions = ({navigation, theme}) => {
  return {
    headerTitle: <Title style={{color: theme === 'dark' ? 'white' : 'black'}}>Me</Title>,
    headerRight: (
      <Button style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
        <Icon name={'settings'} size={25} color={'#888'}/>
      </Button>
    ),
  };
};

const styles = {
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginVertical: 15,
    paddingLeft: 15,
    paddingRight: 15,
    width: '100%',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  postContainer: {
    marginVertical: 10,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  topRow: {
    width: '100%',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    marginRight: 5,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  }
};
