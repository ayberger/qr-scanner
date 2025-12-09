import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useHistoryStore } from '../context/HistoryContext';
import type { HistoryItem } from '../context/HistoryContext';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { items, clear } = useHistoryStore();

  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClear = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Temizle',
      'Tüm geçmişi silmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          style: 'destructive',
          onPress: () => clear(),
        },
      ],
    );
  };

  const handleItemPress = (item: HistoryItem) => {
    if (item.type === 'document' || item.type === 'barcode') {
      // 📄 Belge: detay modalı aç
      setSelectedItem(item);
      return;
    }

    // 🔗 QR: linke git
    const raw = item.value.trim();

    // basit bir URL normalizasyonu
    const hasProtocol =
      raw.startsWith('http://') || raw.startsWith('https://');
    const url = hasProtocol ? raw : `https://${raw}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Bağlantı açılamadı',
        'Bu kayıt geçerli bir URL değil gibi görünüyor.',
      );
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isDocument = item.type === 'document';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.iconWrapper}>
          <Icon
            name={
              item.type === 'qr'
                ? 'qrcode'
                : item.type === 'barcode'
                ? 'barcode'
                : 'file-alt'
            }
            size={20}
            color="#F59E0B"
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={styles.valueText}
            numberOfLines={1}
          >
            {item.value}
          </Text>
          <Text style={styles.dateText}>{item.date}</Text>
          {isDocument && (
            <Text style={styles.documentBadge}>Belge metni</Text>
          )}
        </View>

        <Icon name="chevron-right" size={14} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Üst bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleBack}
        >
          <Icon name="arrow-left" size={18} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>History</Text>

        <TouchableOpacity
          onPress={handleClear}
          disabled={items.length === 0}
        >
          <Text
            style={[
              styles.clearText,
              items.length === 0 && { opacity: 0.3 },
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <View style={styles.content}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>
            Henüz bir kayıt yok. QR, barkod veya belge taradığında burada
            görünecek.
          </Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </View>

      {/* 📄 Belge detayı için modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Belge Detayı</Text>
            <Text style={styles.modalDate}>
              {selectedItem?.date}
            </Text>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                {selectedItem?.value}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerIconButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateText: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  documentBadge: {
    marginTop: 4,
    fontSize: 11,
    color: '#2563EB',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 24,
  },
  // Modal stilleri
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  modalScroll: {
    marginTop: 12,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#111827',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default HistoryScreen;
