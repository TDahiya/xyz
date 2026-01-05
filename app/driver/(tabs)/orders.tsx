import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const REQUESTS = [
  {
    id: '1',
    distance: '2.5 km',
    pickup: 'Rani Bagh, Pitampura',
    drop: 'Rohini Sector 3',
    price: '₹85',
    time: '15 min',
  },
  {
    id: '2',
    distance: '5.1 km',
    pickup: 'Punjabi Bagh',
    drop: 'Rajouri Garden',
    price: '₹140',
    time: '25 min',
  },
];

export default function DriverOrdersScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Requests</Text>
      </View>

      <FlatList
        data={REQUESTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>New Request</Text>
              </View>
              <Text style={styles.price}>{item.price}</Text>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: 'green' }]} />
                <Text style={styles.address} numberOfLines={1}>{item.pickup}</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: 'red' }]} />
                <Text style={styles.address} numberOfLines={1}>{item.drop}</Text>
              </View>
            </View>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <IconSymbol name="map.fill" size={16} color="#666" />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol name="clock.fill" size={16} color="#666" />
                <Text style={styles.metaText}>{item.time}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.rejectButton}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No new requests nearby.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#0055FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  verticalLine: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginLeft: 3.5,
    marginVertical: 2,
  },
  address: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  rejectText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
