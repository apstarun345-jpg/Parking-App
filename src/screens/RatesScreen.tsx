import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RatesConfig, VehicleType, VehicleRate } from '../types';
import { DEFAULT_RATES } from '../constants/defaultRates';

interface RatesScreenProps {
  rates: RatesConfig;
  language: 'hi' | 'en';
  onSaveRates: (newRates: RatesConfig) => void;
  onOpenBookingWithVehicle?: (vehicleType: VehicleType) => void;
}

export const RatesScreen: React.FC<RatesScreenProps> = ({
  rates,
  language,
  onSaveRates,
  onOpenBookingWithVehicle,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('bike');
  const [currentRates, setCurrentRates] = useState<RatesConfig>(rates);

  // Sync when prop rates change
  React.useEffect(() => {
    setCurrentRates(rates);
  }, [rates]);

  const handleUpdate = (field: keyof VehicleRate, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    const updated: RatesConfig = {
      ...currentRates,
      [selectedVehicle]: {
        ...currentRates[selectedVehicle],
        [field]: num,
      },
    };
    setCurrentRates(updated);
  };

  const handleSave = () => {
    onSaveRates(currentRates);
    Alert.alert(
      language === 'hi' ? 'सफलता' : 'Success',
      language === 'hi'
        ? 'रेट सफलतापूर्वक सेव हो गए हैं! नई बुकिंग में यही रेट लागू होंगे।'
        : 'Rates saved successfully! All new entries will use these rates.'
    );
  };

  const handleReset = () => {
    Alert.alert(
      language === 'hi' ? 'मूल रेट लागू करें?' : 'Reset Default Rates?',
      language === 'hi'
        ? 'क्या आप चाचा जी के मूल रेट लागू करना चाहते हैं? (बाइक: 12 घंटे ₹20, मासिक ₹250, तिमाही ₹600)'
        : "Reset to Uncle's default rates (Bike: 12h ₹20, Monthly ₹250, Quarterly ₹600)?",
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'हाँ, रीसेट करें' : 'Reset',
          onPress: () => {
            setCurrentRates(DEFAULT_RATES);
            onSaveRates(DEFAULT_RATES);
          },
        },
      ]
    );
  };

  const activeVehicleRates = currentRates[selectedVehicle] || currentRates.bike;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroIconBox}>
          <Ionicons name="pricetag" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>
            {language === 'hi' ? 'पार्किंग रेट कार्ड मैनेजमेंट' : 'Parking Rate Card'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {language === 'hi'
              ? 'साइकिल, बाइक या 4-व्हीलर के 12 घंटे, 24 घंटे, मासिक व तिमाही रेट यहाँ से बदलें'
              : 'Set hourly, daily, monthly & quarterly charges for all vehicle types'}
          </Text>
        </View>
      </View>

      {/* Vehicle Type Tabs */}
      <View style={styles.vehicleTabs}>
        <TouchableOpacity
          style={[styles.vehicleTab, selectedVehicle === 'bike' && styles.vehicleTabActive]}
          onPress={() => setSelectedVehicle('bike')}
        >
          <Text style={styles.tabIcon}>🏍️</Text>
          <Text
            style={[
              styles.tabTitle,
              selectedVehicle === 'bike' && styles.tabTitleActive,
            ]}
          >
            {language === 'hi' ? 'बाइक / 2W' : 'Bike (2W)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.vehicleTab, selectedVehicle === 'cycle' && styles.vehicleTabActive]}
          onPress={() => setSelectedVehicle('cycle')}
        >
          <Text style={styles.tabIcon}>🚲</Text>
          <Text
            style={[
              styles.tabTitle,
              selectedVehicle === 'cycle' && styles.tabTitleActive,
            ]}
          >
            {language === 'hi' ? 'साइकिल' : 'Bicycle'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.vehicleTab, selectedVehicle === 'car' && styles.vehicleTabActive]}
          onPress={() => setSelectedVehicle('car')}
        >
          <Text style={styles.tabIcon}>🚗</Text>
          <Text
            style={[
              styles.tabTitle,
              selectedVehicle === 'car' && styles.tabTitleActive,
            ]}
          >
            {language === 'hi' ? 'कार / 4W' : 'Car (4W)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Uncle's Highlight Badge for Bike */}
      {selectedVehicle === 'bike' && (
        <View style={styles.uncleHighlightBox}>
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.uncleHighlightTitle}>
              {language === 'hi' ? 'चाचा जी के विशेष रेट (Active):' : "Uncle's Base Rates:"}
            </Text>
            <Text style={styles.uncleHighlightDetails}>
              {language === 'hi'
                ? '• 12 घंटे / 1 दिन: ₹20\n• मासिक पास (30 दिन): ₹250\n• तिमाही पास (90 दिन): ₹600'
                : '• 12 Hours / 1 Day: ₹20\n• Monthly Pass (30 Days): ₹250\n• Quarterly Pass (90 Days): ₹600'}
            </Text>
          </View>
        </View>
      )}

      {/* Rate Editor Cards */}
      <View style={styles.cardsContainer}>
        {/* 12 Hours */}
        <View style={styles.rateCard}>
          <View style={styles.rateCardHeader}>
            <View>
              <Text style={styles.cardHeading}>
                {language === 'hi' ? '12 घंटे (हाफ डे रेट)' : '12 Hours (Half Day)'}
              </Text>
              <Text style={styles.cardSub}>
                {language === 'hi' ? 'ग्राहकों के लिए 12 घंटे तक का शुल्क' : 'Rate for up to 12 hours'}
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.rateInput}
                value={activeVehicleRates.h12.toString()}
                onChangeText={(val) => handleUpdate('h12', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* 24 Hours / 1 Day */}
        <View style={styles.rateCard}>
          <View style={styles.rateCardHeader}>
            <View>
              <Text style={styles.cardHeading}>
                {language === 'hi' ? '24 घंटे / 1 पूरा दिन' : '24 Hours / Full Day'}
              </Text>
              <Text style={styles.cardSub}>
                {language === 'hi' ? 'रात भर रुकने या 24 घंटे का शुल्क' : 'Full 24 hours parking fee'}
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.rateInput}
                value={activeVehicleRates.h24.toString()}
                onChangeText={(val) => handleUpdate('h24', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Monthly Pass */}
        <View style={[styles.rateCard, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }]}>
          <View style={styles.rateCardHeader}>
            <View>
              <View style={styles.tagRow}>
                <Text style={[styles.cardHeading, { color: '#166534' }]}>
                  {language === 'hi' ? 'मासिक पास (30 दिन)' : 'Monthly Pass (30 Days)'}
                </Text>
                <View style={styles.greenTag}>
                  <Text style={styles.greenTagText}>POPULAR</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>
                {language === 'hi'
                  ? 'दुकानदार व नियमित ग्राहकों के लिए 30 दिन का पास'
                  : '30-day regular commuter pass'}
              </Text>
            </View>
            <View style={[styles.inputWrap, { borderColor: '#16A34A' }]}>
              <Text style={[styles.rupee, { color: '#16A34A' }]}>₹</Text>
              <TextInput
                style={[styles.rateInput, { color: '#16A34A' }]}
                value={activeVehicleRates.monthly.toString()}
                onChangeText={(val) => handleUpdate('monthly', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Quarterly Pass */}
        <View style={[styles.rateCard, { borderColor: '#C4B5FD', backgroundColor: '#FAF5FF' }]}>
          <View style={styles.rateCardHeader}>
            <View>
              <Text style={[styles.cardHeading, { color: '#6B21A8' }]}>
                {language === 'hi' ? 'तिमाही पास (90 दिन / 3 माह)' : 'Quarterly Pass (90 Days)'}
              </Text>
              <Text style={styles.cardSub}>
                {language === 'hi'
                  ? '3 महीने का एकमुश्त अग्रिम डिस्काउंट पास'
                  : '3-Month long term pass'}
              </Text>
            </View>
            <View style={[styles.inputWrap, { borderColor: '#7C3AED' }]}>
              <Text style={[styles.rupee, { color: '#7C3AED' }]}>₹</Text>
              <TextInput
                style={[styles.rateInput, { color: '#7C3AED' }]}
                value={activeVehicleRates.quarterly.toString()}
                onChangeText={(val) => handleUpdate('quarterly', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Custom Hourly & Daily */}
        <View style={styles.customRatesBox}>
          <Text style={styles.customRatesTitle}>
            {language === 'hi' ? 'कस्टम समय दर (Hourly / Daily Rate):' : 'Custom Duration Rates:'}
          </Text>
          <View style={styles.customRatesGrid}>
            <View style={styles.customRateItem}>
              <Text style={styles.customRateLabel}>
                {language === 'hi' ? 'प्रति घंटा दर' : 'Hourly Rate'}
              </Text>
              <View style={styles.inputWrapMini}>
                <Text style={styles.rupeeMini}>₹</Text>
                <TextInput
                  style={styles.rateInputMini}
                  value={activeVehicleRates.hourly.toString()}
                  onChangeText={(val) => handleUpdate('hourly', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.customRateItem}>
              <Text style={styles.customRateLabel}>
                {language === 'hi' ? 'प्रति दिन दर' : 'Daily Rate'}
              </Text>
              <View style={styles.inputWrapMini}>
                <Text style={styles.rupeeMini}>₹</Text>
                <TextInput
                  style={styles.rateInputMini}
                  value={activeVehicleRates.daily.toString()}
                  onChangeText={(val) => handleUpdate('daily', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh" size={16} color="#DC2626" />
          <Text style={styles.resetBtnText}>
            {language === 'hi' ? 'मूल डिफ़ॉल्ट रेट' : 'Reset Defaults'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            {language === 'hi' ? 'रेट सेव करें' : 'Save Rates'}
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
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  vehicleTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  vehicleTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  vehicleTabActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabTitleActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  uncleHighlightBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  uncleHighlightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  uncleHighlightDetails: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 3,
    lineHeight: 18,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 10,
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  greenTagText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 200,
  },
  inputWrap: {
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
  rupee: {
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
  customRatesBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  customRatesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  customRatesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  customRateItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customRateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  inputWrapMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupeeMini: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 2,
  },
  rateInputMini: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
    color: '#DC2626',
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
