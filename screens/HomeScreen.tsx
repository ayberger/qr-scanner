import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCodeScanner } from 'react-native-vision-camera';
import type { RootStackParamList, ScanMode } from '../App';
import { useHistoryStore } from '../context/HistoryContext';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialModeFromRoute = route?.params?.initialMode;
  const [mode, setMode] = useState<ScanMode>(initialModeFromRoute ?? 'qr');

  // kamera izni
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera | null>(null);

  const { addItem } = useHistoryStore();
  const isFocused = useIsFocused();

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'], // QR + Barkod destekli
    onCodeScanned: (codes) => {
      const value = codes[0]?.value;
      if (!value) return;

      // History kaydı
      addItem(mode, value);

      if (mode === 'qr') Alert.alert('QR OKUNDU', value);
      if (mode === 'barcode') Alert.alert('BARKOD OKUNDU', value);

      // Gerekirse otomatik reset
      // setMode('qr');
    },
  });

  // Uygulama açılırken sadece mevcut izin durumunu kontrol et
  useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      const statusStr = String(status);
      console.log('İlk izin durumu:', statusStr);

      const isAuthorized =
        statusStr === 'authorized' ||
        statusStr === 'granted' ||
        statusStr === 'limited';

      setHasPermission(isAuthorized);
    };

    checkPermission();
  }, []);

  // Butona basınca izin isteme
  const requestCameraPermission = useCallback(async () => {
    console.log('İzin Ver butonuna basıldı');

    const status = await Camera.requestCameraPermission();
    const statusStr = String(status);
    console.log('İzin sonucu:', statusStr);

    const isAuthorized =
      statusStr === 'authorized' ||
      statusStr === 'granted' ||
      statusStr === 'limited';

    setHasPermission(isAuthorized);

    if (!isAuthorized) {
      Alert.alert(
        'Kamera Engellendi',
        'Lütfen Ayarlar > Uygulamalar > Kameraya izin ver.'
      );
    }
  }, []);

  // Dashboard'dan gelen modu state'e yansıt
  useEffect(() => {
    if (route?.params?.initialMode) {
      setMode(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  const handleCapture = useCallback(
    async () => {
      if (!cameraRef.current || !hasPermission || !device) {
        return;
      }

      try {
        setIsCapturing(true);

        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });

        const now = new Date().toLocaleString('tr-TR');

        if (mode === 'document') {
          addItem('document', photo.path);
          Alert.alert('Belge Kaydedildi', 'Belge resmi kaydedildi.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Hata', 'Görsel alınırken bir hata oluştu.');
      } finally {
        setIsCapturing(false);
      }
    },
    [addItem, device, hasPermission, mode]
  );

  const getModeTitle = () => {
    switch (mode) {
      case 'qr':
        return 'QR Tarama';
      case 'barcode':
        return 'Barkod Tarayıcı';
      case 'document':
        return 'Belge Tarama';
      default:
        return 'QR Tarama';
  }
};


  const renderModeDescription = () => {
    switch (mode) {
      case 'qr':
        return 'QR kodları kameradan veya galeriden okuyabilirsiniz.';
      case 'barcode':
        return 'Ürün barkodlarını hızlıca tarayabilirsiniz.';
      case 'document':
        return 'Belge veya fişleri net bir şekilde çekebilirsiniz.';
      default:
        return '';
    }
  };

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#000' }}>Kamera bulunamadı.</Text>
      </View>
    );
  }

  // İzin henüz belli değilken basit bir loading gösterebiliriz
  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#000' }}>Kamera izni kontrol ediliyor...</Text>
      </View>
    );
  }

  // İzin reddedildiyse
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Kamerayı kullanmak için izin vermen gerekiyor.
        </Text>

        <TouchableOpacity
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Icon name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{getModeTitle()}</Text>

        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Icon name="history" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Kamera kutusu */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused && !!hasPermission}
          photo={true}
          codeScanner={codeScanner}
        />

        <View style={styles.scanFrame} />
      </View>

      {/* Mod gösterim metni */}
      <Text style={styles.description}>{renderModeDescription()}</Text>

      {/* Çekim butonu */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && { opacity: 0.6 }]}
          disabled={isCapturing}
          onPress={handleCapture}
        >
          <View style={styles.innerCapture} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F6F6F6',
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFB100',
    borderRadius: 999,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  cameraContainer: {
    marginTop: 32,
    borderRadius: 24,
    overflow: 'hidden',
    height: 260,
    backgroundColor: '#000',
  },
  scanFrame: {
    flex: 1,
    margin: 32,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFB100',
  },
  description: {
    marginTop: 24,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  bottomControls: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFB100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCapture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFB100',
  },
});
