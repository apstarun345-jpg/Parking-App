import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingSettings } from '../types';
import { generateSeedPasses, savePasses } from '../services/storage';

interface SettingsScreenProps {
  settings: ParkingSettings;
  language: 'hi' | 'en';
  onSaveSettings: (newSettings: ParkingSettings) => void;
  onRefreshPasses: () => void;
  onOpenApkGuide: () => void;
  onOpenRates: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  language,
  onSaveSettings,
  onRefreshPasses,
  onOpenApkGuide,
  onOpenRates,
}) => {
  const [formData, setFormData] = useState<ParkingSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(formData);
    Alert.alert(
      language === 'hi' ? 'सेटिंग्स सुरक्षित' : 'Settings Saved',
      language === 'hi' ? 'आपकी पार्किंग सेटिंग्स सेव हो गई हैं।' : 'Parking settings saved successfully.'
    );
  };

  const handleResetData = () => {
    Alert.alert(
      language === 'hi' ? 'सैंपल डेटा रीसेट करें?' : 'Reset Demo Data?',
      language === 'hi'
        ? 'इससे ताज़ा गाड़ियों का डेटा (एक्सपायर होने वाली, ओवरड्यू, मासिक पास) दोबारा लोड हो जाएगा।'
        : 'This will reset to fresh realistic passes with upcoming and overdue expiries.',
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'हाँ, लोड करें' : 'Yes, Reset',
          onPress: async () => {
            const seed = generateSeedPasses();
            await savePasses(seed);
            onRefreshPasses();
            Alert.alert(
              language === 'hi' ? 'डेटा रीसेट' : 'Data Reset',
              language === 'hi' ? 'ताज़ा सैंपल पास लोड हो गए!' : 'Sample passes loaded!'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Ionicons name="business" size={26} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.parkingTitle}>{formData.parkingName}</Text>
          <Text style={styles.ownerPhone}>📞 {formData.ownerPhone}</Text>
          <Text style={styles.parkingAddress}>{formData.address}</Text>
        </View>
      </View>

      {/* APK Guide Highlight Banner */}
      <TouchableOpacity
        style={styles.apkBannerCard}
        onPress={onOpenApkGuide}
        activeOpacity={0.85}
      >
        <View style={styles.apkIconCircle}>
          <Ionicons name="logo-android" size={26} color="#FFFFFF" />
        </View>
        <View style={styles.apkBannerContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.apkBannerTitle}>
              {language === 'hi' ? 'Android APK कैसे डाउनलोड करें?' : 'How to Download Android APK?'}
            </Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>GUIDE</Text>
            </View>
          </View>
          <Text style={styles.apkBannerDesc}>
            {language === 'hi'
              ? 'चाचा जी के मोबाइल में .apk इंस्टॉल करने और होम स्क्रीन पर जोड़ने का पूरा तरीका देखें'
              : 'Step-by-step EAS Build and Chrome Add-to-Home guide'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#059669" />
      </TouchableOpacity>

      {/* Form Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === 'hi' ? 'पार्किंग एवं संपर्क विवरण' : 'Parking & Contact Details'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'hi' ? 'पार्किंग का नाम (Parking Name):' : 'Parking Name:'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={formData.parkingName}
            onChangeText={(text) => setFormData({ ...formData, parkingName: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'hi' ? 'हेल्पलाइन / चाचा जी का मोबाइल:' : 'Helpline / Contact Number:'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={formData.ownerPhone}
            onChangeText={(text) => setFormData({ ...formData, ownerPhone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'hi' ? 'पार्किंग का पता (Location / Address):' : 'Parking Address:'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'hi' ? 'UPI ID (Google Pay / PhonePe):' : 'UPI ID for Digital Collection:'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={formData.upiId}
            onChangeText={(text) => setFormData({ ...formData, upiId: text })}
            placeholder="uncleparking@upi"
          />
        </View>
      </View>

      {/* Capacity Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === 'hi' ? 'पार्किंग स्लॉट क्षमता (Total Slots)' : 'Total Slot Capacity'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {language === 'hi'
            ? 'आपकी पार्किंग में कुल कितनी गाड़ियां खड़ी हो सकती हैं:'
            : 'Maximum capacity of your parking ground:'}
        </Text>

        <View style={styles.capacityRow}>
          <View style={styles.capCard}>
            <Text style={styles.capEmoji}>🏍️</Text>
            <Text style={styles.capLabel}>{language === 'hi' ? 'बाइक' : 'Bikes'}</Text>
            <TextInput
              style={styles.capInput}
              value={formData.totalCapacity.bike.toString()}
              onChangeText={(val) =>
                setFormData({
                  ...formData,
                  totalCapacity: {
                    ...formData.totalCapacity,
                    bike: parseInt(val, 10) || 0,
                  },
                })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.capCard}>
            <Text style={styles.capEmoji}>🚲</Text>
            <Text style={styles.capLabel}>{language === 'hi' ? 'साइकिल' : 'Cycles'}</Text>
            <TextInput
              style={styles.capInput}
              value={formData.totalCapacity.cycle.toString()}
              onChangeText={(val) =>
                setFormData({
                  ...formData,
                  totalCapacity: {
                    ...formData.totalCapacity,
                    cycle: parseInt(val, 10) || 0,
                  },
                })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.capCard}>
            <Text style={styles.capEmoji}>🚗</Text>
            <Text style={styles.capLabel}>{language === 'hi' ? 'कार' : 'Cars'}</Text>
            <TextInput
              style={styles.capInput}
              value={formData.totalCapacity.car.toString()}
              onChangeText={(val) =>
                setFormData({
                  ...formData,
                  totalCapacity: {
                    ...formData.totalCapacity,
                    car: parseInt(val, 10) || 0,
                  },
                })
              }
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Alert Warning Timing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === 'hi' ? 'पास समाप्ति पूर्व चेतावनी' : 'Expiry Warning Alert'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {language === 'hi'
            ? 'पास खत्म होने से कितने घंटे पहले ऐप में और WhatsApp अलर्ट का सुझाव मिले:'
            : 'Notify before pass expires:'}
        </Text>
        <View style={styles.alertOptionRow}>
          {[1, 2, 3, 4].map((hrs) => (
            <TouchableOpacity
              key={hrs}
              style={[
                styles.alertOptionBtn,
                formData.alertHoursBefore === hrs && styles.alertOptionBtnActive,
              ]}
              onPress={() => setFormData({ ...formData, alertHoursBefore: hrs })}
            >
              <Text
                style={[
                  styles.alertOptionText,
                  formData.alertHoursBefore === hrs && styles.alertOptionTextActive,
                ]}
              >
                {hrs} {language === 'hi' ? 'घंटे पहले' : 'hrs before'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            {language === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reloadBtn}
          onPress={handleResetData}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-circle-outline" size={18} color="#B91C1C" />
          <Text style={styles.reloadBtnText}>
            {language === 'hi'
              ? 'ताज़ा सैंपल पास रीलोड करें (Demo Reset)'
              : 'Reload Fresh Demo Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  parkingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ownerPhone: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
    fontWeight: '600',
  },
  parkingAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  apkBannerCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  apkIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apkBannerContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apkBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  apkBannerDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  capacityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  capCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  capEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  capLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  capInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    width: '100%',
    textAlign: 'center',
  },
  alertOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alertOptionBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertOptionBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  alertOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  alertOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 10,
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  reloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
