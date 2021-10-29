import React, {useEffect, useState} from 'react';
import {SafeAreaView, FlatList, Alert} from 'react-native';
import {Title} from '@shoutem/ui';
import Post from '../components/Post';
import Empty from '../components/Empty';
import {baseUrl} from '../config/API';
import { useStateValue } from '../redux/state-context'
import { useNavigation } from 'react-navigation-hooks'
import { showMessage } from "react-native-flash-message";
import {get, post, deleet} from '../api/Http'

export default function Feed() {
  const [{ user, auth }] = useStateValue();
  const [isRefreshing, setRefreshing] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const { navigate } = useNavigation();

  useEffect(() => { updateFeed() }, []);

  const updateFeed = async () => {
    const { id } = user;
    try {
      setRefreshing(true);
      const posts = await get(`${baseUrl}posts/${id}`, auth, navigate);
      setRefreshing(false);
      setPosts(posts)
    } catch (error) {
      setRefreshing(false);
      showMessage({
        message: 'Oops',
        description: "Something went wrong getting feed",
        type: "error",
      });
    }
  };

  const goToProfile = profile => {
    navigate('Profile', {profile});
  };

  const handleLike = async (postid, index, isLiked) => {
    const body = {
      userid: user.id,
      postid
    }
    setLoading(true)
    const oldFeed = JSON.parse(JSON.stringify(posts));
    try {
      let newPosts = JSON.parse(JSON.stringify(posts));
      newPosts[index - 1].likes = isLiked ? Number(newPosts[index - 1].likes) - 1 :  Number(newPosts[index - 1].likes) + 1
      newPosts[index - 1].isliked = !isLiked

      setPosts(newPosts)
      let response = ''
      if (isLiked) response = await deleet(`${baseUrl}likes/${user.id}/${postid}`, auth, body);
      else response = await post(`${baseUrl}likes`, auth, navigate, body);
      setLoading(false)
      if(!response){
        throw Error()
      }
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
    return (
      <Post
        isLoading={isLoading}
        isFeed={true}
        item={item}
        goToProfile={goToProfile}
        profile={profile}
        handleLike={handleLike}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          onRefresh={updateFeed}
          refreshing={isRefreshing}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPost}
        />
      ) : (
        <Empty onRefresh={updateFeed} isRefreshing={isRefreshing} />
      )}
    </SafeAreaView>
  );
}

Feed.navigationOptions = ({theme}) => ({
  headerTitle: <Title style={{color: theme === 'dark' ? 'white' : 'black'}}>Home</Title>,
});

const styles = {
  container: {
    flex: 1,
  },
};