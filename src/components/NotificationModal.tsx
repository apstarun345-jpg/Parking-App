import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingPass, ParkingSettings } from '../types';
import { getTimeDifferenceText } from '../services/storage';
import {
  openWhatsApp,
  makePhoneCall,
  generateExpiryAlertWhatsAppMessage,
  formatDateTimeNice,
} from '../utils/whatsapp';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  passes: ParkingPass[];
  settings: ParkingSettings;
  language: 'hi' | 'en';
  onCheckoutPass: (pass: ParkingPass) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  passes,
  settings,
  language,
  onCheckoutPass,
}) => {
  const activePasses = passes.filter((p) => p.status !== 'completed');

  // Filter urgent passes: expiring within 2 hours or already expired
  const alertList = activePasses
    .map((pass) => {
      const timeInfo = getTimeDifferenceText(pass.expiryTime, language);
      return {
        pass,
        timeInfo,
      };
    })
    .filter((item) => item.timeInfo.isExpired || item.timeInfo.isUrgent);

  const handleSendAlert = (pass: ParkingPass) => {
    const msg = generateExpiryAlertWhatsAppMessage(pass, settings);
    openWhatsApp(pass.phoneNumber, msg);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.alertIconBadge}>
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>
                  {language === 'hi' ? 'अलर्ट एवं पास समाप्ति सूचना' : 'Pass Expiry Alerts'}
                </Text>
                <Text style={styles.subtitle}>
                  {language === 'hi'
                    ? `${alertList.length} गाड़ियां जिनपर ध्यान देना आवश्यक है`
                    : `${alertList.length} vehicles requiring immediate attention`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Admin Notice Banner */}
          <View style={styles.adminBanner}>
            <Ionicons name="information-circle" size={18} color="#92400E" />
            <Text style={styles.adminBannerText}>
              {language === 'hi'
                ? 'चाचा जी, इन ग्राहकों का पास समाप्त होने वाला है या ओवरड्यू हो चुका है। आप एक क्लिक में उन्हें WhatsApp अलर्ट भेज सकते हैं।'
                : 'Passes below are expiring soon or overdue. Send 1-click WhatsApp alerts to notify customers.'}
            </Text>
          </View>

          {/* Alert List */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {alertList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={54} color="#10B981" />
                <Text style={styles.emptyTitle}>
                  {language === 'hi' ? 'सब कुछ ठीक है!' : 'All Clear!'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {language === 'hi'
                    ? 'वर्तमान में कोई भी पास समाप्त होने की कगार पर नहीं है।'
                    : 'No vehicle passes are expiring in the next 2 hours.'}
                </Text>
              </View>
            ) : (
              alertList.map(({ pass, timeInfo }) => (
                <View
                  key={pass.id}
                  style={[
                    styles.alertCard,
                    timeInfo.isExpired ? styles.alertCardExpired : styles.alertCardUrgent,
                  ]}
                >
                  <View style={styles.cardTop}>
                    {/* Vehicle Plate */}
                    <View style={styles.plateTag}>
                      <Text style={styles.plateTagText}>{pass.vehicleNumber}</Text>
                    </View>

                    {/* Expiry Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        timeInfo.isExpired ? styles.statusPillExpired : styles.statusPillUrgent,
                      ]}
                    >
                      <Ionicons
                        name={timeInfo.isExpired ? 'alert-circle' : 'time'}
                        size={13}
                        color={timeInfo.isExpired ? '#DC2626' : '#B45309'}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          timeInfo.isExpired ? { color: '#DC2626' } : { color: '#B45309' },
                        ]}
                      >
                        {timeInfo.text}
                      </Text>
                    </View>
                  </View>

                  {/* Customer row */}
                  <View style={styles.customerRow}>
                    <Text style={styles.customerName}>
                      👤 {pass.customerName} ({pass.vehicleType.toUpperCase()})
                    </Text>
                    <Text style={styles.slotText}>स्लॉट: {pass.slotNumber}</Text>
                  </View>

                  <Text style={styles.expiryDetail}>
                    {language === 'hi' ? 'समाप्ति समय:' : 'Expiry Time:'}{' '}
                    <Text style={{ fontWeight: '700' }}>{formatDateTimeNice(pass.expiryTime)}</Text>
                  </Text>

                  {/* Action buttons */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.whatsappBtn}
                      onPress={() => handleSendAlert(pass)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                      <Text style={styles.whatsappBtnText}>
                        {language === 'hi' ? 'व्हाट्सएप अलर्ट भेजें' : 'Send WhatsApp'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => makePhoneCall(pass.phoneNumber)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={14} color="#2563EB" />
                      <Text style={styles.callBtnText}>
                        {language === 'hi' ? 'कॉल' : 'Call'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.exitBtn}
                      onPress={() => {
                        onClose();
                        onCheckoutPass(pass);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="exit-outline" size={14} color="#0F172A" />
                      <Text style={styles.exitBtnText}>
                        {language === 'hi' ? 'निकासी' : 'Exit'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Close Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeFooterBtnText}>
                {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    padding: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  adminBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 15,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  alertCardExpired: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  alertCardUrgent: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  plateTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  plateTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusPillExpired: {
    backgroundColor: '#FEE2E2',
  },
  statusPillUrgent: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  expiryDetail: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  whatsappBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  callBtn: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  callBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  exitBtn: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  exitBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeFooterBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeFooterBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
