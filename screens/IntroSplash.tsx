import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';

const IntroSplash = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Splash'); // 2. ekrana geç
    }, 2000); // 2 saniye sonra

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6A500" />
      <Image
        source={require('../assets/qr.png')}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
};

export default IntroSplash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6A500', // sarı arka plan
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 180,
    height: 180,
  },
});
