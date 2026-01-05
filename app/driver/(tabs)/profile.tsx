import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useDriver } from '@/contexts/DriverContext';
import { useRouter } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DriverProfileScreen() {
  const router = useRouter();
  const { isOnline, setIsOnline } = useDriver();

  const handleSwitchToCustomer = () => {
    // Navigate back to the main app (customer side)
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.fill" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>Tanishq Dahiya</Text>
        <Text style={styles.vehicle}>2 Wheeler • DL 12 AB 1234</Text>
        <View style={styles.ratingContainer}>
          <IconSymbol name="star.fill" size={16} color="#FFD700" />
          <Text style={styles.rating}>4.8</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <View style={styles.menuItem}>
          <IconSymbol name="power" size={24} color={isOnline ? "green" : "red"} />
          <Text style={styles.menuText}>Go Online</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isOnline ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsOnline(!isOnline)}
            value={isOnline}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="doc.text.fill" size={24} color={Colors.light.text} />
          <Text style={styles.menuText}>Documents</Text>
          <IconSymbol name="chevron.right" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="gearshape.fill" size={24} color={Colors.light.text} />
          <Text style={styles.menuText}>Settings</Text>
          <IconSymbol name="chevron.right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={handleSwitchToCustomer}>
          <IconSymbol name="arrow.triangle.2.circlepath" size={20} color="#fff" />
          <Text style={styles.switchButtonText}>Switch to Customer Mode</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  profileCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.light.white,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  vehicle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#FFA000',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
