import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings, RatesConfig } from '../types';
import { getTimeDifferenceText, calculateOverdueFee } from '../services/storage';
import { formatDateTimeNice, openWhatsApp, makePhoneCall, generateExpiryAlertWhatsAppMessage } from '../utils/whatsapp';

interface PassCardProps {
  pass: ParkingPass;
  settings: ParkingSettings;
  rates: RatesConfig;
  language: 'hi' | 'en';
  onViewSlip: (pass: ParkingPass) => void;
  onCheckout: (pass: ParkingPass) => void;
}

export const PassCard: React.FC<PassCardProps> = ({
  pass,
  settings,
  rates,
  language,
  onViewSlip,
  onCheckout,
}) => {
  const isCompleted = pass.status === 'completed';
  const timeInfo = getTimeDifferenceText(pass.expiryTime, language);
  const overdueFee = !isCompleted && timeInfo.isExpired ? calculateOverdueFee(pass, rates) : 0;

  // Vehicle type icon & name
  const vehicleConfig = {
    bike: {
      icon: 'bicycle-outline' as const,
      labelHi: 'बाइक / 2W',
      labelEn: 'Bike',
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    cycle: {
      icon: 'bicycle-outline' as const,
      labelHi: 'साइकिल',
      labelEn: 'Cycle',
      color: '#059669',
      bgColor: '#ECFDF5',
    },
    car: {
      icon: 'car-sport-outline' as const,
      labelHi: 'कार / 4W',
      labelEn: 'Car',
      color: '#7C3AED',
      bgColor: '#F5F3FF',
    },
    other: {
      icon: 'bus-outline' as const,
      labelHi: 'ऑटो / अन्य',
      labelEn: 'Other',
      color: '#D97706',
      bgColor: '#FFFBEB',
    },
  }[pass.vehicleType] || {
    icon: 'car-outline' as const,
    labelHi: 'वाहन',
    labelEn: 'Vehicle',
    color: '#4B5563',
    bgColor: '#F3F4F6',
  };

  const durationNameMap = {
    '12h': language === 'hi' ? '12 घंटे' : '12 Hours',
    '24h': language === 'hi' ? '24 घंटे' : '24 Hours',
    'monthly': language === 'hi' ? 'मासिक (30 दिन)' : 'Monthly (30d)',
    'quarterly': language === 'hi' ? 'तिमाही (90 दिन)' : 'Quarterly (90d)',
    'custom': `${pass.customDurationValue || 1} ${pass.customDurationUnit || 'hrs'}`,
  };

  const handleSendWhatsAppAlert = () => {
    const msg = generateExpiryAlertWhatsAppMessage(pass, settings);
    openWhatsApp(pass.phoneNumber, msg);
  };

  return (
    <View
      style={[
        styles.card,
        timeInfo.isExpired && !isCompleted && styles.cardExpired,
        timeInfo.isUrgent && !isCompleted && styles.cardUrgent,
      ]}
    >
      {/* Top Bar: Vehicle Plate, Type Badge, Token */}
      <View style={styles.topRow}>
        {/* Indian Number Plate Look */}
        <View style={styles.numberPlate}>
          <View style={styles.plateIndBadge}>
            <Text style={styles.plateIndText}>IND</Text>
          </View>
          <Text style={styles.plateNumberText}>{pass.vehicleNumber}</Text>
        </View>

        {/* Vehicle Type & Slot Badges */}
        <View style={styles.badgeGroup}>
          <View
            style={[
              styles.vehicleBadge,
              { backgroundColor: vehicleConfig.bgColor, borderColor: vehicleConfig.color },
            ]}
          >
            <Text style={[styles.vehicleBadgeText, { color: vehicleConfig.color }]}>
              {language === 'hi' ? vehicleConfig.labelHi : vehicleConfig.labelEn}
            </Text>
          </View>
          <View style={styles.slotBadge}>
            <Ionicons name="location" size={11} color="#475569" />
            <Text style={styles.slotBadgeText}>{pass.slotNumber || 'Open'}</Text>
          </View>
        </View>
      </View>

      {/* Customer Info Row */}
      <View style={styles.customerRow}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>
            👤 {pass.customerName}
          </Text>
          <TouchableOpacity
            onPress={() => makePhoneCall(pass.phoneNumber)}
            style={styles.phoneClickable}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={12} color="#2563EB" />
            <Text style={styles.customerPhone}>{pass.phoneNumber}</Text>
          </TouchableOpacity>
        </View>

        {/* Token # */}
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>TOKEN</Text>
          <Text style={styles.tokenNumber}>#{pass.tokenNumber}</Text>
        </View>
      </View>

      {/* Pass Timing & Countdown Status Banner */}
      <View
        style={[
          styles.statusBanner,
          isCompleted && styles.statusBannerCompleted,
          timeInfo.isExpired && !isCompleted && styles.statusBannerExpired,
          timeInfo.isUrgent && !isCompleted && styles.statusBannerUrgent,
          !timeInfo.isExpired && !timeInfo.isUrgent && !isCompleted && styles.statusBannerActive,
        ]}
      >
        <Ionicons
          name={
            isCompleted
              ? 'checkmark-done-circle'
              : timeInfo.isExpired
              ? 'alert-circle'
              : timeInfo.isUrgent
              ? 'time'
              : 'timer-outline'
          }
          size={16}
          color={
            isCompleted
              ? '#64748B'
              : timeInfo.isExpired
              ? '#DC2626'
              : timeInfo.isUrgent
              ? '#D97706'
              : '#059669'
          }
        />
        <View style={styles.statusBannerTextContainer}>
          <Text
            style={[
              styles.statusBannerTime,
              isCompleted && { color: '#64748B' },
              timeInfo.isExpired && !isCompleted && { color: '#B91C1C', fontWeight: '800' },
              timeInfo.isUrgent && !isCompleted && { color: '#B45309', fontWeight: '800' },
              !timeInfo.isExpired && !timeInfo.isUrgent && !isCompleted && { color: '#047857' },
            ]}
          >
            {isCompleted
              ? language === 'hi'
                ? 'निकाला गया (पूर्ण)'
                : 'Vehicle Exited'
              : timeInfo.text}
          </Text>
          <Text style={styles.statusBannerExpiry}>
            {language === 'hi' ? 'समाप्ति:' : 'Expiry:'} {formatDateTimeNice(pass.expiryTime)}
          </Text>
        </View>

        {/* Overdue Penalty Badge if expired */}
        {overdueFee > 0 && (
          <View style={styles.penaltyBadge}>
            <Text style={styles.penaltyText}>+₹{overdueFee} Penalty</Text>
          </View>
        )}
      </View>

      {/* Meta details row: duration, fee, helmet */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{language === 'hi' ? 'पास अवधि' : 'Duration'}</Text>
          <Text style={styles.metaValue}>{durationNameMap[pass.durationType]}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{language === 'hi' ? 'शुल्क' : 'Fee'}</Text>
          <Text style={[styles.metaValue, { color: '#047857', fontWeight: '800' }]}>
            ₹{pass.amountPaid}
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748B' }}>
              {' '}
              ({pass.paymentMode.toUpperCase()})
            </Text>
          </Text>
        </View>

        {pass.helmetCount > 0 && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{language === 'hi' ? 'हेलमेट' : 'Helmet'}</Text>
            <Text style={styles.metaValue}>🪖 {pass.helmetCount}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {/* Digital Slip View */}
        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => onViewSlip(pass)}
          activeOpacity={0.7}
        >
          <Ionicons name="receipt-outline" size={15} color="#2563EB" />
          <Text style={styles.actionBtnSecondaryText}>
            {language === 'hi' ? 'पर्ची देखें' : 'View Slip'}
          </Text>
        </TouchableOpacity>

        {/* WhatsApp Alert / Slip Share */}
        <TouchableOpacity
          style={styles.actionBtnWhatsApp}
          onPress={handleSendWhatsAppAlert}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
          <Text style={styles.actionBtnWhatsAppText}>
            {timeInfo.isUrgent || timeInfo.isExpired
              ? language === 'hi'
                ? 'अलर्ट भेजें'
                : 'Send Alert'
              : language === 'hi'
              ? 'व्हाट्सएप पर्ची'
              : 'WhatsApp'}
          </Text>
        </TouchableOpacity>

        {/* Checkout Button (Exit) if not completed */}
        {!isCompleted && (
          <TouchableOpacity
            style={[
              styles.actionBtnCheckout,
              timeInfo.isExpired && styles.actionBtnCheckoutUrgent,
            ]}
            onPress={() => onCheckout(pass)}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnCheckoutText}>
              {language === 'hi' ? 'गाड़ी निकालें' : 'Checkout'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3.5,
    elevation: 2,
  },
  cardExpired: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  cardUrgent: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberPlate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  plateIndBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 5,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateIndText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  plateNumberText: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  phoneClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  tokenContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  tokenNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  statusBannerActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBannerUrgent: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  statusBannerExpired: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  statusBannerCompleted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  statusBannerTextContainer: {
    flex: 1,
  },
  statusBannerTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBannerExpiry: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  penaltyBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  penaltyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionBtnWhatsApp: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnWhatsAppText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnCheckout: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnCheckoutUrgent: {
    backgroundColor: '#DC2626',
  },
  actionBtnCheckoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
