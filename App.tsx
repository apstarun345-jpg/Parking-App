import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ParkingPass, RatesConfig, ParkingSettings, PaymentMode } from './src/types';
import { DEFAULT_RATES, DEFAULT_SETTINGS } from './src/constants/defaultRates';
import {
  getPasses,
  savePasses,
  getRates,
  saveRates,
  getSettings,
  saveSettings,
  getTimeDifferenceText,
} from './src/services/storage';

import { Header } from './src/components/Header';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PassesScreen } from './src/screens/PassesScreen';
import { RatesScreen } from './src/screens/RatesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewBookingModal } from './src/components/NewBookingModal';
import { ReceiptModal } from './src/components/ReceiptModal';
import { CheckoutModal } from './src/components/CheckoutModal';
import { RateEditorModal } from './src/components/RateEditorModal';
import { NotificationModal } from './src/components/NotificationModal';
import { ApkGuideModal } from './src/components/ApkGuideModal';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // App State
  const [passes, setPasses] = useState<ParkingPass[]>([]);
  const [rates, setRates] = useState<RatesConfig>(DEFAULT_RATES);
  const [settings, setSettings] = useState<ParkingSettings>(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Main Tab: 'dashboard' | 'passes' | 'rates' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'passes' | 'rates' | 'settings'>('dashboard');

  // Modals state
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<ParkingPass | null>(null);
  const [selectedPassForCheckout, setSelectedPassForCheckout] = useState<ParkingPass | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  // Initial Load from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const [savedPasses, savedRates, savedSettings] = await Promise.all([
        getPasses(),
        getRates(),
        getSettings(),
      ]);
      setPasses(savedPasses);
      setRates(savedRates);
      setSettings(savedSettings);
      if (savedSettings.language) {
        setLanguage(savedSettings.language);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic status update (every 30s) to keep live countdowns fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setPasses((prevPasses) =>
        prevPasses.map((p) => {
          if (p.status === 'completed') return p;
          const timeInfo = getTimeDifferenceText(p.expiryTime, language);
          if (timeInfo.isExpired && p.status !== 'expired') {
            return { ...p, status: 'expired' };
          }
          if (timeInfo.isUrgent && p.status === 'active') {
            return { ...p, status: 'expiring_soon' };
          }
          return p;
        })
      );
    }, 30000);

    return () => clearInterval(timer);
  }, [language]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleLanguage = async () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
    const updated = { ...settings, language: nextLang };
    setSettings(updated);
    await saveSettings(updated);
  };

  // Urgent alerts count (expiring in < 2h or overdue)
  const urgentAlertCount = passes.filter((p) => {
    if (p.status === 'completed') return false;
    const info = getTimeDifferenceText(p.expiryTime, language);
    return info.isExpired || info.isUrgent;
  }).length;

  // Handlers for pass actions
  const handleSaveNewPass = async (newPass: ParkingPass) => {
    const updated = [newPass, ...passes];
    setPasses(updated);
    await savePasses(updated);
    // Show digital receipt slip immediately
    setSelectedPassForReceipt(newPass);
  };

  const handleConfirmCheckout = async (
    passId: string,
    overdueCharge: number,
    paymentMode: PaymentMode
  ) => {
    const now = new Date().toISOString();
    const updated = passes.map((p) => {
      if (p.id === passId) {
        return {
          ...p,
          status: 'completed' as const,
          exitTime: now,
          overdueCharge,
          amountPaid: p.amountPaid + overdueCharge,
        };
      }
      return p;
    });
    setPasses(updated);
    await savePasses(updated);
  };

  const handleSaveRates = async (newRates: RatesConfig) => {
    setRates(newRates);
    await saveRates(newRates);
  };

  const handleSaveSettings = async (newSettings: ParkingSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main Top Header */}
      <Header
        settings={settings}
        activeLanguage={language}
        onToggleLanguage={handleToggleLanguage}
        urgentAlertCount={urgentAlertCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenRates={() => setIsRateModalOpen(true)}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
      />

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            passes={passes}
            settings={settings}
            rates={rates}
            language={language}
            onViewSlip={(p) => setSelectedPassForReceipt(p)}
            onCheckout={(p) => setSelectedPassForCheckout(p)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onOpenNewEntry={() => setIsNewBookingOpen(true)}
            onOpenRates={() => setIsRateModalOpen(true)}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
            onNavigateToAllPasses={() => setActiveTab('passes')}
          />
        )}

        {activeTab === 'passes' && (
          <PassesScreen
            passes={passes}
            settings={settings}
            rates={rates}
            language={language}
            onViewSlip={(p) => setSelectedPassForReceipt(p)}
            onCheckout={(p) => setSelectedPassForCheckout(p)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onOpenNewEntry={() => setIsNewBookingOpen(true)}
          />
        )}

        {activeTab === 'rates' && (
          <RatesScreen
            rates={rates}
            language={language}
            onSaveRates={handleSaveRates}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            language={language}
            onSaveSettings={handleSaveSettings}
            onRefreshPasses={loadData}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
            onOpenRates={() => setIsRateModalOpen(true)}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={22}
            color={activeTab === 'dashboard' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'dashboard' && styles.navLabelActive,
            ]}
          >
            {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Passes */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('passes')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'passes' ? 'car-sport' : 'car-sport-outline'}
            size={22}
            color={activeTab === 'passes' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'passes' && styles.navLabelActive,
            ]}
          >
            {language === 'hi' ? 'पास सूची' : 'Passes'}
          </Text>
        </TouchableOpacity>

        {/* Center Floating Action Button: + New Entry */}
        <TouchableOpacity
          style={styles.navCenterBtn}
          onPress={() => setIsNewBookingOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Tab 3: Rates */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('rates')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'rates' ? 'pricetag' : 'pricetag-outline'}
            size={22}
            color={activeTab === 'rates' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'rates' && styles.navLabelActive,
            ]}
          >
            {language === 'hi' ? 'रेट कार्ड' : 'Rates'}
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Settings & APK Guide */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'settings' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'settings' && styles.navLabelActive,
            ]}
          >
            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <NewBookingModal
        visible={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        rates={rates}
        settings={settings}
        language={language}
        onSavePass={handleSaveNewPass}
        existingPassCount={passes.length}
      />

      <ReceiptModal
        visible={!!selectedPassForReceipt}
        pass={selectedPassForReceipt}
        settings={settings}
        language={language}
        onClose={() => setSelectedPassForReceipt(null)}
      />

      <CheckoutModal
        visible={!!selectedPassForCheckout}
        pass={selectedPassForCheckout}
        rates={rates}
        language={language}
        onClose={() => setSelectedPassForCheckout(null)}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <RateEditorModal
        visible={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        rates={rates}
        language={language}
        onSaveRates={handleSaveRates}
      />

      <NotificationModal
        visible={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        passes={passes}
        settings={settings}
        language={language}
        onCheckoutPass={(p) => setSelectedPassForCheckout(p)}
      />

      <ApkGuideModal
        visible={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
        language={language}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'relative',
    height: 64,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  navCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    top: -12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
