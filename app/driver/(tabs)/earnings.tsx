import { Colors } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DriverEarningsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Earnings</Text>
          <Text style={styles.balanceAmount}>₹1,240.50</Text>
          <Text style={styles.balanceSubtext}>This Week</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payouts</Text>
          
          <View style={styles.payoutItem}>
            <View>
              <Text style={styles.payoutDate}>Yesterday</Text>
              <Text style={styles.payoutId}>ID: #TRX-9982</Text>
            </View>
            <Text style={styles.payoutAmount}>+ ₹450.00</Text>
          </View>

          <View style={styles.payoutItem}>
            <View>
              <Text style={styles.payoutDate}>03 Jan 2026</Text>
              <Text style={styles.payoutId}>ID: #TRX-9921</Text>
            </View>
            <Text style={styles.payoutAmount}>+ ₹790.50</Text>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceSubtext: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
  },
  section: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  payoutDate: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  payoutId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
});
