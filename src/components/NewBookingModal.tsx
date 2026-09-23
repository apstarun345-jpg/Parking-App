import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ParkingPass,
  RatesConfig,
  ParkingSettings,
  VehicleType,
  PassDurationType,
  PaymentMode,
} from '../types';
import { calculateExpiryDate, calculatePrice } from '../services/storage';

interface NewBookingModalProps {
  visible: boolean;
  onClose: () => void;
  rates: RatesConfig;
  settings: ParkingSettings;
  language: 'hi' | 'en';
  onSavePass: (newPass: ParkingPass) => void;
  existingPassCount: number;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  visible,
  onClose,
  rates,
  settings,
  language,
  onSavePass,
  existingPassCount,
}) => {
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [durationType, setDurationType] = useState<PassDurationType>('12h');
  const [customValue, setCustomValue] = useState<string>('6');
  const [customUnit, setCustomUnit] = useState<'hours' | 'days'>('hours');

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [helmetCount, setHelmetCount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [customPrice, setCustomPrice] = useState<string>('');

  // Auto calculate default slot
  useEffect(() => {
    if (visible) {
      const prefix = vehicleType === 'bike' ? 'B' : vehicleType === 'cycle' ? 'C' : 'CAR';
      const slotNum = (existingPassCount % 30) + 1;
      setSlotNumber(`${prefix}-${slotNum < 10 ? '0' + slotNum : slotNum}`);
    }
  }, [visible, vehicleType, existingPassCount]);

  // Recalculate price whenever vehicleType or durationType changes
  useEffect(() => {
    const val = parseInt(customValue, 10) || 1;
    const computed = calculatePrice(vehicleType, durationType, rates, val, customUnit);
    setCustomPrice(computed.toString());
  }, [vehicleType, durationType, customValue, customUnit, rates]);

  const handleReset = () => {
    setCustomerName('');
    setPhoneNumber('');
    setVehicleNumber('');
    setNotes('');
    setHelmetCount(0);
    setVehicleType('bike');
    setDurationType('12h');
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      Alert.alert(
        language === 'hi' ? 'नाम आवश्यक है' : 'Name Required',
        language === 'hi' ? 'कृपया ग्राहक का नाम दर्ज करें।' : 'Please enter customer name.'
      );
      return;
    }

    if (!vehicleNumber.trim()) {
      Alert.alert(
        language === 'hi' ? 'गाड़ी नंबर आवश्यक है' : 'Vehicle Number Required',
        language === 'hi'
          ? 'कृपया गाड़ी का नंबर या टोकन दर्ज करें।'
          : 'Please enter vehicle or token number.'
      );
      return;
    }

    const entryDate = new Date();
    const cValue = parseInt(customValue, 10) || 1;
    const expiryDate = calculateExpiryDate(entryDate, durationType, cValue, customUnit);

    const priceNum = parseFloat(customPrice) || 0;
    const tokenNo = 100 + existingPassCount + 1;

    const newPass: ParkingPass = {
      id: `UPK-${Date.now().toString().slice(-4)}`,
      tokenNumber: tokenNo,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim() || '9876543210',
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      durationType,
      customDurationValue: durationType === 'custom' ? cValue : undefined,
      customDurationUnit: durationType === 'custom' ? customUnit : undefined,
      entryTime: entryDate.toISOString(),
      expiryTime: expiryDate.toISOString(),
      amountCharged: priceNum,
      amountPaid: paymentMode === 'pending' ? 0 : priceNum,
      paymentMode,
      paymentStatus: paymentMode === 'pending' ? 'pending' : 'paid',
      slotNumber: slotNumber.trim() || 'Open',
      helmetCount,
      notes: notes.trim() || undefined,
      status: 'active',
      createdAt: entryDate.toISOString(),
    };

    onSavePass(newPass);
    handleReset();
    onClose();
  };

  const currentRateObj = rates[vehicleType] || rates.bike;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {language === 'hi' ? '➕ नया वाहन दर्ज करें' : '➕ New Vehicle Entry'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === 'hi'
                  ? 'ग्राहक विवरण भरें और डिजिटल पर्ची बनाएं'
                  : 'Fill details and generate digital slip'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* 1. Vehicle Type Selector */}
            <Text style={styles.sectionHeading}>
              {language === 'hi' ? '1. वाहन का प्रकार चुनें:' : '1. Select Vehicle Type:'}
            </Text>
            <View style={styles.vehicleTypeGrid}>
              {/* Bike */}
              <TouchableOpacity
                style={[
                  styles.vehicleTypeCard,
                  vehicleType === 'bike' && styles.vehicleTypeCardSelected,
                ]}
                onPress={() => setVehicleType('bike')}
                activeOpacity={0.7}
              >
                <Text style={styles.vehicleEmoji}>🏍️</Text>
                <Text
                  style={[
                    styles.vehicleTypeName,
                    vehicleType === 'bike' && styles.vehicleTypeNameSelected,
                  ]}
                >
                  {language === 'hi' ? 'बाइक / 2W' : 'Bike / 2W'}
                </Text>
                <Text style={styles.vehicleRatePreview}>
                  12h: ₹{rates.bike.h12} | Mo: ₹{rates.bike.monthly}
                </Text>
              </TouchableOpacity>

              {/* Cycle */}
              <TouchableOpacity
                style={[
                  styles.vehicleTypeCard,
                  vehicleType === 'cycle' && styles.vehicleTypeCardSelected,
                ]}
                onPress={() => setVehicleType('cycle')}
                activeOpacity={0.7}
              >
                <Text style={styles.vehicleEmoji}>🚲</Text>
                <Text
                  style={[
                    styles.vehicleTypeName,
                    vehicleType === 'cycle' && styles.vehicleTypeNameSelected,
                  ]}
                >
                  {language === 'hi' ? 'साइकिल' : 'Bicycle'}
                </Text>
                <Text style={styles.vehicleRatePreview}>
                  12h: ₹{rates.cycle.h12} | Mo: ₹{rates.cycle.monthly}
                </Text>
              </TouchableOpacity>

              {/* Car */}
              <TouchableOpacity
                style={[
                  styles.vehicleTypeCard,
                  vehicleType === 'car' && styles.vehicleTypeCardSelected,
                ]}
                onPress={() => setVehicleType('car')}
                activeOpacity={0.7}
              >
                <Text style={styles.vehicleEmoji}>🚗</Text>
                <Text
                  style={[
                    styles.vehicleTypeName,
                    vehicleType === 'car' && styles.vehicleTypeNameSelected,
                  ]}
                >
                  {language === 'hi' ? 'कार / 4W' : 'Car / 4W'}
                </Text>
                <Text style={styles.vehicleRatePreview}>
                  12h: ₹{rates.car.h12} | Mo: ₹{rates.car.monthly}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Duration / Pass Type */}
            <Text style={styles.sectionHeading}>
              {language === 'hi' ? '2. पास की अवधि (समय) चुनें:' : '2. Select Duration / Pass:'}
            </Text>
            <View style={styles.durationGrid}>
              {/* 12 Hours */}
              <TouchableOpacity
                style={[
                  styles.durationCard,
                  durationType === '12h' && styles.durationCardSelected,
                ]}
                onPress={() => setDurationType('12h')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationTitle,
                    durationType === '12h' && styles.durationTitleSelected,
                  ]}
                >
                  {language === 'hi' ? '12 घंटे' : '12 Hours'}
                </Text>
                <Text style={styles.durationPriceTag}>₹{currentRateObj.h12}</Text>
                <Text style={styles.durationHint}>
                  {language === 'hi' ? 'हाफ डे' : 'Half Day'}
                </Text>
              </TouchableOpacity>

              {/* 24 Hours / 1 Day */}
              <TouchableOpacity
                style={[
                  styles.durationCard,
                  durationType === '24h' && styles.durationCardSelected,
                ]}
                onPress={() => setDurationType('24h')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationTitle,
                    durationType === '24h' && styles.durationTitleSelected,
                  ]}
                >
                  {language === 'hi' ? '24 घंटे' : '24 Hours'}
                </Text>
                <Text style={styles.durationPriceTag}>₹{currentRateObj.h24}</Text>
                <Text style={styles.durationHint}>
                  {language === 'hi' ? '1 पूरा दिन' : '1 Full Day'}
                </Text>
              </TouchableOpacity>

              {/* Monthly (30 Days) */}
              <TouchableOpacity
                style={[
                  styles.durationCard,
                  durationType === 'monthly' && styles.durationCardSelected,
                ]}
                onPress={() => setDurationType('monthly')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationTitle,
                    durationType === 'monthly' && styles.durationTitleSelected,
                  ]}
                >
                  {language === 'hi' ? 'मासिक पास' : 'Monthly Pass'}
                </Text>
                <Text style={[styles.durationPriceTag, { color: '#059669' }]}>
                  ₹{currentRateObj.monthly}
                </Text>
                <Text style={styles.durationHint}>
                  {language === 'hi' ? '30 दिन' : '30 Days'}
                </Text>
              </TouchableOpacity>

              {/* Quarterly (90 Days) */}
              <TouchableOpacity
                style={[
                  styles.durationCard,
                  durationType === 'quarterly' && styles.durationCardSelected,
                ]}
                onPress={() => setDurationType('quarterly')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationTitle,
                    durationType === 'quarterly' && styles.durationTitleSelected,
                  ]}
                >
                  {language === 'hi' ? 'तिमाही पास' : 'Quarterly'}
                </Text>
                <Text style={[styles.durationPriceTag, { color: '#7C3AED' }]}>
                  ₹{currentRateObj.quarterly}
                </Text>
                <Text style={styles.durationHint}>
                  {language === 'hi' ? '3 महीने (90 दिन)' : '90 Days'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Duration Option */}
            <TouchableOpacity
              style={[
                styles.customToggle,
                durationType === 'custom' && styles.customToggleActive,
              ]}
              onPress={() => setDurationType('custom')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={durationType === 'custom' ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={durationType === 'custom' ? '#2563EB' : '#94A3B8'}
              />
              <Text style={styles.customToggleText}>
                {language === 'hi'
                  ? 'या कस्टम घंटे/दिन दर्ज करें (Custom Duration)'
                  : 'Or specify custom hours / days'}
              </Text>
            </TouchableOpacity>

            {durationType === 'custom' && (
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customNumberInput}
                  value={customValue}
                  onChangeText={setCustomValue}
                  keyboardType="numeric"
                  placeholder="6"
                />
                <View style={styles.unitButtons}>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      customUnit === 'hours' && styles.unitBtnActive,
                    ]}
                    onPress={() => setCustomUnit('hours')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        customUnit === 'hours' && styles.unitBtnTextActive,
                      ]}
                    >
                      {language === 'hi' ? 'घंटे' : 'Hours'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      customUnit === 'days' && styles.unitBtnActive,
                    ]}
                    onPress={() => setCustomUnit('days')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        customUnit === 'days' && styles.unitBtnTextActive,
                      ]}
                    >
                      {language === 'hi' ? 'दिन' : 'Days'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. Customer & Vehicle Inputs */}
            <Text style={styles.sectionHeading}>
              {language === 'hi' ? '3. ग्राहक एवं गाड़ी विवरण:' : '3. Customer & Vehicle Details:'}
            </Text>

            {/* Vehicle Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {vehicleType === 'cycle'
                  ? language === 'hi'
                    ? 'टोकन / साइकिल पहचान *'
                    : 'Cycle Token / Tag *'
                  : language === 'hi'
                  ? 'गाड़ी नंबर (Vehicle Plate Number) *'
                  : 'Vehicle Plate Number *'}
              </Text>
              <TextInput
                style={styles.plateInput}
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                placeholder={vehicleType === 'cycle' ? 'CYCLE-05' : 'DL 01 AB 1234'}
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
            </View>

            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'hi' ? 'ग्राहक का नाम *' : 'Customer Name *'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder={language === 'hi' ? 'उदा: राहुल वर्मा' : 'e.g. Rahul Verma'}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Customer Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'hi' ? 'मोबाइल नंबर (WhatsApp पर्ची के लिए):' : 'Mobile Number (for WhatsApp):'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="98XXXXXXXX"
                placeholderTextColor="#94A3B8"
                maxLength={10}
              />
            </View>

            {/* Slot & Helmet Row */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>
                  {language === 'hi' ? 'स्लॉट / स्टैंड #:' : 'Slot / Bay #:'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={slotNumber}
                  onChangeText={setSlotNumber}
                  placeholder="B-05"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Helmet Deposit Count */}
              {vehicleType === 'bike' && (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>
                    {language === 'hi' ? 'हेलमेट जमा:' : 'Helmet Kept:'}
                  </Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setHelmetCount(Math.max(0, helmetCount - 1))}
                    >
                      <Ionicons name="remove" size={16} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>🪖 {helmetCount}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setHelmetCount(helmetCount + 1)}
                    >
                      <Ionicons name="add" size={16} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* 4. Payment & Amount */}
            <Text style={styles.sectionHeading}>
              {language === 'hi' ? '4. भुगतान एवं शुल्क:' : '4. Payment & Fee:'}
            </Text>

            {/* Payment Mode Selector */}
            <View style={styles.paymentModeRow}>
              <TouchableOpacity
                style={[
                  styles.paymentModeBtn,
                  paymentMode === 'cash' && styles.paymentModeBtnCash,
                ]}
                onPress={() => setPaymentMode('cash')}
              >
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={paymentMode === 'cash' ? '#FFFFFF' : '#059669'}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === 'cash' && styles.paymentModeTextActive,
                  ]}
                >
                  {language === 'hi' ? 'नकद (Cash)' : 'Cash'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentModeBtn,
                  paymentMode === 'upi' && styles.paymentModeBtnUpi,
                ]}
                onPress={() => setPaymentMode('upi')}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={16}
                  color={paymentMode === 'upi' ? '#FFFFFF' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === 'upi' && styles.paymentModeTextActive,
                  ]}
                >
                  {language === 'hi' ? 'ऑनलाइन / UPI' : 'UPI / Online'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentModeBtn,
                  paymentMode === 'pending' && styles.paymentModeBtnPending,
                ]}
                onPress={() => setPaymentMode('pending')}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={paymentMode === 'pending' ? '#FFFFFF' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === 'pending' && styles.paymentModeTextActive,
                  ]}
                >
                  {language === 'hi' ? 'उधार (Pending)' : 'Due'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Total Fee Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountBoxLabel}>
                {language === 'hi' ? 'कुल पार्किंग शुल्क:' : 'Total Parking Fee:'}
              </Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {language === 'hi'
                  ? 'गाड़ी दर्ज करें और पर्ची बनाएं'
                  : 'Confirm Entry & Issue Slip'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
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
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 8,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  vehicleTypeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
  vehicleTypeCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  vehicleEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  vehicleTypeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  vehicleTypeNameSelected: {
    color: '#2563EB',
  },
  vehicleRatePreview: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  durationCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  durationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  durationTitleSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  durationPriceTag: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  durationHint: {
    fontSize: 10,
    color: '#64748B',
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 6,
  },
  customToggleActive: {},
  customToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  customNumberInput: {
    width: 80,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  plateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    height: 42,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  paymentModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 5,
  },
  paymentModeBtnCash: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  paymentModeBtnUpi: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  paymentModeBtnPending: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  paymentModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  paymentModeTextActive: {
    color: '#FFFFFF',
  },
  amountBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountBoxLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginRight: 2,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    minWidth: 60,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
