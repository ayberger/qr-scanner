import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useHistoryStore } from '../context/HistoryContext';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { items, clear } = useHistoryStore();

  const renderIcon = (type: 'qr' | 'barcode' | 'document') => {
    switch (type) {
      case 'qr':
        return <Icon name="qrcode" size={18} color="#F6A500" />;
      case 'barcode':
        return <Icon name="barcode" size={18} color="#F6A500" />;
      case 'document':
        return <Icon name="file-alt" size={18} color="#F6A500" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.topBar}>
          <Icon
            name="arrow-left"
            size={22}
            color="#222"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>History</Text>

          {/* CLEAR BUTTON */}
          {items.length > 0 ? (
            <Text
              style={styles.clearText}
              onPress={clear}
            >
              Clear
            </Text>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* LIST */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            items.length === 0
              ? [styles.listContent, { flex: 1, justifyContent: 'center' }]
              : styles.listContent
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconWrapper}>
                {renderIcon(item.type)}
              </View>

              <View style={styles.textWrapper}>
                <Text numberOfLines={1} style={styles.valueText}>
                  {item.value}
                </Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Icon name="chevron-right" size={14} color="#9CA3AF" />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz kayıt yok.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  clearText: {
    fontSize: 14,
    color: '#F97316',
  },
  listContent: {
    paddingVertical: 10,
  },
  separator: {
    height: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrapper: {
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
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
});
