import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    // Manual fallback: Insert into profiles if trigger didn't work or for robustness
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          user_type: userType,
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // If driver, create driver entry
      if (userType === 'driver') {
        await supabase.from('drivers').upsert({
          id: user.id,
          vehicle_type: 'Car', // Default
          is_online: false,
        });
      }
    }

    if (!session) Alert.alert('Please check your inbox for email verification!');
    else {
        router.replace('/');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity 
            style={[styles.typeButton, userType === 'customer' && styles.typeButtonActive]}
            onPress={() => setUserType('customer')}
        >
            <Text style={[styles.typeText, userType === 'customer' && styles.typeTextActive]}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.typeButton, userType === 'driver' && styles.typeButtonActive]}
            onPress={() => setUserType('driver')}
        >
            <Text style={[styles.typeText, userType === 'driver' && styles.typeTextActive]}>Driver</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="Full Name"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity style={styles.button} disabled={loading} onPress={signUpWithEmail}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  typeText: {
    color: '#666',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});
