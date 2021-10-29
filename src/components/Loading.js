import React from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal'
import LottieView from 'lottie-react-native';

const Loading = ({
    isLoading,
}) => (
  <View>
    <Modal 
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      backdropOpacity={0.4}
      backdropColor={'#fff'}
      isVisible={isLoading}>
        <LottieView 
          style={styles.loading}
          source={require('../assets/loading.json')} autoPlay loop />
    </Modal>
  </View>
);

export default Loading;

const styles = {
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  loading: {
    width: 200,
    alignSelf: 'center',
  }
}