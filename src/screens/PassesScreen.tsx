import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings, RatesConfig, VehicleType } from '../types';
import { PassCard } from '../components/PassCard';
import { getTimeDifferenceText } from '../services/storage';

interface PassesScreenProps {
  passes: ParkingPass[];
  settings: ParkingSettings;
  rates: RatesConfig;
  language: 'hi' | 'en';
  onViewSlip: (pass: ParkingPass) => void;
  onCheckout: (pass: ParkingPass) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNewEntry: () => void;
}

export const PassesScreen: React.FC<PassesScreenProps> = ({
  passes,
  settings,
  rates,
  language,
  onViewSlip,
  onCheckout,
  onRefresh,
  isRefreshing,
  onOpenNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'completed'>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'all' | VehicleType>('all');

  // Filtered passes calculation
  const filteredPasses = useMemo(() => {
    return passes.filter((pass) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesPlate = pass.vehicleNumber.toLowerCase().includes(q);
        const matchesName = pass.customerName.toLowerCase().includes(q);
        const matchesPhone = pass.phoneNumber.includes(q);
        const matchesSlot = pass.slotNumber.toLowerCase().includes(q);
        const matchesToken = pass.tokenNumber.toString().includes(q);
        if (!matchesPlate && !matchesName && !matchesPhone && !matchesSlot && !matchesToken) {
          return false;
        }
      }

      // Vehicle type filter
      if (vehicleTypeFilter !== 'all' && pass.vehicleType !== vehicleTypeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'all') return true;

      const isCompleted = pass.status === 'completed';
      if (statusFilter === 'completed') return isCompleted;
      if (isCompleted) return false;

      const timeInfo = getTimeDifferenceText(pass.expiryTime, language);
      if (statusFilter === 'expired') return timeInfo.isExpired;
      if (statusFilter === 'expiring') return timeInfo.isUrgent;
      if (statusFilter === 'active') return !timeInfo.isExpired && !timeInfo.isUrgent;

      return true;
    });
  }, [passes, searchQuery, statusFilter, vehicleTypeFilter, language]);

  // Counts for pills
  const counts = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;
    let completed = 0;

    passes.forEach((p) => {
      if (p.status === 'completed') {
        completed++;
      } else {
        const info = getTimeDifferenceText(p.expiryTime, language);
        if (info.isExpired) expired++;
        else if (info.isUrgent) expiring++;
        else active++;
      }
    });

    return { all: passes.length, active, expiring, expired, completed };
  }, [passes, language]);

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            language === 'hi'
              ? 'गाड़ी नंबर, ग्राहक का नाम या मोबाइल खोजें...'
              : 'Search vehicle plate, customer or phone...'
          }
          placeholderTextColor="#94A3B8"
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Vehicle Type Row */}
      <View style={styles.vehicleTypeFilterRow}>
        <TouchableOpacity
          style={[
            styles.typeFilterBtn,
            vehicleTypeFilter === 'all' && styles.typeFilterBtnActive,
          ]}
          onPress={() => setVehicleTypeFilter('all')}
        >
          <Text
            style={[
              styles.typeFilterText,
              vehicleTypeFilter === 'all' && styles.typeFilterTextActive,
            ]}
          >
            {language === 'hi' ? 'सभी प्रकार' : 'All Types'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilterBtn,
            vehicleTypeFilter === 'bike' && styles.typeFilterBtnActive,
          ]}
          onPress={() => setVehicleTypeFilter('bike')}
        >
          <Text
            style={[
              styles.typeFilterText,
              vehicleTypeFilter === 'bike' && styles.typeFilterTextActive,
            ]}
          >
            🏍️ {language === 'hi' ? 'बाइक' : 'Bikes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilterBtn,
            vehicleTypeFilter === 'cycle' && styles.typeFilterBtnActive,
          ]}
          onPress={() => setVehicleTypeFilter('cycle')}
        >
          <Text
            style={[
              styles.typeFilterText,
              vehicleTypeFilter === 'cycle' && styles.typeFilterTextActive,
            ]}
          >
            🚲 {language === 'hi' ? 'साइकिल' : 'Cycles'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilterBtn,
            vehicleTypeFilter === 'car' && styles.typeFilterBtnActive,
          ]}
          onPress={() => setVehicleTypeFilter('car')}
        >
          <Text
            style={[
              styles.typeFilterText,
              vehicleTypeFilter === 'car' && styles.typeFilterTextActive,
            ]}
          >
            🚗 {language === 'hi' ? 'कार' : 'Cars'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.statusTabsRow}>
        <TouchableOpacity
          style={[styles.statusTab, statusFilter === 'all' && styles.statusTabActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text
            style={[
              styles.statusTabText,
              statusFilter === 'all' && styles.statusTabTextActive,
            ]}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({counts.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTab,
            statusFilter === 'active' && styles.statusTabActive,
          ]}
          onPress={() => setStatusFilter('active')}
        >
          <Text
            style={[
              styles.statusTabText,
              statusFilter === 'active' && styles.statusTabTextActive,
            ]}
          >
            🟢 {language === 'hi' ? 'सक्रिय' : 'Active'} ({counts.active})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTab,
            statusFilter === 'expiring' && styles.statusTabActive,
          ]}
          onPress={() => setStatusFilter('expiring')}
        >
          <Text
            style={[
              styles.statusTabText,
              statusFilter === 'expiring' && styles.statusTabTextActive,
            ]}
          >
            🟡 {language === 'hi' ? 'जल्द समाप्त' : 'Expiring'} ({counts.expiring})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTab,
            statusFilter === 'expired' && styles.statusTabActive,
          ]}
          onPress={() => setStatusFilter('expired')}
        >
          <Text
            style={[
              styles.statusTabText,
              statusFilter === 'expired' && styles.statusTabTextActive,
            ]}
          >
            🔴 {language === 'hi' ? 'समय समाप्त' : 'Expired'} ({counts.expired})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTab,
            statusFilter === 'completed' && styles.statusTabActive,
          ]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text
            style={[
              styles.statusTabText,
              statusFilter === 'completed' && styles.statusTabTextActive,
            ]}
          >
            ⚪ {language === 'hi' ? 'निकाला' : 'Exited'} ({counts.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pass List */}
      <FlatList
        data={filteredPasses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PassCard
            pass={item}
            settings={settings}
            rates={rates}
            language={language}
            onViewSlip={onViewSlip}
            onCheckout={onCheckout}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-sport-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>
              {language === 'hi' ? 'कोई गाड़ी नहीं मिली' : 'No Vehicles Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {language === 'hi'
                ? 'दिए गए फ़िल्टर या खोज के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।'
                : 'No vehicles match your search or filter criteria.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={onOpenNewEntry}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>
                {language === 'hi' ? 'नया वाहन दर्ज करें' : 'Add New Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  vehicleTypeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  typeFilterBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeFilterBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  typeFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typeFilterTextActive: {
    color: '#FFFFFF',
  },
  statusTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 10,
  },
  statusTab: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTabActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statusTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyActionBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
