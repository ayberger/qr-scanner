import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  const handleStart = () => {
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6A500" />

      {/* Logo kısmı */}
      <View style={styles.centerContainer}>
        <Image
          source={require('../assets/qr.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {/* Yazı + buton alt kısım */}
      <View style={styles.bottomContainer}>
        <Text style={styles.description}>
          Go and enjoy our features for free and make your life easy with us.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Let&apos;s Start</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6A500', // sarı
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 180,
    height: 180,
  },
  bottomContainer: {
    paddingBottom: 8,
  },
  description: {
    color: '#1f2933',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#262626',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
