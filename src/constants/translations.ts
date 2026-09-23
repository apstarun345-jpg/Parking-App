export const translations = {
  hi: {
    appName: 'चाचा जी पार्किंग',
    tagline: 'पार्किंग प्रबंधन एवं पास प्रणाली',
    // Tabs
    tabDashboard: 'डैशबोर्ड',
    tabPasses: 'गाड़ियां / पास',
    tabNewEntry: 'नया वाहन',
    tabRates: 'रेट लिस्ट',
    tabSettings: 'सेटिंग्स',
    tabApk: 'APK गाइड',

    // Dashboard
    parkedNow: 'कुल खड़ी गाड़ियां',
    todayCollection: 'आज की कुल कमाई',
    expiringSoon: 'खत्म होने वाले पास',
    expiredCount: 'समय समाप्त (ओवरड्यू)',
    pendingDues: 'उधार बकाया',
    cashCollected: 'नकद प्राप्त',
    upiCollected: 'UPI / ऑनलाइन',
    occupancyRate: 'पार्किंग क्षमता',
    availableSlots: 'खाली जगह',

    // Forecast Section
    forecastTitle: 'पास कब पूरे होंगे? (समय अनुसार स्थिति)',
    forecastSubtitle: 'कितने घंटे या दिन में कितने पास समाप्त होंगे:',
    filterAll: 'सभी',
    filterNext2h: 'अगले 2 घंटे',
    filterNext6h: 'अगले 6 घंटे',
    filterToday: 'आज के पूरे होने वाले',
    filterNext3d: 'अगले 3 दिन',
    filterMonthly: 'महीने वाले पास',
    filterExpired: 'समाप्त / ओवरड्यू',

    // Pass Status
    statusActive: 'सक्रिय (वैध)',
    statusExpiring: 'जल्द समाप्त',
    statusExpired: 'समय समाप्त',
    statusCompleted: 'निकाला गया (पूर्ण)',

    // Vehicle Types
    bike: 'मोटरसाइकिल / बाइक',
    cycle: 'साइकिल',
    car: 'कार / 4-व्हीलर',
    other: 'ऑटो / अन्य',

    // Pass Durations
    h12: '12 घंटे (हाफ डे)',
    h24: '24 घंटे (1 दिन)',
    monthly: 'मासिक पास (30 दिन)',
    quarterly: 'तिमाही पास (90 दिन)',
    custom: 'कस्टम समय',

    // New Entry Form
    newBookingTitle: 'नया वाहन प्रवेश / पास बुक करें',
    customerName: 'ग्राहक का नाम',
    customerPhone: 'मोबाइल नंबर (10 अंक)',
    vehicleType: 'वाहन का प्रकार',
    vehicleNumber: 'गाड़ी नंबर (उदा: DL 01 AB 1234)',
    cycleToken: 'टोकन नंबर (साइकिल के लिए)',
    passDuration: 'पास की अवधि',
    customHours: 'घंटे दर्ज करें',
    customDays: 'दिन दर्ज करें',
    slotNumber: 'पार्किंग स्लॉट / स्टैंड नंबर',
    helmetDeposited: 'हेलमेट / बैग जमा किया?',
    paymentMode: 'भुगतान का तरीका',
    cash: 'नकद (Cash)',
    upi: 'ऑनलाइन / UPI',
    pending: 'उधार (Pending)',
    amountToPay: 'कुल शुल्क',
    saveAndGenerateSlip: 'वाहन दर्ज करें और रसीद बनाएं',

    // Card Actions
    viewSlip: 'पर्ची देखें',
    sendWhatsApp: 'व्हाट्सएप भेजें',
    checkout: 'गाड़ी निकालें (Checkout)',
    callCustomer: 'कॉल करें',
    timeLeft: 'शेष समय',
    overdueTime: 'अतिरिक्त समय',
    penaltyCharge: 'अतिरिक्त चार्ज',

    // Receipt Modal
    receiptTitle: 'पार्किंग प्रवेश पर्ची / डिजिटल रसीद',
    token: 'टोकन नंबर',
    entryTime: 'आने का समय',
    expiryTime: 'समाप्त होने का समय',
    paidStatus: 'भुगतान स्थिति',
    shareOnWhatsApp: 'ग्राहक को व्हाट्सएप पर्ची भेजें',
    printSlip: 'प्रिंट / पर्ची सेव करें',
    close: 'बंद करें',
    parkingRules: 'पार्किंग नियम: कृपया पर्ची सुरक्षित रखें। पर्ची खोने पर ₹50 जुर्माना लगेगा। सामान की स्वयं जिम्मेदारी होगी।',

    // Rate Manager
    rateManagerTitle: 'रेट लिस्ट सेट करें (Vehicle Rates)',
    rateManagerDesc: 'यहाँ से आप साइकिल, बाइक और 4-व्हीलर के 12 घंटे, 24 घंटे, मासिक और तिमाही रेट बदल सकते हैं।',
    saveRates: 'रेट सेव करें',
    resetDefaultRates: 'चाचा जी के मूल रेट लागू करें',
    rateUpdatedToast: 'रेट सफलतापूर्वक अपडेट हो गए!',

    // Notifications
    notificationTitle: 'अलर्ट एवं सूचनाएं',
    noAlerts: 'कोई नया अलर्ट नहीं है। सभी गाड़ियां समय सीमा में हैं।',
    sendAlertToCustomer: 'ग्राहक को अलर्ट भेजें',
    adminWarning: 'चाचा जी ध्यान दें! नीचे दिए वाहनों का समय समाप्त होने वाला है:',

    // Checkout Modal
    confirmCheckoutTitle: 'गाड़ी निकासी (Vehicle Exit)',
    checkoutConfirmMsg: 'क्या ग्राहक गाड़ी निकाल रहा है?',
    additionalChargeMsg: 'वाहन तय समय से अधिक रुका है। अतिरिक्त चार्ज लें:',
    markCompletedBtn: 'निकासी दर्ज करें और स्लॉट खाली करें',

    // APK Guide
    apkGuideTitle: 'Android APK कैसे निकालें? (गाइड)',
    apkGuideSubtitle: 'अपने Android फ़ोन पर ऐप इनस्टॉल करने के आसान तरीके',
  },
  en: {
    appName: 'Uncle Ji Parking',
    tagline: 'Smart Parking & Pass Management System',
    // Tabs
    tabDashboard: 'Dashboard',
    tabPasses: 'Vehicles / Passes',
    tabNewEntry: 'New Entry',
    tabRates: 'Rate Card',
    tabSettings: 'Settings',
    tabApk: 'APK Guide',

    // Dashboard
    parkedNow: 'Vehicles Parked',
    todayCollection: 'Today Collection',
    expiringSoon: 'Expiring Soon',
    expiredCount: 'Expired (Overstay)',
    pendingDues: 'Pending Dues',
    cashCollected: 'Cash Payment',
    upiCollected: 'UPI / Online',
    occupancyRate: 'Occupancy Rate',
    availableSlots: 'Slots Available',

    // Forecast Section
    forecastTitle: 'When will passes expire? (Timeline)',
    forecastSubtitle: 'Breakdown of passes expiring by hours & days:',
    filterAll: 'All',
    filterNext2h: 'Next 2 Hours',
    filterNext6h: 'Next 6 Hours',
    filterToday: 'Expiring Today',
    filterNext3d: 'Next 3 Days',
    filterMonthly: 'Monthly Passes',
    filterExpired: 'Overdue / Expired',

    // Pass Status
    statusActive: 'Active',
    statusExpiring: 'Expiring Soon',
    statusExpired: 'Expired (Overdue)',
    statusCompleted: 'Exited (Closed)',

    // Vehicle Types
    bike: 'Motorcycle / Bike',
    cycle: 'Bicycle / Cycle',
    car: 'Car / 4-Wheeler',
    other: 'Auto / Other',

    // Pass Durations
    h12: '12 Hours (Half Day)',
    h24: '24 Hours (Full Day)',
    monthly: 'Monthly Pass (30 Days)',
    quarterly: 'Quarterly Pass (90 Days)',
    custom: 'Custom Duration',

    // New Entry Form
    newBookingTitle: 'New Vehicle Entry / Issue Pass',
    customerName: 'Customer Name',
    customerPhone: 'Mobile Number (10 digits)',
    vehicleType: 'Vehicle Type',
    vehicleNumber: 'Vehicle Number (e.g. DL 01 AB 1234)',
    cycleToken: 'Cycle Token Number',
    passDuration: 'Pass Duration',
    customHours: 'Enter hours',
    customDays: 'Enter days',
    slotNumber: 'Parking Slot / Bay #',
    helmetDeposited: 'Helmet / Belonging Kept?',
    paymentMode: 'Payment Mode',
    cash: 'Cash',
    upi: 'Online / UPI',
    pending: 'Pending (Due)',
    amountToPay: 'Total Fee',
    saveAndGenerateSlip: 'Park Vehicle & Generate Slip',

    // Card Actions
    viewSlip: 'View Slip',
    sendWhatsApp: 'Send WhatsApp',
    checkout: 'Checkout / Exit',
    callCustomer: 'Call Customer',
    timeLeft: 'Time Left',
    overdueTime: 'Overdue By',
    penaltyCharge: 'Extra Charge',

    // Receipt Modal
    receiptTitle: 'Parking Entry Slip / Receipt',
    token: 'Token No.',
    entryTime: 'Entry Time',
    expiryTime: 'Expiry Time',
    paidStatus: 'Payment Status',
    shareOnWhatsApp: 'Send Slip to Customer on WhatsApp',
    printSlip: 'Print / Save Receipt',
    close: 'Close',
    parkingRules: 'Parking Rules: Please keep this slip safe. ₹50 fine on lost ticket. Parked at owner risk.',

    // Rate Manager
    rateManagerTitle: 'Manage Rates (Vehicle Rates)',
    rateManagerDesc: 'Customize rates for Cycle, Bike, and Four Wheeler for 12 Hours, 24 Hours, Monthly, and Quarterly passes.',
    saveRates: 'Save Rates',
    resetDefaultRates: "Reset to Uncle's Rates",
    rateUpdatedToast: 'Rates updated successfully!',

    // Notifications
    notificationTitle: 'Alerts & Expiry Notifications',
    noAlerts: 'No active alerts. All vehicles are within permitted time.',
    sendAlertToCustomer: 'Send Alert to Customer',
    adminWarning: 'Uncle Ji Alert: The following vehicle passes are about to expire or already expired:',

    // Checkout Modal
    confirmCheckoutTitle: 'Vehicle Checkout',
    checkoutConfirmMsg: 'Confirm vehicle exit and release slot?',
    additionalChargeMsg: 'Vehicle stayed past expiry time. Additional charge to collect:',
    markCompletedBtn: 'Confirm Exit & Release Slot',

    // APK Guide
    apkGuideTitle: 'How to Get Android APK (Guide)',
    apkGuideSubtitle: 'Step-by-step instructions to install on Android phone',
  },
};
