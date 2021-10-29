import React, { useState, useEffect } from 'react';
import {View, Dimensions} from 'react-native';
import {Title, Text, Image, Subtitle, TouchableOpacity} from '@shoutem/ui';
import moment from 'moment';
import Icon from 'react-native-vector-icons/AntDesign';
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, imageBackground, secondaryText } from '../styles/colors'

const {width} = Dimensions.get('window');

export default Post = ({
  isFeed,
  profile,
  goToProfile,
  handleLike,
  item,
  isLoading
}) => {
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const imageBackgroundColor = imageBackground[mode]
  const secondaryTextColor = secondaryText[mode]
  const [date, setDate] = useState('')
  
  useEffect(() => { getDate() }, [])

  const getDate = () => {
    let date = moment.utc(item.createddate).local(),
      now = moment.utc().local(),
      days = now.diff(date, "days"),
      weeks = now.diff(date, "weeks"),
      hours = now.diff(date, "hours"),
      minutes = now.diff(date, "minutes"),
      months = now.diff(date, "months"),
      result = "";

    if (minutes < 60){
      result += minutes + (minutes === 1 ? " minute " : " minutes");
    } else if (hours < 24 ){
      result += hours + (hours === 1 ? " hour " : " hours");
    } else if (days < 7) {
      result += days + (days === 1 ? " day" : " days");
    } else if (weeks < 4) {
      result += weeks + (weeks === 1 ? " week " : " weeks");
    } else if (months) {
      result += months + (months === 1 ? " month" : " months");
    } else {
      result = "Sometime"
    }
    setDate(result)
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isFeed && 
          <TouchableOpacity onPress={() => goToProfile(profile)} style={styles.userContainer}>
            <Image
              style={{...styles.avatarContainer, backgroundColor: imageBackgroundColor}}
              source={{uri: item.profileimage || ''}}
            />
            <Title style={{color: textColor}}>{item.username}</Title>
          </TouchableOpacity>}
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text style={{color: secondaryTextColor}}>
            {date} ago
          </Text>
        </View>
      </View>
      <Image style={{...styles.imageContainer, backgroundColor: imageBackgroundColor}} source={{uri: item.image}} />
      <View style={styles.bottomRow}>
        <Subtitle style={{color: textColor, flex: 0.9}}>{item.description}</Subtitle>
        <TouchableOpacity 
          disabled={isLoading}
          onPress={() => handleLike(item.id, item.index, item.isliked)}
          style={styles.likesContainer}>
          <Text style={{marginRight: 5, color: secondaryTextColor}}>{item.likes}</Text>
          <Icon name={item.isliked ? 'heart' : 'hearto'} size={25} color={item.isliked ? 'red' : secondaryTextColor} />
        </TouchableOpacity>
      </View>
    </View>
)};

const styles = {
  container: {
    marginBottom: 30,
    marginTop: 10,
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  imageContainer: {
    width,
    height: width,
    marginVertical: 10,
    backgroundColor: '#eee'
  },
  bottomRow: {
    marginHorizontal: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  likesContainer: {
    flexDirection: 'row',
    marginLeft: 15,
    flex: 0.1,
    alignItems: 'center'
  },
  avatarContainer: {
    height: 30,
    width: 30,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
};
