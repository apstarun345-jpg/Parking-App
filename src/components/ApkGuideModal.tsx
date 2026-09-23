import React, { useState } from 'react';
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

interface ApkGuideModalProps {
  visible: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({
  visible,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'eas' | 'pwa' | 'local'>('eas');

  const copyToClipboard = (text: string, label: string) => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      Alert.alert(
        language === 'hi' ? 'कॉपी हो गया' : 'Copied',
        `${label} ${language === 'hi' ? 'क्लिपबोर्ड में कॉपी हो गया!' : 'copied to clipboard!'}`
      );
    } else {
      Alert.alert(label, text);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.androidBadge}>
                <Ionicons name="logo-android" size={22} color="#10B981" />
              </View>
              <View>
                <Text style={styles.title}>
                  {language === 'hi' ? 'Android APK कैसे निकालें?' : 'How to Get Android APK?'}
                </Text>
                <Text style={styles.subtitle}>
                  {language === 'hi'
                    ? 'चाचा जी के फ़ोन में ऐप इनस्टॉल करने की गाइड'
                    : 'Step-by-step installation instructions'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'eas' && styles.tabBtnActive]}
              onPress={() => setActiveTab('eas')}
            >
              <Ionicons
                name="cloud-download-outline"
                size={16}
                color={activeTab === 'eas' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'eas' && styles.tabTextActive]}>
                {language === 'hi' ? '1. EAS क्लाउड APK (सरल)' : '1. EAS Cloud Build'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'pwa' && styles.tabBtnActive]}
              onPress={() => setActiveTab('pwa')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={activeTab === 'pwa' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'pwa' && styles.tabTextActive]}>
                {language === 'hi' ? '2. डायरेक्ट फ़ोन में (बिना बिल्ड)' : '2. Instant Web App'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'local' && styles.tabBtnActive]}
              onPress={() => setActiveTab('local')}
            >
              <Ionicons
                name="laptop-outline"
                size={16}
                color={activeTab === 'local' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'local' && styles.tabTextActive]}>
                {language === 'hi' ? '3. लोकल बिल्ड' : '3. Local Build'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'eas' && (
              <View style={styles.sectionContent}>
                {/* Highlight Card */}
                <View style={styles.methodHighlight}>
                  <Text style={styles.methodTitle}>
                    {language === 'hi'
                      ? '⭐ सबसे आसान तरीका: Expo EAS Cloud Build'
                      : '⭐ Recommended: Expo EAS Cloud Build'}
                  </Text>
                  <Text style={styles.methodDesc}>
                    {language === 'hi'
                      ? 'इसके लिए आपके कंप्यूटर पर Android Studio की जरूरत नहीं है। यह सीधे Expo के क्लाउड सर्वर पर 100% असली .apk फाइल बना देगा।'
                      : 'No Android Studio required. Builds a standalone .apk directly on Expo cloud servers.'}
                  </Text>
                </View>

                {/* Step 1 */}
                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? 'EAS CLI टूल इनस्टॉल करें:' : 'Install EAS CLI:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'अपने टर्मिनल या कमांड प्रॉम्प्ट में यह कमांड चलाएं:'
                        : 'Run this in your terminal:'}
                    </Text>
                    <TouchableOpacity
                      style={styles.codeSnippet}
                      onPress={() => copyToClipboard('npm install -g eas-cli', 'EAS CLI Command')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.codeText}>npm install -g eas-cli</Text>
                      <Ionicons name="copy-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Step 2 */}
                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? 'Expo अकाउंट में लॉगिन करें:' : 'Log in to Expo:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'अगर खाता नहीं है तो expo.dev पर फ्री खाता बन जाता है:'
                        : 'Log in with your free expo.dev account:'}
                    </Text>
                    <TouchableOpacity
                      style={styles.codeSnippet}
                      onPress={() => copyToClipboard('eas login', 'Login Command')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.codeText}>eas login</Text>
                      <Ionicons name="copy-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Step 3 */}
                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? 'सीधा APK बिल्ड शुरू करें:' : 'Run Direct APK Build:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'प्रोजेक्ट में eas.json पहले से APK मोड के लिए कॉन्फ़िगर है:'
                        : 'eas.json is already configured for standalone APK output:'}
                    </Text>
                    <TouchableOpacity
                      style={styles.codeSnippet}
                      onPress={() =>
                        copyToClipboard('eas build -p android --profile preview', 'Build APK Command')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.codeText}>eas build -p android --profile preview</Text>
                      <Ionicons name="copy-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Step 4 */}
                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? 'फ़ोन में डाउनलोड करें:' : 'Download on Phone:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? '3-4 मिनट में टर्मिनल पर एक डाउनलोड लिंक और QR Code आ जाएगा। चाचा जी के फ़ोन से उस QR कोड को स्कैन करें और .apk इनस्टॉल कर लें!'
                        : 'In ~3-5 minutes, a QR code & download link is provided. Scan it with Uncle’s phone to download the .apk file!'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'pwa' && (
              <View style={styles.sectionContent}>
                <View style={[styles.methodHighlight, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Text style={[styles.methodTitle, { color: '#065F46' }]}>
                    {language === 'hi'
                      ? '⚡ तुरंत 10 सेकंड में: बिना कम्पाइल किए ऐप बनाएं'
                      : '⚡ Instant in 10 Seconds: Web App on Phone'}
                  </Text>
                  <Text style={[styles.methodDesc, { color: '#047857' }]}>
                    {language === 'hi'
                      ? 'चाचा जी बिना किसी APK फाइल के भी इस वेबसाइट को अपने मोबाइल में बिल्कुल असली Android ऐप की तरह चला सकते हैं!'
                      : 'Uncle can add this live web link to his Android home screen with 1 tap, running fullscreen like a native app.'}
                  </Text>
                </View>

                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? 'Chrome ब्राउज़र में खोलें:' : 'Open in Google Chrome:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'चाचा जी के मोबाइल में दिए गए लिंक को Google Chrome में खोलें।'
                        : 'Open the deployed URL in Google Chrome on the Android phone.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi' ? '3 डॉट्स (⋮) पर टैप करें:' : 'Tap 3 Dots (⋮) Menu:'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'Chrome के ऊपर दाहिने कोने में तीन डॉट्स पर टैप करें।'
                        : 'Tap the top-right menu button in Chrome.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>
                      {language === 'hi'
                        ? '"होम स्क्रीन पर जोड़ें" (Add to Home screen) चुनें:'
                        : 'Select "Add to Home Screen" or "Install App":'}
                    </Text>
                    <Text style={styles.stepText}>
                      {language === 'hi'
                        ? 'बस "Add" पर दबाएं। चाचा जी के फ़ोन में "चाचा जी पार्किंग" नाम का ऐप आइकन आ जाएगा!'
                        : 'Tap "Add" or "Install". An app icon appears on the phone screen with native experience!'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'local' && (
              <View style={styles.sectionContent}>
                <View style={styles.methodHighlight}>
                  <Text style={styles.methodTitle}>
                    {language === 'hi'
                      ? '💻 डेवलपर लोकल बिल्ड (Android SDK)'
                      : '💻 Developer Local Build'}
                  </Text>
                  <Text style={styles.methodDesc}>
                    {language === 'hi'
                      ? 'यदि आपके कंप्यूटर पर Android Studio और Java JDK सेटअप है:'
                      : 'If you have Android Studio & Java JDK configured locally:'}
                  </Text>
                </View>

                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>Native Android Folder तैयार करें:</Text>
                    <TouchableOpacity
                      style={styles.codeSnippet}
                      onPress={() => copyToClipboard('npx expo prebuild --platform android', 'Prebuild')}
                    >
                      <Text style={styles.codeText}>npx expo prebuild --platform android</Text>
                      <Ionicons name="copy-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepHeading}>Release APK Compile करें:</Text>
                    <TouchableOpacity
                      style={styles.codeSnippet}
                      onPress={() =>
                        copyToClipboard(
                          'cd android && ./gradlew assembleRelease',
                          'Assemble Release APK'
                        )
                      }
                    >
                      <Text style={styles.codeText}>cd android && ./gradlew assembleRelease</Text>
                      <Ionicons name="copy-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                    <Text style={[styles.stepText, { marginTop: 6 }]}>
                      {language === 'hi'
                        ? 'आउटपुट APK यहाँ मिलेगा: android/app/build/outputs/apk/release/app-release.apk'
                        : 'Output APK: android/app/build/outputs/apk/release/app-release.apk'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeFooterBtnText}>
                {language === 'hi' ? 'समझ गया, बंद करें' : 'Got it, Close'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
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
  androidBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#064E3B',
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  bodyScroll: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  sectionContent: {
    gap: 10,
    paddingBottom: 16,
  },
  methodHighlight: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepInfo: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  codeSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  closeFooterBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeFooterBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
