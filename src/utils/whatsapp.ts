import { Linking, Platform } from 'react-native';
import { ParkingPass, ParkingSettings } from '../types';

export function formatDateTimeNice(isoString: string): string {
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return isoString;
  }
}

export function generateSlipWhatsAppMessage(pass: ParkingPass, settings: ParkingSettings): string {
  const durationMap = {
    '12h': '12 घंटे (Half Day)',
    '24h': '24 घंटे (Full Day)',
    'monthly': 'मासिक पास (30 दिन)',
    'quarterly': 'तिमाही पास (90 दिन)',
    'custom': `कस्टम (${pass.customDurationValue || 1} ${pass.customDurationUnit || 'घंटे'})`,
  };

  const vehicleEmoji = pass.vehicleType === 'bike' ? '🏍️' : pass.vehicleType === 'cycle' ? '🚲' : '🚗';

  return `🅿️ *${settings.parkingName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
🎫 *पार्किंग रसीद / पर्ची # ${pass.tokenNumber}*
━━━━━━━━━━━━━━━━━━━━
${vehicleEmoji} *वाहन:* ${pass.vehicleNumber} (${pass.vehicleType.toUpperCase()})
👤 *ग्राहक:* ${pass.customerName}
📞 *मोबाइल:* ${pass.phoneNumber}
🏷️ *स्लॉट / स्टैंड:* ${pass.slotNumber || 'Open'}
⏰ *प्रवेश समय:* ${formatDateTimeNice(pass.entryTime)}
⌛ *समाप्ति समय:* ${formatDateTimeNice(pass.expiryTime)}
⏳ *पास अवधि:* ${durationMap[pass.durationType]}
${pass.helmetCount > 0 ? `🪖 *हेलमेट जमा:* ${pass.helmetCount} सुरक्षित` : ''}
💰 *कुल शुल्क:* ₹${pass.amountCharged} (${pass.paymentMode.toUpperCase()} - ${pass.paymentStatus === 'paid' ? '✅ PAID' : '⚠️ PENDING'})
━━━━━━━━━━━━━━━━━━━━
ℹ️ *नियम:* पर्ची संभालकर रखें। पास समाप्त होने से पहले गाड़ी निकालें।
📍 *पता:* ${settings.address}
📞 *संपर्क / Helpline:* ${settings.ownerPhone}
धन्यवाद! शुभ यात्रा।`;
}

export function generateExpiryAlertWhatsAppMessage(pass: ParkingPass, settings: ParkingSettings): string {
  const vehicleEmoji = pass.vehicleType === 'bike' ? '🏍️' : pass.vehicleType === 'cycle' ? '🚲' : '🚗';
  const isExpired = new Date(pass.expiryTime).getTime() <= Date.now();

  if (isExpired) {
    return `⚠️ *${settings.parkingName} - समय समाप्त सूचना*
━━━━━━━━━━━━━━━━━━━━
नमस्ते *${pass.customerName}* जी,
आपकी गाड़ी ${vehicleEmoji} *${pass.vehicleNumber}* का पार्किंग पास *${formatDateTimeNice(pass.expiryTime)}* को समाप्त हो चुका है।

🚨 *कृपया तुरंत गाड़ी निकालें या पास रिन्यू कराएं।* अतिरिक्त समय का नियमानुसार चार्ज लगेगा।

📍 स्लॉट: ${pass.slotNumber}
📞 संपर्क: ${settings.ownerPhone}
धन्यवाद!`;
  }

  return `🔔 *${settings.parkingName} - पास समाप्ति चेतावनी*
━━━━━━━━━━━━━━━━━━━━
नमस्ते *${pass.customerName}* जी,
आपकी गाड़ी ${vehicleEmoji} *${pass.vehicleNumber}* का पार्किंग पास जल्द ही *${formatDateTimeNice(pass.expiryTime)}* को पूरा होने वाला है।

⏳ कृपया समय से पूर्व अपनी गाड़ी निकालें या पास का नवीनीकरण (Renew) करा लें।

📍 स्लॉट: ${pass.slotNumber}
📞 संपर्क: ${settings.ownerPhone}
धन्यवाद!`;
}

export function openWhatsApp(phone: string, text: string): void {
  // Clean phone number (remove spaces, hyphens, ensure 91 for India if 10 digits)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url).catch((err) => {
      console.warn('Could not open WhatsApp:', err);
      // Fallback to web link
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodedText}`);
    });
  }
}

export function makePhoneCall(phone: string): void {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const url = `tel:${cleanPhone}`;
  if (Platform.OS === 'web') {
    window.open(url);
  } else {
    Linking.openURL(url).catch((err) => console.warn('Could not make call:', err));
  }
}
