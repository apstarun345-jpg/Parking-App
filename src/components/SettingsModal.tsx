import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/defaultRates';
import { generateSeedPasses, savePasses } from '../services/storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ParkingSettings;
  language: 'hi' | 'en';
  onSaveSettings: (newSettings: ParkingSettings) => void;
  onRefreshPasses: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  language,
  onSaveSettings,
  onRefreshPasses,
}) => {
  const [formData, setFormData] = useState<ParkingSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings, visible]);

  const handleSave = () => {
    onSaveSettings(formData);
    Alert.alert(
      language === 'hi' ? 'सफलता' : 'Success',
      language === 'hi' ? 'पार्किंग सेटिंग्स सेव हो गई हैं!' : 'Parking settings saved!'
    );
    onClose();
  };

  const handleResetData = () => {
    Alert.alert(
      language === 'hi' ? 'डेमो डेटा रीसेट करें?' : 'Reset Demo Data?',
      language === 'hi'
        ? 'इससे नए ताज़ा सैंपल पास (बाइक, साइकिल, कार, ओवरड्यू और एक्सपायरी वाले) लोड हो जाएंगे।'
        : 'This will reset to fresh realistic passes with upcoming and overdue expiries.',
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'हाँ, लोड करें' : 'Yes, Reset',
          onPress: async () => {
            const seed = generateSeedPasses();
            await savePasses(seed);
            onRefreshPasses();
            Alert.alert(language === 'hi' ? 'डेटा रीसेट' : 'Data Reset', language === 'hi' ? 'ताज़ा सैंपल पास लोड हो गए!' : 'Sample passes loaded!');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {language === 'hi' ? '⚙️ पार्किंग सेटिंग्स' : '⚙️ Parking Settings'}
              </Text>
              <Text style={styles.subtitle}>
                {language === 'hi'
                  ? 'पार्किंग का नाम, संपर्क, UPI व क्षमता सेट करें'
                  : 'Manage parking info, helpline & capacity'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Parking Name */}
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

            {/* Owner Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'hi' ? 'चाचा जी का मोबाइल नंबर (हेल्पलाइन):' : 'Owner / Helpline Phone:'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.ownerPhone}
                onChangeText={(text) => setFormData({ ...formData, ownerPhone: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'hi' ? 'पार्किंग का पता (Address):' : 'Parking Address:'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
            </View>

            {/* UPI ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'hi' ? 'UPI ID (PhonePe/GPay के लिए):' : 'UPI ID for Payment:'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.upiId}
                onChangeText={(text) => setFormData({ ...formData, upiId: text })}
                placeholder="uncleparking@upi"
              />
            </View>

            {/* Total Capacity */}
            <Text style={styles.sectionHeader}>
              {language === 'hi' ? 'पार्किंग क्षमता (Total Slots):' : 'Parking Total Slots:'}
            </Text>
            <View style={styles.capacityRow}>
              <View style={styles.capItem}>
                <Text style={styles.capLabel}>🏍️ {language === 'hi' ? 'बाइक' : 'Bikes'}</Text>
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

              <View style={styles.capItem}>
                <Text style={styles.capLabel}>🚲 {language === 'hi' ? 'साइकिल' : 'Cycles'}</Text>
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

              <View style={styles.capItem}>
                <Text style={styles.capLabel}>🚗 {language === 'hi' ? 'कार' : 'Cars'}</Text>
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

            {/* Alert Time Setting */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'hi'
                  ? 'अलर्ट कब आए? (समाप्ति से कितने घंटे पहले):'
                  : 'Alert Timing (Hours before expiry):'}
              </Text>
              <View style={styles.alertHoursRow}>
                {[1, 2, 3, 4].map((hrs) => (
                  <TouchableOpacity
                    key={hrs}
                    style={[
                      styles.alertHourBtn,
                      formData.alertHoursBefore === hrs && styles.alertHourBtnActive,
                    ]}
                    onPress={() => setFormData({ ...formData, alertHoursBefore: hrs })}
                  >
                    <Text
                      style={[
                        styles.alertHourText,
                        formData.alertHoursBefore === hrs && styles.alertHourTextActive,
                      ]}
                    >
                      {hrs} {language === 'hi' ? 'घंटे' : 'hrs'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Demo Reset Button */}
            <TouchableOpacity
              style={styles.demoResetBtn}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.demoResetText}>
                {language === 'hi'
                  ? 'सैंपल पास डेटा दोबारा लोड करें (Reload Demo Data)'
                  : 'Reload Fresh Sample Passes'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {language === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Settings'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  inputGroup: {
    marginBottom: 12,
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
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6,
    marginBottom: 8,
  },
  capacityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  capItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  capLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  capInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
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
  alertHoursRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alertHourBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertHourBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  alertHourText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  alertHourTextActive: {
    color: '#FFFFFF',
  },
  demoResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  demoResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
