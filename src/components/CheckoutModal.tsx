import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, RatesConfig, PaymentMode } from '../types';
import { formatDateTimeNice } from '../utils/whatsapp';
import { calculateOverdueFee, getTimeDifferenceText } from '../services/storage';

interface CheckoutModalProps {
  visible: boolean;
  pass: ParkingPass | null;
  rates: RatesConfig;
  language: 'hi' | 'en';
  onClose: () => void;
  onConfirmCheckout: (passId: string, overdueCharge: number, paymentMode: PaymentMode) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  pass,
  rates,
  language,
  onClose,
  onConfirmCheckout,
}) => {
  if (!pass) return null;

  const timeInfo = getTimeDifferenceText(pass.expiryTime, language);
  const overdueCharge = timeInfo.isExpired ? calculateOverdueFee(pass, rates) : 0;
  const [extraPaymentMode, setExtraPaymentMode] = useState<PaymentMode>('cash');

  const handleConfirm = () => {
    onConfirmCheckout(pass.id, overdueCharge, extraPaymentMode);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="exit" size={22} color="#0F172A" />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>
                {language === 'hi' ? 'गाड़ी निकासी (Vehicle Exit)' : 'Vehicle Exit Checkout'}
              </Text>
              <Text style={styles.subtitle}>
                {language === 'hi'
                  ? 'पार्किंग स्लॉट खाली करें और निकास दर्ज करें'
                  : 'Confirm checkout and release parking slot'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Info */}
          <View style={styles.vehicleInfoBox}>
            <Text style={styles.plateText}>{pass.vehicleNumber}</Text>
            <Text style={styles.customerText}>
              👤 {pass.customerName} ({pass.phoneNumber})
            </Text>
            <Text style={styles.slotText}>
              {language === 'hi' ? 'स्लॉट:' : 'Slot:'} {pass.slotNumber} | टोकन #{pass.tokenNumber}
            </Text>
          </View>

          {/* Time Summary */}
          <View style={styles.timeBox}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{language === 'hi' ? 'प्रवेश समय:' : 'Entry:'}</Text>
              <Text style={styles.timeValue}>{formatDateTimeNice(pass.entryTime)}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{language === 'hi' ? 'समाप्ति समय:' : 'Expiry:'}</Text>
              <Text style={[styles.timeValue, timeInfo.isExpired && { color: '#DC2626' }]}>
                {formatDateTimeNice(pass.expiryTime)}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{language === 'hi' ? 'वर्तमान स्थिति:' : 'Status:'}</Text>
              <Text
                style={[
                  styles.timeValueBold,
                  timeInfo.isExpired ? { color: '#DC2626' } : { color: '#059669' },
                ]}
              >
                {timeInfo.text}
              </Text>
            </View>
          </View>

          {/* Overdue Warning & Extra Fee */}
          {overdueCharge > 0 ? (
            <View style={styles.overdueFeeBox}>
              <View style={styles.overdueHeaderRow}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.overdueTitle}>
                  {language === 'hi' ? 'अतिरिक्त समय पेनल्टी (Overdue Charge)' : 'Overstay Extra Fee'}
                </Text>
              </View>
              <Text style={styles.overdueDescription}>
                {language === 'hi'
                  ? 'गाड़ी निर्धारित पास समय से ज्यादा रुकी है।'
                  : 'Vehicle exceeded permitted pass duration.'}
              </Text>
              <View style={styles.extraAmountRow}>
                <Text style={styles.extraAmountLabel}>
                  {language === 'hi' ? 'अतिरिक्त देय राशि:' : 'Extra Fee to Collect:'}
                </Text>
                <Text style={styles.extraAmountValue}>₹{overdueCharge}</Text>
              </View>

              {/* Extra Payment Mode */}
              <View style={styles.extraModeRow}>
                <TouchableOpacity
                  style={[
                    styles.extraModeBtn,
                    extraPaymentMode === 'cash' && styles.extraModeBtnActive,
                  ]}
                  onPress={() => setExtraPaymentMode('cash')}
                >
                  <Text
                    style={[
                      styles.extraModeBtnText,
                      extraPaymentMode === 'cash' && styles.extraModeBtnTextActive,
                    ]}
                  >
                    💵 नकद (Cash)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.extraModeBtn,
                    extraPaymentMode === 'upi' && styles.extraModeBtnActive,
                  ]}
                  onPress={() => setExtraPaymentMode('upi')}
                >
                  <Text
                    style={[
                      styles.extraModeBtnText,
                      extraPaymentMode === 'upi' && styles.extraModeBtnTextActive,
                    ]}
                  >
                    📱 ऑनलाइन (UPI)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noExtraBox}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.noExtraText}>
                {language === 'hi'
                  ? 'समय सीमा के भीतर निकासी! कोई अतिरिक्त चार्ज नहीं है।'
                  : 'Checked out on time. No extra charge.'}
              </Text>
            </View>
          )}

          {/* Helmet Reminder */}
          {pass.helmetCount > 0 && (
            <View style={styles.helmetAlert}>
              <Text style={styles.helmetAlertText}>
                🪖 {language === 'hi' ? `याद रखें: ग्राहक को जमा किया गया ${pass.helmetCount} हेलमेट वापस दें!` : `Reminder: Return ${pass.helmetCount} helmet to customer!`}
              </Text>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {language === 'hi'
                ? 'निकासी पूर्ण करें एवं स्लॉट खाली करें'
                : 'Confirm Checkout & Free Slot'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  vehicleInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  plateText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  customerText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  slotText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  timeValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  timeValueBold: {
    fontSize: 12,
    fontWeight: '800',
  },
  overdueFeeBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  overdueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overdueTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  overdueDescription: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
  },
  extraAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#FECACA',
  },
  extraAmountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  extraAmountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
  },
  extraModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  extraModeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  extraModeBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  extraModeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  extraModeBtnTextActive: {
    color: '#FFFFFF',
  },
  noExtraBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noExtraText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  helmetAlert: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  helmetAlertText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
