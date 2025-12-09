import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Vibration,      
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
import { OCR_SPACE_API_KEY } from '@env';
import { showNotification } from '../utils/notification';
import notifee from '@notifee/react-native';



const uploadImageToOcr = async (imagePath: string): Promise<string> => {
  // Android'de çoğu zaman file:// prefix'i gerekiyor
  const uri =
    Platform.OS === 'android' && !imagePath.startsWith('file:')
      ? `file://${imagePath}`
      : imagePath;

  const formData = new FormData();

  // 📁 Dökümana uygun dosya alanı
  formData.append('file', {
    uri,
    name: 'document.jpg',
    type: 'image/jpeg',
  } as any);

  // 🔤 Dil ayarı (Türkçe için 3 harfli kod: "tur")
  formData.append('language', 'tur');

  // 🧠 Engine, scale, orientation parametreleri
  formData.append('OCREngine', '2');          // Foto için genelde daha iyi
  formData.append('scale', 'true');           // Düşük çözünürlükte iyileştirir
  formData.append('detectOrientation', 'true');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: {
      apikey: OCR_SPACE_API_KEY,             // 🔑 API key artık HEADER'da
    },
    body: formData,
  });

  console.log('OCR HTTP STATUS:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.log('OCR HTTP ERROR BODY:', text);
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();
  console.log('OCR RAW JSON:', JSON.stringify(json, null, 2));

  if (json.IsErroredOnProcessing) {
    const err =
      json.ErrorMessage?.toString?.() ||
      json.ErrorDetails?.toString?.() ||
      'OCR.space işlem hatası';
    console.log('OCR PROCESSING ERROR:', err);
    throw new Error(err);
  }

  const results = json.ParsedResults as any[] | undefined;

  if (!results || results.length === 0) {
    console.log('OCR boş ParsedResults döndürdü.');
    return '';
  }

  const parsedText = results
    .map((r: any) => (r.ParsedText || '').trim())
    .filter((t: string) => t.length > 0)
    .join('\n')
    .trim();

  console.log('OCR PARSED TEXT:', parsedText);

  return parsedText;
};


type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialModeFromRoute = route?.params?.initialMode;
  const [mode, setMode] = useState<ScanMode>(initialModeFromRoute ?? 'qr');

  // kamera izni
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModeMenuVisible, setIsModeMenuVisible] = useState(false);

  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera | null>(null);

  const { addItem } = useHistoryStore();
  const isFocused = useIsFocused();
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const lastScanTimeRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);


  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'], // QR + Barkod destekli
    onCodeScanned: async (codes) => {
      const value = codes[0]?.value?.trim();
      if (!value) return;

      if (mode !== 'qr' && mode !== 'barcode') {
        return;
      }

      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;

      try {
        const now = Date.now();

        // 🔁 Aynı kodu 3 saniye içinde tekrar görürsek yok say
        if (
          value === lastScannedCode &&
          lastScanTimeRef.current !== null &&
          now - lastScanTimeRef.current < 3000
        ) {
          return;
        }

        setLastScannedCode(value);
        lastScanTimeRef.current = now;

        // 1) History'e kaydet
        addItem(mode, value);

        // 2) Titreşim
        Vibration.vibrate(150);

        // 3) Üstten telefon bildirimi
        await showNotification(
          mode === 'qr' ? 'QR Kod Okundu' : 'Barkod Okundu',
          value,
        );
      } finally {
        // İşlem bitti, yeni okumalara izin ver
        isProcessingRef.current = false;
      }
    },
  });

  useEffect(() => {
    notifee.requestPermission();
  }, []);

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
          try {
            // Fotoğrafı OCR API'ye gönder
            const extractedText = (await uploadImageToOcr((photo.path))).trim();

            if (!extractedText) {
              // Metin bulunamadı → yine de kayıt al
              addItem(
                'document',
                'Metin bulunamadı (sadece görsel kaydedildi, daha net bir fotoğrafla tekrar dene).',
              );
              Alert.alert(
                'Metin bulunamadı',
                'Belge üzerinde okunabilir bir metin tespit edilemedi. Daha net bir fotoğrafla tekrar deneyebilirsin.',
              );
            } else {
              // Metin bulundu → History'ye yaz
              addItem('document', extractedText);
              Vibration.vibrate(200);

              await showNotification(
                'Belge Okundu',
                'Belge başarıyla tarandı ve geçmişe kaydedildi.'
              );

            }
          } catch (e) {
            console.error('OCR API hata:', e);
            addItem('document', 'OCR sırasında bir hata oluştu.');
            Alert.alert(
              'OCR hatası',
              'Belge okunurken bir hata oluştu. Daha sonra tekrar dene.',
            );
          }

          // document modu için akış burada bitiyor, diğer "else if (mode === 'qr' ...)" kısmına düşmesin
          return;
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Hata', 'Görsel alınırken bir hata oluştu.');
      } finally {
        setIsCapturing(false);
      }
  }, [addItem, device, hasPermission, mode]);
  
  
  const handleToggleModeMenu = useCallback(() => {
    setIsModeMenuVisible((prev) => !prev);
  }, []);

          
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
        {isModeMenuVisible && (
          <View style={styles.modeMenu}>
            {[
              { key: 'qr' as ScanMode, label: 'QR' },
              { key: 'barcode' as ScanMode, label: 'Barkod' },
              { key: 'document' as ScanMode, label: 'Belge' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => {
                  setMode(option.key);
                  setIsModeMenuVisible(false);
                }}
                style={[
                  styles.modeMenuItem,
                  mode === option.key && styles.modeMenuItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeMenuItemText,
                    mode === option.key && styles.modeMenuItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && { opacity: 0.6 }]}
          disabled={isCapturing}
          onPress={handleCapture}
          onLongPress={handleToggleModeMenu} // UZUN BAS: menüyü aç/kapa
          delayLongPress={400}             // 0.4 sn basılı tut
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
    height: 550,
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
    position: 'relative',
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
  modeMenu: {
    position: 'absolute',
    bottom: 125,              // butonun biraz üstünde
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
},
  modeMenuItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  modeMenuItemActive: {
    backgroundColor: '#FFB100',
  },
  modeMenuItemText: {
    fontSize: 13,
    color: '#333',
  },
  modeMenuItemTextActive: {
    color: '#000',
    fontWeight: '600',
  },

});
