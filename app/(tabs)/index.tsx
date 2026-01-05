import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { calculateFare } from '@/utils/fareCalculator';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

type Step = 'PICKUP' | 'DROPOFF' | 'RIDE_OPTIONS' | 'CONFIRM';

type VehicleOption = {
  id: 'bike' | 'car' | 'truck';
  label: string;
  multiplier: number;
  eta: string;
  blurb: string;
};

const VEHICLES: VehicleOption[] = [
  { id: 'bike', label: 'Bike', multiplier: 1, eta: '5-7 min', blurb: 'Small parcels, fastest pickup' },
  { id: 'car', label: 'Car', multiplier: 1.35, eta: '8-10 min', blurb: 'Bigger boot, safer packaging' },
  { id: 'truck', label: 'Truck', multiplier: 2, eta: '15-18 min', blurb: 'Heavy loads and pallets' },
];

const DUBLIN_REGION: Region = {
  latitude: 53.349805,
  longitude: -6.26031,
  latitudeDelta: 0.042,
  longitudeDelta: 0.022,
};

export default function HomeScreen() {
  const [region, setRegion] = useState<Region>(DUBLIN_REGION);
  const [pickup, setPickup] = useState<Region | null>(DUBLIN_REGION);
  const [dropoff, setDropoff] = useState<Region | null>(null);
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [dropoffAddress, setDropoffAddress] = useState('Set dropoff on map');
  const [step, setStep] = useState<Step>('PICKUP');
  const [loading, setLoading] = useState(false);
  const [fareDetails, setFareDetails] = useState<{ price: number; distanceKm: number; surgeMultiplier: number } | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(VEHICLES[0]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('driver_id, latitude, longitude');

      if (!error && data) setDrivers(data);
    };

    fetchDrivers();

    const channel = supabase
      .channel('public:driver_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, fetchDrivers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPickupAddress('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.042,
        longitudeDelta: 0.022,
      };

      setRegion(userRegion);
      setPickup(userRegion);

      const [address] = await Location.reverseGeocodeAsync({ latitude: userRegion.latitude, longitude: userRegion.longitude });
      if (address) {
        setPickupAddress(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim());
      }
    })();
  }, []);

  const onRegionChangeComplete = (nextRegion: Region) => {
    setRegion(nextRegion);
  };

  const confirmPickup = async () => {
    setPickup(region);
    const [address] = await Location.reverseGeocodeAsync({ latitude: region.latitude, longitude: region.longitude });
    if (address) setPickupAddress(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim());
    setStep('DROPOFF');
  };

  const confirmDropoff = async () => {
    setDropoff(region);
    const [address] = await Location.reverseGeocodeAsync({ latitude: region.latitude, longitude: region.longitude });
    if (address) setDropoffAddress(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim());
    await computeFare(region);
    setStep('RIDE_OPTIONS');
  };

  const computeFare = async (drop: Region) => {
    if (!pickup) return;
    setLoading(true);

    const { count: activeDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true);

    const { count: activeRequests } = await supabase
      .from('rides')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'searching');

    const driverCount = activeDrivers ?? 0;
    const requestCount = activeRequests ?? 0;

    const details = calculateFare(
      pickup.latitude,
      pickup.longitude,
      drop.latitude,
      drop.longitude,
      driverCount || 1,
      requestCount,
    );

    setFareDetails(details);
    setLoading(false);
  };

  const findNearestOnlineDriver = async () => {
    if (!pickup) return null;

    const { data: onlineDrivers, error: onlineError } = await supabase
      .from('drivers')
      .select('id')
      .eq('is_online', true);

    if (onlineError || !onlineDrivers || onlineDrivers.length === 0) return null;

    const driverIds = onlineDrivers.map((d) => d.id).filter(Boolean);
    if (!driverIds.length) return null;

    const { data: locations, error: locationsError } = await supabase
      .from('driver_locations')
      .select('driver_id, latitude, longitude')
      .in('driver_id', driverIds);

    if (locationsError || !locations || locations.length === 0) return null;

    let nearest: { driver_id: string; latitude: number; longitude: number; distanceKm: number } | null = null;

    for (const loc of locations) {
      const distanceKm = haversineDistance(pickup.latitude, pickup.longitude, loc.latitude, loc.longitude);
      if (!nearest || distanceKm < nearest.distanceKm) {
        nearest = { ...loc, distanceKm };
      }
    }

    return nearest;
  };

  const assignDriver = async (rideId: string) => {
    const nearest = await findNearestOnlineDriver();
    if (!nearest) return null;

    const { data, error } = await supabase
      .from('rides')
      .update({
        driver_id: nearest.driver_id,
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', rideId)
      .select('driver_id')
      .single();

    if (error) {
      console.error('Assign driver error', error);
      return null;
    }

    return { driverId: data?.driver_id, distanceKm: nearest.distanceKm };
  };

  const requestRide = async () => {
    if (!pickup || !dropoff || !fareDetails) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in before requesting a ride.');
        setLoading(false);
        return;
      }

      const finalPrice = parseFloat((fareDetails.price * selectedVehicle.multiplier).toFixed(2));

      const { data: ride, error } = await supabase
        .from('rides')
        .insert({
          customer_id: user.id,
          pickup_latitude: pickup.latitude,
          pickup_longitude: pickup.longitude,
          drop_latitude: dropoff.latitude,
          drop_longitude: dropoff.longitude,
          status: 'searching',
          price: finalPrice,
          distance_km: fareDetails.distanceKm,
          vehicle_type: selectedVehicle.label,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const assignment = await assignDriver(ride.id);

      if (assignment?.driverId) {
        Alert.alert('Driver assigned', 'A nearby driver accepted your ride.');
      } else {
        Alert.alert('Ride requested', 'Searching for available drivers...');
      }

      resetFlow();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not request ride.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('PICKUP');
    setDropoff(null);
    setDropoffAddress('Set dropoff on map');
    setSelectedVehicle(VEHICLES[0]);
  };

  const finalPrice = useMemo(() => {
    if (!fareDetails) return null;
    return parseFloat((fareDetails.price * selectedVehicle.multiplier).toFixed(2));
  }, [fareDetails, selectedVehicle]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DUBLIN_REGION}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
      >
        {pickup && <Marker coordinate={pickup} pinColor="green" title="Pickup" />}
        {dropoff && <Marker coordinate={dropoff} pinColor="red" title="Dropoff" />}
        {drivers.map((driver) => (
          <Marker
            key={driver.driver_id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title="Driver"
            pinColor={Colors.light.secondary}
          />
        ))}
      </MapView>

      <View style={styles.centerMarker} pointerEvents="none">
        <IconSymbol
          name={step === 'PICKUP' ? 'location.fill' : 'flag.fill'}
          size={44}
          color={step === 'PICKUP' ? Colors.light.secondary : '#D9534F'}
        />
      </View>

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.stepPill}>{stepLabel(step)}</Text>
          <TouchableOpacity onPress={resetFlow} style={styles.resetButton}>
            <IconSymbol name="xmark.circle" size={18} color={Colors.light.primary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: Colors.light.secondary }]} />
            <View style={styles.addressTextBlock}>
              <Text style={styles.addressLabel}>Pickup</Text>
              <Text style={styles.addressValue} numberOfLines={1}>{pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: '#D9534F' }]} />
            <View style={styles.addressTextBlock}>
              <Text style={styles.addressLabel}>Dropoff</Text>
              <Text style={styles.addressValue} numberOfLines={1}>{dropoffAddress}</Text>
            </View>
          </View>
        </View>

        {step === 'PICKUP' && (
          <PrimaryButton label="Confirm pickup here" onPress={confirmPickup} />
        )}

        {step === 'DROPOFF' && (
          <PrimaryButton label="Confirm dropoff here" onPress={confirmDropoff} loading={loading} />
        )}

        {step === 'RIDE_OPTIONS' && (
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose your Porter</Text>
            <View style={styles.vehicleRow}>
              {VEHICLES.map((vehicle) => {
                const active = vehicle.id === selectedVehicle.id;
                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[styles.vehicleCard, active && styles.vehicleCardActive]}
                    onPress={() => setSelectedVehicle(vehicle)}
                  >
                    <View style={styles.vehicleHeader}>
                      <Text style={[styles.vehicleLabel, active && styles.vehicleLabelActive]}>{vehicle.label}</Text>
                      <Text style={[styles.vehicleEta, active && styles.vehicleLabelActive]}>{vehicle.eta}</Text>
                    </View>
                    <Text style={styles.vehicleBlurb}>{vehicle.blurb}</Text>
                    {fareDetails && (
                      <Text style={[styles.vehiclePrice, active && styles.vehicleLabelActive]}>
                        €{(fareDetails.price * vehicle.multiplier).toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <PrimaryButton label={`Continue with ${selectedVehicle.label}`} onPress={() => setStep('CONFIRM')} />
          </View>
        )}

        {step === 'CONFIRM' && fareDetails && finalPrice !== null && (
          <View style={styles.sheet}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Vehicle</Text>
                <Text style={styles.summaryValue}>{selectedVehicle.label}</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Distance</Text>
                <Text style={styles.summaryValue}>{fareDetails.distanceKm} km</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Surge</Text>
                <Text style={styles.summaryValue}>x{fareDetails.surgeMultiplier}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Estimated fare</Text>
              <Text style={styles.priceValue}>€{finalPrice.toFixed(2)}</Text>
            </View>

            <PrimaryButton label={`Request ${selectedVehicle.label}`} onPress={requestRide} loading={loading} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('RIDE_OPTIONS')} disabled={loading}>
              <Text style={styles.secondaryButtonText}>Change vehicle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function stepLabel(step: Step) {
  switch (step) {
    case 'PICKUP':
      return 'Set pickup';
    case 'DROPOFF':
      return 'Set dropoff';
    case 'RIDE_OPTIONS':
      return 'Choose vehicle';
    case 'CONFIRM':
      return 'Confirm ride';
    default:
      return '';
  }
}

function PrimaryButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </TouchableOpacity>
  );
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '42%',
    left: '50%',
    marginLeft: -22,
    marginTop: -22,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepPill: {
    backgroundColor: Colors.light.primary,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 14,
  },
  resetText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressTextBlock: {
    flex: 1,
  },
  addressLabel: {
    color: '#6A7685',
    fontSize: 12,
    fontWeight: '600',
  },
  addressValue: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E8EC',
    marginVertical: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  sheet: {
    backgroundColor: Colors.light.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vehicleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E6EE',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  vehicleCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EAF0F7',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vehicleLabel: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  vehicleLabelActive: {
    color: Colors.light.primary,
  },
  vehicleEta: {
    fontSize: 12,
    color: '#6A7685',
  },
  vehicleBlurb: {
    color: '#6A7685',
    fontSize: 12,
    marginBottom: 8,
  },
  vehiclePrice: {
    fontWeight: '800',
    color: Colors.light.text,
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#6A7685',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: Colors.light.text,
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E8EC',
  },
  priceLabel: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  priceValue: {
    color: Colors.light.primary,
    fontWeight: '900',
    fontSize: 20,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
