import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MENU_ITEMS = [
  { icon: 'heart.fill', label: 'Saved Addresses', badge: null },
  { icon: 'questionmark.circle.fill', label: 'Help & Support', badge: null },
  { icon: 'doc.text.fill', label: 'GST Details', badge: null, action: 'Add GSTIN' },
  { icon: 'gift.fill', label: 'Refer and earn ₹200', badge: null, action: 'Invite' },
  { icon: 'briefcase.fill', label: 'Porter Enterprise', subLabel: 'Upgrade to Business Solution', badge: 'NEW' },
  { icon: 'bicycle', label: 'Join as Partner', subLabel: 'Drive & Earn with Porter', badge: null, route: '/driver' },
  { icon: 'gearshape.fill', label: 'Account Settings', badge: null },
  { icon: 'doc.plaintext', label: 'Terms & Conditions', badge: null },
  { icon: 'rectangle.portrait.and.arrow.right', label: 'Logout', badge: null },
];

export default function AccountScreen() {
  const router = useRouter();

  const handlePress = async (item: any) => {
    if (item.label === 'Logout') {
      await supabase.auth.signOut();
      return;
    }
    if (item.route) {
      router.replace(item.route);
      return;
    }
    Alert.alert(item.label, 'This action will be wired after the pitch demo.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Tanishq Dahiya</Text>
            <View style={styles.emailRow}>
              <Text style={styles.email}>tanishqd423@gmail.com</Text>
              <Text style={styles.verifyLink}>Verify</Text>
            </View>
            <TouchableOpacity style={styles.gstButton} onPress={() => Alert.alert('GST details', 'GST collection will be enabled in the next iteration.') }>
              <Text style={styles.gstButtonText}>+ Add GST Details</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Profile details', 'View and edit profile coming soon.')}>
            <Text style={styles.viewLink}>View {'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.gridItem} onPress={() => Alert.alert('Saved Addresses', 'Address book will be connected after demo deploy.') }>
            <IconSymbol name="heart.fill" size={24} color={Colors.light.primary} />
            <Text style={styles.gridLabel}>Saved Addresses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => Alert.alert('Help & Support', 'Support chat will be enabled soon.') }>
            <IconSymbol name="questionmark.circle.fill" size={24} color={Colors.light.primary} />
            <Text style={styles.gridLabel}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {MENU_ITEMS.slice(2).map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handlePress(item)}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <IconSymbol name={item.icon as any} size={20} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subLabel && <Text style={styles.menuSubLabel}>{item.subLabel}</Text>}
              </View>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              {item.action ? (
                <View style={styles.actionButton}>
                  {item.action === 'Invite' && <IconSymbol name="share" size={14} color="#0055FF" style={{marginRight: 4}} />}
                  <Text style={styles.actionButtonText}>{item.action}</Text>
                </View>
              ) : (
                <IconSymbol name="chevron.right" size={16} color="#ccc" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  verifyLink: {
    fontSize: 14,
    color: '#0055FF',
    fontWeight: '600',
  },
  gstButton: {
    borderWidth: 1,
    borderColor: '#0055FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  gstButtonText: {
    color: '#0055FF',
    fontWeight: '600',
    fontSize: 12,
  },
  viewLink: {
    color: '#0055FF',
    fontWeight: '600',
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  gridLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  menuItem: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  menuSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#FF9900',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0055FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: '#0055FF',
    fontWeight: '600',
    fontSize: 12,
  },
});
