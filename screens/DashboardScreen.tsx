import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ScanMode } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState<ScanMode>('qr');

  const handleSelectMode = (mode: ScanMode) => {
    setSelectedMode(mode);
    navigation.navigate('Home', { initialMode: mode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedMode === 'qr' && styles.tabActive,
          ]}
          onPress={() => handleSelectMode('qr')}
        >
          <Text
            style={[
              styles.tabText,
              selectedMode === 'qr' && styles.tabTextActive,
            ]}
          >
            QR Okuma
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedMode === 'barcode' && styles.tabActive,
          ]}
          onPress={() => handleSelectMode('barcode')}
        >
          <Text
            style={[
              styles.tabText,
              selectedMode === 'barcode' && styles.tabTextActive,
            ]}
          >
            Barkod Okuma
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedMode === 'document' && styles.tabActive,
          ]}
          onPress={() => handleSelectMode('document')}
        >
          <Text
            style={[
              styles.tabText,
              selectedMode === 'document' && styles.tabTextActive,
            ]}
          >
            Belge Okuma
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        {selectedMode === 'qr' &&
          'QR kodları kameradan veya galeriden okuyabilirsiniz.'}
        {selectedMode === 'barcode' &&
          'Ürün barkodlarını hızlıca tarayabilirsiniz.'}
        {selectedMode === 'document' &&
          'Belge veya fişleri net bir şekilde çekebilirsiniz.'}
      </Text>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFB100',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  infoText: {
    marginTop: 24,
    color: '#777',
    fontSize: 14,
  },
});
