import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>
      
      <View style={styles.tabs}>
        <Text style={[styles.tabText, styles.activeTab]}>Past</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.vehicleInfo}>
                  <IconSymbol name="car.fill" size={24} color={Colors.light.primary} />
                  <View style={styles.vehicleTextContainer}>
                    <Text style={styles.vehicleType}>Ride</Text>
                    <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>€{item.price}</Text>
                  <IconSymbol name="chevron.right" size={16} color="#666" />
                </View>
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                  <View style={[styles.dot, { backgroundColor: 'green' }]} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationName}>Pickup</Text>
                    <Text style={styles.address} numberOfLines={1}>
                      {item.pickup_latitude.toFixed(4)}, {item.pickup_longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.locationRow}>
                  <View style={[styles.dot, { backgroundColor: 'red' }]} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationName}>Dropoff</Text>
                    <Text style={styles.address} numberOfLines={1}>
                      {item.drop_latitude.toFixed(4)}, {item.drop_longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.statusContainer}>
                  <IconSymbol 
                    name={item.status === 'completed' ? 'checkmark.circle' : 'clock.fill'} 
                    size={16} 
                    color={item.status === 'completed' ? 'green' : 'orange'} 
                  />
                  <Text style={[styles.statusText, { color: item.status === 'completed' ? 'green' : 'orange' }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
                {/* <TouchableOpacity style={styles.bookAgainButton}>
                  <Text style={styles.bookAgainText}>Book Again</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background || '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.light.white || '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text || '#000',
  },
  tabs: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#eee',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTab: {
    fontWeight: 'bold',
    color: Colors.light.text || '#000',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary || 'blue',
    alignSelf: 'flex-start',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.light.white || '#fff',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleTextContainer: {
    marginLeft: 12,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text || '#000',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text || '#000',
    marginRight: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 3.5,
    marginVertical: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text || '#000',
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  bookAgainButton: {
    backgroundColor: '#0055FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookAgainText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
