import React from 'react';
import {TextInput} from '@shoutem/ui'
import { useDarkModeContext } from 'react-native-dark-mode'
import { text, textInput } from '../styles/colors'

export default CustomTextInput = ({
    value,
    multiline,
    maxLength,
    placeholder,
    returnKeyType,
    onChangeText,
    style,
    blurOnSubmit
}) => {
  const mode = useDarkModeContext();
  const textColor = text[mode]
  const textInputColor = textInput[mode]
  return (
    <TextInput
      value={value}
      style={{...style, backgroundColor: textInputColor, color: textColor, borderWidth: 0}}
      multiline={multiline}
      maxLength={maxLength}
      blurOnSubmit={blurOnSubmit}
      placeholder={placeholder}
      returnKeyType={returnKeyType}
      onChangeText={(text) => onChangeText(text)}
    />
)};
