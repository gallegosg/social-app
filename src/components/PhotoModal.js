import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@shoutem/ui'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import Modal from 'react-native-modal'
const PhotoModal = ({
    isVisible,
    toggleModal,
    openCameraRoll,
    openCamera
}) => (
  <View>
    <Modal 
      animationIn={"zoomInUp"}
      animationOut={"zoomOutUp"}
      animationOutTiming={300}
      backdropOpacity={0.5}
      onBackdropPress={toggleModal}
      isVisible={isVisible}>
      <View style={{ backgroundColor: '#eee', paddingVertical: 20, borderRadius: 5 }}>
        <View style={styles.iconsContainer}>
          <TouchableOpacity onPress={openCamera} style={styles.iconContainer}>
            <Icon name="camera" size={50} color="#555" />
            <Text>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openCameraRoll} style={styles.iconContainer}>
            <Icon name="picture" size={50} color="#555" />
            <Text>Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);

export default PhotoModal;

const styles = {
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  iconContainer: {

  }
}