import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings, RatesConfig } from '../types';
import { StatsOverview } from '../components/StatsOverview';
import { PassCard } from '../components/PassCard';
import { getTimeDifferenceText } from '../services/storage';

interface DashboardScreenProps {
  passes: ParkingPass[];
  settings: ParkingSettings;
  rates: RatesConfig;
  language: 'hi' | 'en';
  onViewSlip: (pass: ParkingPass) => void;
  onCheckout: (pass: ParkingPass) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNewEntry: () => void;
  onOpenRates: () => void;
  onOpenApkGuide: () => void;
  onNavigateToAllPasses: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  passes,
  settings,
  rates,
  language,
  onViewSlip,
  onCheckout,
  onRefresh,
  isRefreshing,
  onOpenNewEntry,
  onOpenRates,
  onOpenApkGuide,
  onNavigateToAllPasses,
}) => {
  const [selectedForecastFilter, setSelectedForecastFilter] = useState<string>('all');

  // Filtered passes based on the selected expiry forecast
  const displayedPasses = useMemo(() => {
    const activePasses = passes.filter((p) => p.status !== 'completed');
    const now = Date.now();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const endOfTodayMs = endOfToday.getTime();

    switch (selectedForecastFilter) {
      case 'expired':
        return activePasses.filter((p) => new Date(p.expiryTime).getTime() <= now);
      case 'next_2h':
        return activePasses.filter((p) => {
          const diff = new Date(p.expiryTime).getTime() - now;
          return diff > 0 && diff <= 2 * 3600 * 1000;
        });
      case 'next_6h':
        return activePasses.filter((p) => {
          const diff = new Date(p.expiryTime).getTime() - now;
          return diff > 2 * 3600 * 1000 && diff <= 6 * 3600 * 1000;
        });
      case 'today':
        return activePasses.filter((p) => {
          const expiryMs = new Date(p.expiryTime).getTime();
          return expiryMs > now && expiryMs <= endOfTodayMs;
        });
      case 'next_3d':
        return activePasses.filter((p) => {
          const diff = new Date(p.expiryTime).getTime() - now;
          return diff > 0 && diff <= 3 * 24 * 3600 * 1000;
        });
      case 'monthly':
        return activePasses.filter((p) => {
          const diff = new Date(p.expiryTime).getTime() - now;
          return diff > 3 * 24 * 3600 * 1000;
        });
      case 'all':
      default:
        return activePasses;
    }
  }, [passes, selectedForecastFilter]);

  const activeCount = passes.filter((p) => p.status !== 'completed').length;

  return (
    <FlatList
      data={displayedPasses}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563EB']} />
      }
      ListHeaderComponent={
        <View>
          {/* Top Analytics and Expiry Timeline */}
          <StatsOverview
            passes={passes}
            settings={settings}
            language={language}
            selectedForecastFilter={selectedForecastFilter}
            onSelectForecastFilter={setSelectedForecastFilter}
            onOpenNewEntry={onOpenNewEntry}
          />

          {/* Quick Action Shortcuts Bar */}
          <View style={styles.quickShortcuts}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={onOpenRates}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetag" size={16} color="#2563EB" />
              <Text style={styles.shortcutText}>
                {language === 'hi' ? 'रेट बदलें' : 'Manage Rates'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={onOpenApkGuide}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-android" size={16} color="#10B981" />
              <Text style={styles.shortcutText}>
                {language === 'hi' ? 'APK गाइड' : 'APK Guide'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={onNavigateToAllPasses}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={16} color="#7C3AED" />
              <Text style={styles.shortcutText}>
                {language === 'hi' ? 'सभी पास' : 'All Passes'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {selectedForecastFilter === 'all'
                  ? language === 'hi'
                    ? `पार्क की गई गाड़ियां (${displayedPasses.length})`
                    : `Active Parked Vehicles (${displayedPasses.length})`
                  : language === 'hi'
                  ? `फिल्टर अनुसार गाड़ियां (${displayedPasses.length})`
                  : `Filtered Vehicles (${displayedPasses.length})`}
              </Text>
              {selectedForecastFilter !== 'all' && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => setSelectedForecastFilter('all')}
                >
                  <Text style={styles.clearFilterText}>
                    {language === 'hi' ? 'फ़िल्टर हटाएं ✕' : 'Clear Filter ✕'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.sectionSubtitle}>
              {language === 'hi'
                ? 'गाड़ी नंबर, ग्राहक विवरण और शेष समय लाइव देखें:'
                : 'Live status, timer countdowns and ticket actions:'}
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <PassCard
            pass={item}
            settings={settings}
            rates={rates}
            language={language}
            onViewSlip={onViewSlip}
            onCheckout={onCheckout}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {language === 'hi' ? 'इस श्रेणी में कोई वाहन नहीं है' : 'No vehicles in this group'}
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setSelectedForecastFilter('all')}
          >
            <Text style={styles.emptyActionText}>
              {language === 'hi' ? 'सभी गाड़ियां देखें' : 'View All Parked'}
            </Text>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  quickShortcuts: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  clearFilterBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardWrapper: {
    paddingHorizontal: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyActionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
