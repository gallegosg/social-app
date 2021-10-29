import React, { useState, useEffect } from 'react';
import {  View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import {  Image } from '@shoutem/ui';
import { useDarkMode } from 'react-native-dark-mode'
import { useNavigation } from 'react-navigation-hooks'
import {get} from '../api/Http'
import { baseUrl } from '../config/API';
import { useStateValue } from '../redux/state-context'

const { width } = Dimensions.get('window');

const Discover = ({ photos }) => {
  const [{ user, auth }] = useStateValue();
  const isDarkMode = useDarkMode();
  const [discoverPhotos, setDiscoverPhotos] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const backgroundColor = isDarkMode ? 'black' : 'white';
  const { navigate } = useNavigation();


  useEffect(() => { getDiscoverPhotos() }, [])

  const getDiscoverPhotos = async () => {
    try{
      setIsRefreshing(true);
      const photos = await get(`${baseUrl}discover/${user.id}`, auth, navigate)
      setDiscoverPhotos(photos)
      setIsRefreshing(false);

    } catch (error) {
      setIsRefreshing(false);
    }
  }

  const goToPost = post => {
    const profile = {
      username: post.username,
      image: post.image,
      profileimage: post.profileimage,
      id: post.userid,
      postid: post.id,
      index: post.index
    };
    navigate('PostScreen', {postid: post.id, profile});
  };

  const renderPhoto = ({item}) => {
    return(
      <TouchableOpacity
        onPress={() => goToPost(item)}
        style={{...styles.photoContainer, borderColor: backgroundColor}}>
        <Image 
            style={styles.photo}
            source={{uri: item.thumbnail || item.image || ''}}
        />
      </TouchableOpacity>
    )
  }

  return(
    <View style={styles.container}>
      <FlatList
        horizontal={false}
        numColumns={3}
        onRefresh={getDiscoverPhotos}
        refreshing={isRefreshing}
        data={discoverPhotos}
        renderItem={renderPhoto}
      />
    </View>
)};

export default Discover;

const styles = {
  container: {
    flex: 1
  },
  photoContainer: {
    width: width / 3,
    height: width / 3,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: '#aaa'
  },
  photo: {
    width: '100%',
    height: '100%'
  }
}