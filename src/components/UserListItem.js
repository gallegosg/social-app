import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity, Text, Heading, Image } from '@shoutem/ui'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground, secondaryText } from '../styles/colors'

export default UserListItem = ({
    username,
    profileimage,
    profile,
    goToProfile
}) => {
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  
  return(
    <TouchableOpacity onPress={() => goToProfile(profile)} style={styles.container}>
      <Image style={{...styles.avatarContainer, backgroundColor: imageBackgroundColor}} source={{uri: profileimage || ''}} />
      <Heading style={{color: textColor}}>{username || ''}</Heading>
    </TouchableOpacity>
)};

const styles = {
  container: {
    marginVertical: 10,
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10
  }
}