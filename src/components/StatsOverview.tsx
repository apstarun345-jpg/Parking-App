import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings, ExpiryForecastGroup } from '../types';
import { calculateExpiryForecast } from '../services/storage';

interface StatsOverviewProps {
  passes: ParkingPass[];
  settings: ParkingSettings;
  language: 'hi' | 'en';
  selectedForecastFilter: string;
  onSelectForecastFilter: (filterId: string) => void;
  onOpenNewEntry: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  passes,
  settings,
  language,
  selectedForecastFilter,
  onSelectForecastFilter,
  onOpenNewEntry,
}) => {
  const activePasses = passes.filter((p) => p.status !== 'completed');

  // Counts by vehicle type
  const bikeCount = activePasses.filter((p) => p.vehicleType === 'bike').length;
  const cycleCount = activePasses.filter((p) => p.vehicleType === 'cycle').length;
  const carCount = activePasses.filter((p) => p.vehicleType === 'car').length;
  const totalParked = activePasses.length;

  const totalCapacity =
    settings.totalCapacity.bike +
    settings.totalCapacity.cycle +
    settings.totalCapacity.car +
    settings.totalCapacity.other;

  const occupancyPercent = Math.min(100, Math.round((totalParked / Math.max(1, totalCapacity)) * 100));

  // Financial calculations
  // Today's total passes
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let todayRevenue = 0;
  let cashRevenue = 0;
  let upiRevenue = 0;
  let pendingDues = 0;

  passes.forEach((pass) => {
    const entryDateMs = new Date(pass.createdAt || pass.entryTime).getTime();
    const isToday = entryDateMs >= todayMs;

    if (isToday) {
      todayRevenue += pass.amountPaid;
      if (pass.paymentMode === 'cash') cashRevenue += pass.amountPaid;
      if (pass.paymentMode === 'upi') upiRevenue += pass.amountPaid;
      if (pass.paymentStatus === 'pending') {
        pendingDues += pass.amountCharged - pass.amountPaid;
      }
    }
  });

  const forecastGroups = calculateExpiryForecast(passes, language);

  return (
    <View style={styles.wrapper}>
      {/* Top 3 Quick Metric Cards */}
      <View style={styles.statsRow}>
        {/* Card 1: Currently Parked */}
        <View style={[styles.statCard, { borderLeftColor: '#3B82F6', borderLeftWidth: 4 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.statLabel}>
              {language === 'hi' ? 'कुल खड़ी गाड़ियां' : 'Parked Now'}
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="car-outline" size={18} color="#2563EB" />
            </View>
          </View>
          <View style={styles.countRow}>
            <Text style={styles.bigCount}>{totalParked}</Text>
            <Text style={styles.capacityText}>/ {totalCapacity} slots</Text>
          </View>
          <View style={styles.vehiclePills}>
            <Text style={styles.miniPill}>🏍️ {bikeCount}</Text>
            <Text style={styles.miniPill}>🚲 {cycleCount}</Text>
            <Text style={styles.miniPill}>🚗 {carCount}</Text>
          </View>
        </View>

        {/* Card 2: Today's Collection */}
        <View style={[styles.statCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.statLabel}>
              {language === 'hi' ? 'आज की कमाई' : "Today's Collection"}
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="cash-outline" size={18} color="#059669" />
            </View>
          </View>
          <Text style={[styles.bigCount, { color: '#047857' }]}>₹{todayRevenue}</Text>
          <View style={styles.splitRow}>
            <Text style={styles.subDetail}>
              💵 नकद: <Text style={styles.boldText}>₹{cashRevenue}</Text>
            </Text>
            <Text style={styles.subDetail}>
              📱 UPI: <Text style={styles.boldText}>₹{upiRevenue}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Capacity Progress Bar */}
      <View style={styles.capacityBarContainer}>
        <View style={styles.capacityBarHeader}>
          <Text style={styles.capacityBarLabel}>
            {language === 'hi' ? 'पार्किंग क्षमता उपयोग:' : 'Parking Occupancy:'}
          </Text>
          <Text style={styles.capacityBarValue}>{occupancyPercent}% full</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${occupancyPercent}%`,
                backgroundColor:
                  occupancyPercent > 85 ? '#EF4444' : occupancyPercent > 60 ? '#F59E0B' : '#10B981',
              },
            ]}
          />
        </View>
      </View>

      {/* "Kitne ghante ya din me kitne pass pure honge" Section Header */}
      <View style={styles.forecastHeader}>
        <View style={styles.forecastTitleRow}>
          <Ionicons name="time" size={19} color="#2563EB" />
          <Text style={styles.forecastTitle}>
            {language === 'hi'
              ? 'पास कब पूरे होंगे? (समय अनुसार स्थिति)'
              : 'Pass Expiry Timeline (Hours & Days)'}
          </Text>
        </View>
        <Text style={styles.forecastSubtitle}>
          {language === 'hi'
            ? 'नीचे किसी भी समय पर टैप करके उस समय समाप्त होने वाली गाड़ियां देखें:'
            : 'Tap any duration below to filter vehicles expiring then:'}
        </Text>
      </View>

      {/* Horizontal Scrollable Timeline Forecast Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.forecastChipsScroll}
      >
        {forecastGroups.map((group) => {
          const isSelected = selectedForecastFilter === group.id;
          return (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.forecastChip,
                isSelected && {
                  borderColor: group.color,
                  backgroundColor: `${group.color}15`,
                  borderWidth: 2,
                },
              ]}
              onPress={() => onSelectForecastFilter(group.id)}
              activeOpacity={0.7}
            >
              <View style={styles.chipTopRow}>
                <View
                  style={[
                    styles.chipBadge,
                    { backgroundColor: group.color },
                  ]}
                >
                  <Text style={styles.chipCount}>{group.count}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={14} color={group.color} />
                )}
              </View>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && { color: group.color, fontWeight: '700' },
                ]}
                numberOfLines={2}
              >
                {language === 'hi' ? group.labelHi : group.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quick Action Button: New Entry */}
      <TouchableOpacity
        style={styles.floatingEntryBtn}
        onPress={onOpenNewEntry}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.floatingEntryBtnText}>
          {language === 'hi' ? '+ नया वाहन दर्ज करें (New Entry)' : '+ New Vehicle Entry'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  bigCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  capacityText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  vehiclePills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  miniPill: {
    fontSize: 11,
    color: '#334155',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
  },
  splitRow: {
    flexDirection: 'column',
    gap: 2,
    marginTop: 4,
  },
  subDetail: {
    fontSize: 11,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  capacityBarContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  capacityBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capacityBarLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  capacityBarValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  track: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  forecastHeader: {
    marginTop: 2,
    marginBottom: 8,
  },
  forecastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  forecastChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  forecastChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 105,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chipBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  chipCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 14,
  },
  floatingEntryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingEntryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
