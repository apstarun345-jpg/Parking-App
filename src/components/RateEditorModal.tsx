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
import { RatesConfig, VehicleType, VehicleRate } from '../types';
import { DEFAULT_RATES } from '../constants/defaultRates';

interface RateEditorModalProps {
  visible: boolean;
  onClose: () => void;
  rates: RatesConfig;
  language: 'hi' | 'en';
  onSaveRates: (newRates: RatesConfig) => void;
}

export const RateEditorModal: React.FC<RateEditorModalProps> = ({
  visible,
  onClose,
  rates,
  language,
  onSaveRates,
}) => {
  const [activeTab, setActiveTab] = useState<VehicleType>('bike');
  const [editableRates, setEditableRates] = useState<RatesConfig>(rates);

  useEffect(() => {
    setEditableRates(rates);
  }, [rates, visible]);

  const handleFieldChange = (field: keyof VehicleRate, text: string) => {
    const numVal = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    setEditableRates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: numVal,
      },
    }));
  };

  const handleSave = () => {
    onSaveRates(editableRates);
    Alert.alert(
      language === 'hi' ? 'सफलता' : 'Success',
      language === 'hi'
        ? 'रेट सफलतापूर्वक अपडेट हो गए हैं! नई बुकिंग में यही रेट लागू होंगे।'
        : 'Rates updated successfully! New bookings will use these rates.'
    );
    onClose();
  };

  const handleResetToUncleDefaults = () => {
    Alert.alert(
      language === 'hi' ? 'मूल रेट रीसेट करें?' : 'Reset Default Rates?',
      language === 'hi'
        ? 'क्या आप चाचा जी के डिफ़ॉल्ट रेट (बाइक: ₹20 / 12h, ₹250 / माह, ₹600 / 3 माह) वापस लागू करना चाहते हैं?'
        : "Reset to Uncle's default rates (Bike: ₹20 / 12h, ₹250 / month, ₹600 / quarter)?",
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, Reset',
          onPress: () => {
            setEditableRates(DEFAULT_RATES);
            onSaveRates(DEFAULT_RATES);
          },
        },
      ]
    );
  };

  const currentTabRates = editableRates[activeTab] || DEFAULT_RATES.bike;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {language === 'hi' ? '💰 पार्किंग रेट कार्ड सेट करें' : '💰 Manage Parking Rates'}
              </Text>
              <Text style={styles.subtitle}>
                {language === 'hi'
                  ? 'साइकिल, बाइक या 4-व्हीलर के 12 घंटे, 24 घंटे, मासिक व तिमाही रेट बदलें'
                  : 'Customize rates for 12h, 24h, monthly & quarterly passes'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Type Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'bike' && styles.tabItemActive]}
              onPress={() => setActiveTab('bike')}
            >
              <Text style={styles.tabEmoji}>🏍️</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'bike' && styles.tabLabelActive,
                ]}
              >
                {language === 'hi' ? 'बाइक / 2W' : 'Bike'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'cycle' && styles.tabItemActive]}
              onPress={() => setActiveTab('cycle')}
            >
              <Text style={styles.tabEmoji}>🚲</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'cycle' && styles.tabLabelActive,
                ]}
              >
                {language === 'hi' ? 'साइकिल' : 'Cycle'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'car' && styles.tabItemActive]}
              onPress={() => setActiveTab('car')}
            >
              <Text style={styles.tabEmoji}>🚗</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'car' && styles.tabLabelActive,
                ]}
              >
                {language === 'hi' ? 'कार / 4W' : 'Car'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rate Inputs */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Banner showing Uncle's bike rates highlight */}
            {activeTab === 'bike' && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={18} color="#2563EB" />
                <Text style={styles.infoBannerText}>
                  {language === 'hi'
                    ? 'चाचा जी के विशेष रेट: 12 घंटे = ₹20, मासिक = ₹250, तिमाही = ₹600'
                    : "Uncle's Base Rates: 12 Hours = ₹20, Monthly = ₹250, Quarterly = ₹600"}
                </Text>
              </View>
            )}

            {/* 12 Hours Rate */}
            <View style={styles.rateCard}>
              <View style={styles.rateCardInfo}>
                <Text style={styles.rateTitle}>
                  {language === 'hi' ? '12 घंटे (हाफ डे)' : '12 Hours Rate'}
                </Text>
                <Text style={styles.rateDescription}>
                  {language === 'hi'
                    ? 'सुबह से शाम या 12 घंटे तक रुकने का चार्ज'
                    : 'Charge for up to 12 hours parking'}
                </Text>
              </View>
              <View style={styles.rateInputWrap}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.rateInput}
                  value={currentTabRates.h12.toString()}
                  onChangeText={(val) => handleFieldChange('h12', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 24 Hours / 1 Day Rate */}
            <View style={styles.rateCard}>
              <View style={styles.rateCardInfo}>
                <Text style={styles.rateTitle}>
                  {language === 'hi' ? '24 घंटे / 1 पूरा दिन' : '24 Hours / Full Day'}
                </Text>
                <Text style={styles.rateDescription}>
                  {language === 'hi'
                    ? '24 घंटे या रात भर रुकने का चार्ज'
                    : 'Overnight or 24 hours charge'}
                </Text>
              </View>
              <View style={styles.rateInputWrap}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.rateInput}
                  value={currentTabRates.h24.toString()}
                  onChangeText={(val) => handleFieldChange('h24', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Monthly Pass (30 Days) */}
            <View style={[styles.rateCard, { borderColor: '#86EFAC' }]}>
              <View style={styles.rateCardInfo}>
                <View style={styles.popularRow}>
                  <Text style={[styles.rateTitle, { color: '#166534' }]}>
                    {language === 'hi' ? 'मासिक पास (30 दिन)' : 'Monthly Pass (30 Days)'}
                  </Text>
                  <Text style={styles.popularBadge}>POPULAR</Text>
                </View>
                <Text style={styles.rateDescription}>
                  {language === 'hi'
                    ? 'नियमित आने वाले ग्राहकों के लिए 1 महीने का पास'
                    : 'Regular customer 30-day pass'}
                </Text>
              </View>
              <View style={styles.rateInputWrap}>
                <Text style={[styles.currencyPrefix, { color: '#16A34A' }]}>₹</Text>
                <TextInput
                  style={[styles.rateInput, { color: '#16A34A' }]}
                  value={currentTabRates.monthly.toString()}
                  onChangeText={(val) => handleFieldChange('monthly', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Quarterly Pass (90 Days) */}
            <View style={[styles.rateCard, { borderColor: '#C4B5FD' }]}>
              <View style={styles.rateCardInfo}>
                <Text style={[styles.rateTitle, { color: '#5B21B6' }]}>
                  {language === 'hi' ? 'तिमाही पास (90 दिन / 3 माह)' : 'Quarterly Pass (90 Days)'}
                </Text>
                <Text style={styles.rateDescription}>
                  {language === 'hi'
                    ? '3 महीने का एकमुश्त अग्रिम पास'
                    : '3-Month upfront long-term pass'}
                </Text>
              </View>
              <View style={styles.rateInputWrap}>
                <Text style={[styles.currencyPrefix, { color: '#7C3AED' }]}>₹</Text>
                <TextInput
                  style={[styles.rateInput, { color: '#7C3AED' }]}
                  value={currentTabRates.quarterly.toString()}
                  onChangeText={(val) => handleFieldChange('quarterly', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Custom Hourly & Daily */}
            <View style={styles.customRatesSection}>
              <Text style={styles.customSectionHeading}>
                {language === 'hi' ? 'कस्टम समय दर (Hourly / Daily):' : 'Custom Time Rates:'}
              </Text>
              <View style={styles.dualRateRow}>
                <View style={styles.dualRateBox}>
                  <Text style={styles.dualRateLabel}>
                    {language === 'hi' ? 'प्रति घंटा (Hourly)' : 'Per Hour'}
                  </Text>
                  <View style={styles.dualInputWrap}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.dualInput}
                      value={currentTabRates.hourly.toString()}
                      onChangeText={(val) => handleFieldChange('hourly', val)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.dualRateBox}>
                  <Text style={styles.dualRateLabel}>
                    {language === 'hi' ? 'प्रति दिन (Per Day)' : 'Per Day'}
                  </Text>
                  <View style={styles.dualInputWrap}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.dualInput}
                      value={currentTabRates.daily.toString()}
                      onChangeText={(val) => handleFieldChange('daily', val)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetToUncleDefaults}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={16} color="#DC2626" />
              <Text style={styles.resetBtnText}>
                {language === 'hi' ? 'मूल रेट रीसेट' : 'Reset Rates'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {language === 'hi' ? 'रेट सेव करें' : 'Save Rates'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  rateCardInfo: {
    flex: 1,
    marginRight: 10,
  },
  rateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popularBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rateDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 2,
  },
  rateInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 50,
    textAlign: 'center',
  },
  customRatesSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  customSectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  dualRateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dualRateBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dualRateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  dualInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dualInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
