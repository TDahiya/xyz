import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useDriver } from '@/contexts/DriverContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverHomeScreen() {
  const { isOnline } = useDriver();
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigateToProfile = () => {
    router.push('/driver/profile');
  };

  const fetchAvailableRides = async () => {
    if (!isOnline) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'searching')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRides(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOnline) {
      fetchAvailableRides();
      
      const subscription = supabase
        .channel('rides')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => {
          setRides((prev) => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setRides([]);
    }
  }, [isOnline]);

  const acceptRide = async (rideId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('rides')
      .update({ status: 'accepted', driver_id: user.id })
      .eq('id', rideId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Ride accepted!');
      fetchAvailableRides();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isOnline ? styles.headerOnline : styles.headerOffline]}>
        <Text style={styles.statusText}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
      </View>

      <View style={styles.content}>
        {isOnline ? (
          rides.length > 0 ? (
            <FlatList
              data={rides}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.fare}>Fare: €{item.price}</Text>
                    <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
                  </View>
                  
                  <View style={styles.locationRow}>
                    <IconSymbol name="location.fill" size={16} color="green" />
                    <Text style={styles.locationText}>Pickup: {item.pickup_latitude.toFixed(4)}, {item.pickup_longitude.toFixed(4)}</Text>
                  </View>
                  
                  <View style={styles.locationRow}>
                    <IconSymbol name="flag.fill" size={16} color="red" />
                    <Text style={styles.locationText}>Dropoff: {item.drop_latitude.toFixed(4)}, {item.drop_longitude.toFixed(4)}</Text>
                  </View>

                  <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRide(item.id)}>
                    <Text style={styles.acceptButtonText}>Accept Ride</Text>
                  </TouchableOpacity>
                </View>
              )}
              refreshing={loading}
              onRefresh={fetchAvailableRides}
            />
          ) : (
            <View style={styles.waitingContainer}>
              <View style={styles.radarContainer}>
                <IconSymbol name="location.fill" size={60} color={Colors.light.primary} />
                <View style={styles.pulseRing} />
              </View>
              <Text style={styles.waitingTitle}>Finding Trips...</Text>
              <Text style={styles.waitingSubtitle}>Stay in high demand areas to get more orders.</Text>
            </View>
          )
        ) : (
          <View style={styles.offlineContainer}>
            <IconSymbol name="bicycle" size={80} color="#ccc" />
            <Text style={styles.offlineTitle}>Go Online to start earning</Text>
            <TouchableOpacity style={styles.goOnlineButton} onPress={navigateToProfile}>
              <Text style={styles.goOnlineText}>GO TO PROFILE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isOnline && rides.length === 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹0</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerOnline: {
    backgroundColor: Colors.light.primary,
  },
  headerOffline: {
    backgroundColor: '#333',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
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
    marginBottom: 12,
  },
  fare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  radarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    opacity: 0.5,
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  goOnlineButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  goOnlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
});
