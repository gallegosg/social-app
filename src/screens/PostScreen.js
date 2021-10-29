import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from 'react-navigation-hooks'
import { isEmpty } from '../helperFunctions'
import {get, deleet, post} from '../api/Http'
import { baseUrl } from '../config/API';
import { showMessage } from "react-native-flash-message";
import { useStateValue } from '../redux/state-context'

const PostScreen = (props) => {
  const [{ user, auth }] = useStateValue();
  const [displayPost, setPost] = useState({})
  const [profile, setProfile] = useState({})
  const { navigate } = useNavigation();

  useEffect(() => {
    const postid = props.navigation.getParam('postid', '')
    const userProfile = props.navigation.getParam('profile', '')
    // setPost(postToDisplay)
    setProfile(userProfile)
    getPost(postid)
  }, [])

  const getPost = async (postid) => {
    try{
      const updatedPost = await get(`${baseUrl}post/${user.id}/${postid}`, auth, navigate);
      setPost(updatedPost)
    } catch(error) {
      showMessage({
        message: 'Oops',
        description: "Something went wrong",
        type: "error",
      });
    }
  }

  const goToProfile = () => {
    navigate('Profile', {profile});
  };

  const handleLike = async (postid, index, isLiked) => {
    const body = {
      userid: user.id,
      postid
    }
    const oldPost = JSON.parse(JSON.stringify(displayPost));

    try {
      let newPost = JSON.parse(JSON.stringify(displayPost));
      newPost.likes = isLiked ? Number(newPost.likes) - 1 : Number(newPost.likes) + 1
      newPost.isliked = !isLiked
      setPost(newPost)
      let response = ''
      if (isLiked) response = await deleet(`${baseUrl}likes/${user.id}/${postid}`, auth, body);
      else response = await post(`${baseUrl}likes`, auth, navigate, body);
      
      if(!response){
        throw Error()
      }
    } catch (error) {
      setPost(oldPost)
      showMessage({
        message: 'Oops',
        description: "Something went wrong",
        type: "error",
      });
    }
  }

  return(
    <View style={{flex: 1}}>
      {!isEmpty(displayPost) && !isEmpty(profile) ?
        <Post
          isFeed={true}
          item={displayPost}
          goToProfile={goToProfile}
          profile={profile}
          handleLike={handleLike}
        /> :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
        </View>
      }
    </View>
  )
}

export default PostScreen;
