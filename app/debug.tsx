import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DUBLIN_CENTER = {
  latitude: 53.349805,
  longitude: -6.26031,
};

export default function DebugScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const seedDrivers = async () => {
    setLoading(true);
    setStatus('Starting seed process...');

    try {
      // 1. Sign out current user
      await supabase.auth.signOut();

      const drivers = [
        { email: 'driver1@test.com', name: 'John Driver', lat: 53.35, lng: -6.26 },
        { email: 'driver2@test.com', name: 'Sarah Driver', lat: 53.34, lng: -6.25 },
        { email: 'driver3@test.com', name: 'Mike Driver', lat: 53.36, lng: -6.27 },
      ];

      for (const d of drivers) {
        setStatus(`Creating ${d.name}...`);
        
        // Sign Up
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email: d.email,
          password: 'password123',
          options: {
            data: { full_name: d.name, user_type: 'driver' }
          }
        });

        if (signUpError) {
            console.log(`Error creating ${d.email}:`, signUpError.message);
            // Continue if user already exists
        }

        if (user) {
            // Ensure Profile
            await supabase.from('profiles').upsert({
                id: user.id,
                full_name: d.name,
                user_type: 'driver'
            });

            // Ensure Driver Entry
            await supabase.from('drivers').upsert({
                id: user.id,
                vehicle_type: 'Sedan',
                vehicle_model: 'Toyota Prius',
                license_plate: '123-D-456',
                is_online: true
            });

            // Set Location
            await supabase.from('driver_locations').upsert({
                driver_id: user.id,
                latitude: d.lat,
                longitude: d.lng,
                heading: 0
            });
        }
        
        // Sign out to prepare for next
        await supabase.auth.signOut();
      }

      setStatus('Done! All drivers created.');
      Alert.alert('Success', '3 Drivers created in Dublin. Log in with your customer account now.');

    } catch (e: any) {
      Alert.alert('Error', e.message);
      setStatus('Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug / Seed Data</Text>
      <Text style={styles.subtitle}>
        This tool will sign you out and create 3 test drivers in Dublin.
      </Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={seedDrivers} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Seed 3 Drivers</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 20,
    height: 40,
  },
  status: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
