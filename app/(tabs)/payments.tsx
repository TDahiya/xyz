import { Colors } from '@/constants/theme';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Porter credits</Text>
          <Text style={styles.balanceAmount}>Balance: ₹0</Text>
        </View>
        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => Alert.alert('Coming soon', 'Wallet top-up will be available for the pitch demo.')}
        >
          <Text style={styles.addMoneyText}>Add Money</Text>
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
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 14,
    color: '#666',
  },
  addMoneyButton: {
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMoneyText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
