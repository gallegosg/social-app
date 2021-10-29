import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { TextInput, Title } from '@shoutem/ui'
import { debounce } from 'lodash'
import UserListItem from '../components/UserListItem'
import { useNavigation } from 'react-navigation-hooks'
import { useStateValue } from '../redux/state-context'
import {get} from '../api/Http'
import { baseUrl } from '../config/API';
import Discover from '../components/Discover'

export default Search = () => {
  const [{ user, auth }] = useStateValue();
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { navigate } = useNavigation();

  goToProfile = (profile) => navigate('Profile', { profile });

  renderPost = ({item}) => (
    <UserListItem 
      username={item.username}
      profile={item}
      goToProfile={this.goToProfile}
      profileimage={item.profileimage} />
  )

  handleTypeSearch = debounce((searchQuery) => {
    setSearchQuery(searchQuery)
    if(searchQuery.length > 2){
      this.searchUsers(searchQuery)
    }
  }, 500)

  searchUsers = async (searchQuery) => {
    try {
      const result = await get(`${baseUrl}users/search/${user.id}/${searchQuery.toLowerCase()}`, auth, navigate)
      setSearchResults(result)
    } catch (error) {
      console.error(error)
    }
  } 

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={{backgroundColor: '#eee', width: '100%'}}
        placeholder={'Search...'}
        onChangeText={this.handleTypeSearch}
      />
      {searchQuery.length > 0 ? <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={this.renderPost}
      /> : <Discover/>}
    </SafeAreaView>
  );
}

Search.navigationOptions = ({theme}) => ({
  headerTitle: <Title style={{color: theme === 'dark' ? 'white' : 'black'}}>Discover</Title>,
});

const styles = {
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  postContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
  }
}