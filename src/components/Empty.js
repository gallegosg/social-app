import React from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {Title} from '@shoutem/ui';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { useDarkModeContext } from 'react-native-dark-mode'
import { text } from '../styles/colors'

export default Empty = ({isRefreshing, onRefresh}) => {
  const mode = useDarkModeContext();
  const textColor = text[mode]
  return (
    <ScrollView
      contentContainerStyle={{
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }>
      <View
        style={{
          flex: 0.3,
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
        }}>
        <Icon name={'ghost'} size={75} color={textColor} />
        <Title
          style={{
            fontSize: 25,
            width: '75%',
            color: textColor,
            alignItems: 'flex-end',
            textAlign: 'center',
          }}>
          Looks like theres nothing here yet
        </Title>
      </View>
    </ScrollView>
)};