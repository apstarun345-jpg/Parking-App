import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings } from '../types';
import { formatDateTimeNice, generateSlipWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

interface ReceiptModalProps {
  visible: boolean;
  pass: ParkingPass | null;
  settings: ParkingSettings;
  language: 'hi' | 'en';
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  pass,
  settings,
  language,
  onClose,
}) => {
  if (!pass) return null;

  const handleSendWhatsApp = () => {
    const msg = generateSlipWhatsAppMessage(pass, settings);
    openWhatsApp(pass.phoneNumber, msg);
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert(
        language === 'hi' ? 'प्रिंट पर्ची' : 'Print Slip',
        language === 'hi'
          ? `पर्ची #${pass.tokenNumber} प्रिंटर को भेज दी गई है।`
          : `Receipt #${pass.tokenNumber} sent to printer.`
      );
    }
  };

  const durationNameMap = {
    '12h': language === 'hi' ? '12 घंटे (हाफ डे)' : '12 Hours (Half Day)',
    '24h': language === 'hi' ? '24 घंटे (1 पूरा दिन)' : '24 Hours (Full Day)',
    'monthly': language === 'hi' ? 'मासिक पास (30 दिन)' : 'Monthly Pass (30 Days)',
    'quarterly': language === 'hi' ? 'तिमाही पास (90 दिन)' : 'Quarterly Pass (90 Days)',
    'custom': `कस्टम (${pass.customDurationValue || 1} ${pass.customDurationUnit || 'घंटे'})`,
  };

  const vehicleNameMap = {
    bike: language === 'hi' ? 'मोटरसाइकिल / बाइक' : 'Motorcycle / Bike',
    cycle: language === 'hi' ? 'साइकिल' : 'Bicycle / Cycle',
    car: language === 'hi' ? 'कार / 4-व्हीलर' : 'Car / 4-Wheeler',
    other: language === 'hi' ? 'ऑटो / अन्य' : 'Other Vehicle',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <Text style={styles.headerTitle}>
              {language === 'hi' ? '🎫 डिजिटल पार्किंग पर्ची' : '🎫 Digital Parking Slip'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Thermal Ticket Slip Card */}
            <View style={styles.ticketCard}>
              {/* Top Zig-zag indicator / Punch hole */}
              <View style={styles.ticketTopHeader}>
                <View style={styles.punchHole} />
              </View>

              {/* Parking Header */}
              <View style={styles.parkingHeader}>
                <Text style={styles.parkingTitle}>{settings.parkingName}</Text>
                <Text style={styles.parkingAddress}>{settings.address}</Text>
                <Text style={styles.parkingContact}>📞 Helpline: {settings.ownerPhone}</Text>
              </View>

              {/* Token Banner */}
              <View style={styles.tokenBanner}>
                <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                <Text style={styles.tokenNumberBig}>#{pass.tokenNumber}</Text>
                <Text style={styles.passIdText}>ID: {pass.id}</Text>
              </View>

              <View style={styles.dividerDashed} />

              {/* Key Details Rows */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'गाड़ी नंबर:' : 'Vehicle Plate:'}</Text>
                <Text style={styles.detailValueBold}>{pass.vehicleNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'वाहन प्रकार:' : 'Vehicle Type:'}</Text>
                <Text style={styles.detailValue}>{vehicleNameMap[pass.vehicleType]}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'ग्राहक का नाम:' : 'Customer Name:'}</Text>
                <Text style={styles.detailValue}>{pass.customerName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number:'}</Text>
                <Text style={styles.detailValue}>{pass.phoneNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'स्लॉट / स्टैंड:' : 'Slot / Stand:'}</Text>
                <Text style={styles.detailValueBold}>{pass.slotNumber || 'Open Bay'}</Text>
              </View>

              {pass.helmetCount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{language === 'hi' ? 'हेलमेट सुरक्षित:' : 'Helmet Kept:'}</Text>
                  <Text style={styles.detailValue}>🪖 {pass.helmetCount} Deposit</Text>
                </View>
              )}

              <View style={styles.dividerDashed} />

              {/* Time Details */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'प्रवेश समय (Entry):' : 'Entry Time:'}</Text>
                <Text style={styles.detailValue}>{formatDateTimeNice(pass.entryTime)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'समाप्ति समय (Expiry):' : 'Expiry Time:'}</Text>
                <Text style={[styles.detailValueBold, { color: '#DC2626' }]}>
                  {formatDateTimeNice(pass.expiryTime)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{language === 'hi' ? 'पास की अवधि:' : 'Pass Duration:'}</Text>
                <Text style={styles.detailValue}>{durationNameMap[pass.durationType]}</Text>
              </View>

              <View style={styles.dividerDashed} />

              {/* Amount Box */}
              <View style={styles.paymentBox}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>{language === 'hi' ? 'कुल शुल्क:' : 'Total Fee:'}</Text>
                  <Text style={styles.paymentAmount}>₹{pass.amountCharged}</Text>
                </View>
                <View style={styles.paymentStatusBadge}>
                  <Text style={styles.paymentStatusText}>
                    {pass.paymentStatus === 'paid'
                      ? language === 'hi'
                        ? `✅ भुगतान प्राप्त (${pass.paymentMode.toUpperCase()})`
                        : `✅ PAID (${pass.paymentMode.toUpperCase()})`
                      : language === 'hi'
                      ? '⚠️ उधार बकाया (DUE)'
                      : '⚠️ PAYMENT DUE'}
                  </Text>
                </View>
              </View>

              {/* Visual QR Code Mock */}
              <View style={styles.qrSection}>
                <View style={styles.qrBox}>
                  <Ionicons name="qr-code" size={72} color="#0F172A" />
                </View>
                <Text style={styles.qrCaption}>Scan to verify pass #{pass.tokenNumber}</Text>
              </View>

              {/* Disclaimer */}
              <Text style={styles.disclaimerText}>
                {language === 'hi'
                  ? 'पार्किंग नियम: कृपया पर्ची सुरक्षित रखें। पर्ची खोने पर ₹50 पेनल्टी देय होगी। गाड़ी में रखे सामान की स्वयं जिम्मेदारी होगी।'
                  : 'Rules: Keep this ticket safe. ₹50 penalty on lost ticket. Management not responsible for valuables left in vehicle.'}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={handleSendWhatsApp}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>
                {language === 'hi' ? 'व्हाट्सएप पर्ची भेजें' : 'Send WhatsApp Slip'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.7}>
                <Ionicons name="print-outline" size={16} color="#0F172A" />
                <Text style={styles.printBtnText}>
                  {language === 'hi' ? 'प्रिंट / सेव' : 'Print Slip'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeActionBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeActionBtnText}>
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '94%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFDF0',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketTopHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  punchHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  parkingHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  parkingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  parkingAddress: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
  },
  parkingContact: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  tokenBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 4,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 1,
  },
  tokenNumberBig: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  passIdText: {
    fontSize: 10,
    color: '#64748B',
  },
  dividerDashed: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  detailValueBold: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
  },
  paymentBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginVertical: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803D',
  },
  paymentStatusBadge: {
    marginTop: 4,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCaption: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 6,
  },
  actionsFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  whatsappBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
