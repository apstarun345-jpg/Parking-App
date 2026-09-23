import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingSettings } from '../types';
import { translations } from '../constants/translations';

interface HeaderProps {
  settings: ParkingSettings;
  activeLanguage: 'hi' | 'en';
  onToggleLanguage: () => void;
  urgentAlertCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenRates: () => void;
  onOpenApkGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeLanguage,
  onToggleLanguage,
  urgentAlertCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenRates,
  onOpenApkGuide,
}) => {
  const t = translations[activeLanguage];

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <View style={styles.logoBadge}>
            <Ionicons name="car-sport" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {settings.parkingName}
            </Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {activeLanguage === 'hi'
                ? 'स्मार्ट पार्किंग एवं पास सिस्टम'
                : 'Smart Parking & Pass System'}
            </Text>
          </View>
        </View>

        {/* Quick action buttons */}
        <View style={styles.actionsRow}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.langToggle}
            onPress={onToggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              {activeLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
            </Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              urgentAlertCount > 0 && styles.iconButtonAlert,
            ]}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons
              name={urgentAlertCount > 0 ? 'notifications' : 'notifications-outline'}
              size={20}
              color={urgentAlertCount > 0 ? '#FFFFFF' : '#E2E8F0'}
            />
            {urgentAlertCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{urgentAlertCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Rate card shortcut */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenRates}
            activeOpacity={0.7}
          >
            <Ionicons name="pricetag-outline" size={19} color="#E2E8F0" />
          </TouchableOpacity>

          {/* APK Guide shortcut */}
          <TouchableOpacity
            style={styles.apkButton}
            onPress={onOpenApkGuide}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-android" size={16} color="#10B981" />
            <Text style={styles.apkButtonText}>APK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Urgent Warning Banner if any pass is expiring or overdue */}
      {urgentAlertCount > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={onOpenNotifications}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={18} color="#FEF3C7" />
          <Text style={styles.alertBannerText} numberOfLines={1}>
            {activeLanguage === 'hi'
              ? `ध्यान दें: ${urgentAlertCount} गाड़ियों का समय खत्म होने वाला है या ओवरड्यू है!`
              : `Alert: ${urgentAlertCount} vehicle passes expiring soon or overdue!`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#FEF3C7" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langToggle: {
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconButtonAlert: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  apkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  apkButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  alertBanner: {
    marginTop: 10,
    backgroundColor: '#B45309',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FEF3C7',
  },
});
