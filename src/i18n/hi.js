// Hindi (हिंदी) UI strings for DueMitra

export const hi = {
  appName: 'ड्यूमित्र (DueMitra)',
  tagline: 'मोबाइल खुदरा विक्रेताओं हेतु रोकड़ प्रवाह व उधारी सुरक्षा',
  
  // Navigation
  nav: {
    dashboard: 'डैशबोर्ड',
    invoices: 'चालान',
    newInvoice: 'नया बिल',
    customers: 'ग्राहक',
    followups: 'तकादे',
    ladder: 'तकादा सीढ़ी',
    inbox: 'इनबॉक्स',
    payments: 'बैंक मिलान',
    forecast: 'पूर्वानुमान',
    bankExpenses: 'बैंक व व्यापार खर्चे',
    chase: 'तकादा सूची',
    documents: 'दस्तावेज़',
    settings: 'सेटिंग्स',
  },

  // Common buttons & actions
  actions: {
    saveDraft: 'ड्राफ्ट सहेजें',
    sendInvoice: 'बिल बनाएं व भेजें',
    markAsSent: 'भेजा हुआ दर्ज करें',
    snooze: '3 दिन के लिए टालें',
    promiseToPay: 'भुगतान की तारीख दर्ज करें',
    viewInvoice: 'बिल देखें',
    viewTimeline: 'समय-रेखा देखें',
    printA4: 'प्रिंट / PDF सहेजें',
    downloadEvidence: 'साक्ष्य दस्तावेज (PDF)',
    filter: 'छानें',
    search: 'खोजें...',
    resetDemo: 'डेमो डेटा रीसेट करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    apply: 'लागू करें',
    simulatePay: 'UPI भुगतान सिमुलेशन',
    testWebhook: 'n8n वेबहुक जांचें',
    uploadCsv: 'बैंक विवरण CSV अपलोड करें',
    matchAll: 'स्वचालित मिलान करें',
    acceptClaim: 'स्वीकार व समाधान करें',
    rejectClaim: 'दावा अस्वीकार करें',
    includeMsmeInterest: 'मांग पत्र में MSME देरी ब्याज जोड़ें',
  },

  // Terminology & Tooltips (Plain words with accounting tooltips)
  terms: {
    moneyToCollect: 'ग्राहकों से आने वाला पैसा',
    moneyToCollectTip: 'अकाउंट्स रिसीवेबल: ग्राहकों से मिलने वाली कुल उधारी',
    overdueAmount: 'समय बीता हुआ पैसा (अतिदेय)',
    overdueAmountTip: 'वे बिल जिनकी क्रेडिट सीमा समाप्त हो चुकी है',
    expectedThisWeek: 'इस सप्ताह संभावित प्राप्ति',
    expectedThisWeekTip: 'ग्राहकों के पिछले भुगतान रिकॉर्ड अनुसार अनुमानित पैसा',
    expectedThisMonth: 'इस माह संभावित प्राप्ति',
    shopBillsNext30: 'अगले 30 दिनों के दुकान खर्चे',
    shopBillsNext30Tip: 'अकाउंट्स पेयबल: दुकान किराया, वेतन, वितरक बिल व GST',
    cashInBank: 'बैंक खाते में जमा राशि',
    cashInBankTip: 'HDFC बैंक खाते में उपलब्ध कार्यशील पूंजी',
    lowestForecast: '13-सप्ताह में न्यूनतम रोकड़ स्तर',
    lowestForecastTip: 'अगली तिमाही में बैंक बैलेंस का सबसे निचला बिंदु',
    safetyBuffer: 'सुरक्षित रोकड़ सीमा (Buffer)',
    safetyBufferTip: 'वेतन व किराया बिना रुकावट चुकाने हेतु आवश्यक न्यूनतम बैंक शेष',
  },

  // Statuses
  status: {
    draft: 'ड्राफ्ट',
    sent: 'भेजा गया',
    due_soon: 'जल्द देय',
    overdue: 'अतिदेय (Overdue)',
    part_paid: 'आंशिक भुगतान',
    paid: 'पूर्ण चुकता',
    disputed: 'विवादित (Disputed)',
    all: 'सभी स्थितियां',
  },

  // Customer grades
  grade: {
    A: 'श्रेणी A (उत्कृष्ट - समय पर भुगतान)',
    B: 'श्रेणी B (सामान्य - तकादे की आवश्यकता)',
    C: 'श्रेणी C (उच्च जोखिम - भारी देरी)',
  },

  // Dashboard sections
  dashboard: {
    title: 'रोकड़ प्रवाह एवं उधारी नियंत्रण केंद्र',
    subtitle: 'कवच मोबाइल एक्सेसरीज • पुणे, महाराष्ट्र',
    ageingTitle: 'उधारी आयु वर्गीकरण (Ageing Breakdown)',
    notYetDue: 'अभी देय नहीं',
    days1_30: '1-30 दिन अतिदेय',
    days31_60: '31-60 दिन अतिदेय',
    days61_90: '61-90 दिन अतिदेय',
    days90Plus: '90+ दिन अतिदेय',
    chaseHeader: 'इस सप्ताह पहले तकादा करने योग्य मुख्य बिल',
    chaseSub: 'रोकड़ कमी, दिनों की देरी व ग्राहक के भुगतान व्यवहार के आधार पर क्रमबद्ध',
    n8nStatus: 'n8n ऑटोमेशन इंजन',
    n8nConnected: 'n8n वेबहुक सक्रिय',
    n8nFallback: 'ब्राउज़र आधारित लोकल मोड सक्रिय',
    advanceDate: 'डेमो तिथि आगे बढ़ाएं',
    todayIs: 'वर्तमान ऐप तिथि (IST):',
  },

  // Demand Letter
  demandLetter: {
    title: 'भुगतान मांग पत्र (Payment Demand Letter)',
    disclaimer: 'यह पत्र कवच मोबाइल एक्सेसरीज द्वारा नीचे सूचीबद्ध बिलों की बकाया राशि के संबंध में है। यह GST विभाग की कोई सूचना नहीं है और न ही किसी वकील का कानूनी नोटिस है।',
    dueNotice: 'व्यापारिक 30-दिवसीय उधारी शर्तों के अंतर्गत निम्नलिखित बिल अतिदेय हैं:',
    deadlineText: 'कृपया इस सूचना की प्राप्ति के 7 कैलेंडर दिनों के भीतर पूर्ण भुगतान करें।',
    msmeClause: 'सूक्ष्म, लघु एवं मध्यम उद्यम विकास (MSMED) अधिनियम, 2006 के तहत सूक्ष्म एवं लघु आपूर्तिकर्ताओं को भुगतान 45 दिनों के भीतर अनिवार्य है। विलंबित भुगतान पर भारतीय रिजर्व बैंक दर के तीन गुना मासिक चक्रवृद्धि ब्याज लागू होता है।',
    msmeInterestCalculated: 'वैधानिक MSME विलंब ब्याज (19.50% वार्षिक दर):',
    howToPay: 'भुगतान के तरीके व बैंक विवरण',
    upiScan: 'किसी भी UPI ऐप से स्कैन करके भुगतान करें',
    disputeNotice: 'बिलिंग संबंधी किसी भी विसंगति या माल सत्यापन हेतु सुरेश पाटिल से accounts@duemitra.in या +91 98230 12345 पर संपर्क करें।',
  },

  // Invoices screen
  invoices: {
    title: 'टैक्स इनवॉइस व बिलिंग',
    subtitle: 'B2B उधारी बिक्री, GST अनुपालन और भुगतान समय-सीमा का प्रबंधन',
    newBtn: 'नया बिल बनाएं',
    searchPlaceholder: 'बिल नंबर या ग्राहक का नाम खोजें...',
    filterCustomer: 'सभी ग्राहक',
    filterStatus: 'स्थिति',
    invoiceCol: 'बिल संख्या',
    dateCol: 'तारीख',
    dueDateCol: 'देय तिथि',
    customerCol: 'ग्राहक',
    totalCol: 'कुल राशि',
    balanceCol: 'बकाया राशि',
    statusCol: 'स्थिति',
    actionsCol: 'कार्रवाई',
  },

  // Reconciliation
  reconciliation: {
    title: 'बैंक स्टेटमेंट व AI समाधान (Reconciliation)',
    subtitle: 'HDFC बैंक स्टेटमेंट अपलोड कर खुले बिलों से भुगतान का स्वतः मिलान करें',
    matched: 'सफलतापूर्वक मिलान',
    tdsWarning: 'संभवतः TDS काटा गया है: ग्राहक से धारा 194Q/194C का TDS प्रमाणपत्र मांगें',
    overpaymentWarning: 'अतिरिक्त भुगतान: प्राप्त राशि बिल की बकाया से अधिक है',
    partPaymentInfo: 'आंशिक भुगतान: शेष राशि बिल पर खुली रहेगी',
    multiBillInfo: 'एक भुगतान द्वारा एकाधिक बिलों का निपटान',
    unmatchedWarning: 'अज्ञात जमा राशि: कोई संबंधित बिल नहीं मिला',
    confidence: 'AI मिलान सटीकता',
    confirmBtn: 'मिलान की पुष्टि करें व खाता बही अपडेट करें',
    confirmedBtn: 'पुष्टीकृत',
  },

  // Cash forecast
  forecast: {
    title: '13-सप्ताह का रोकड़ प्रवाह पूर्वानुमान',
    subtitle: 'ग्राहकों की औसत देरी से समायोजित आवक और दुकान के नियमित खर्चों का सिमुलेशन',
    openingCash: 'प्रारंभिक रोकड़',
    inflows: 'आवक (बिलों से प्राप्ति)',
    outflows: 'जावक (दुकान के खर्चे)',
    closingCash: 'अंतिम शेष रोकड़',
    bufferAlert: 'इस सप्ताह रोकड़ ₹2,00,000 सुरक्षित सीमा से नीचे जाएगी:',
    whatIfTitle: 'संभावित परिदृश्य "व्हाट-इफ" परीक्षण',
    whatIfCustomerDelay: 'सह्याद्री टेलीकॉम 30 दिन बाद भुगतान करता है',
    whatIfBigOrder: 'बड़ा त्योहारी ऑर्डर मिला (+₹1,50,000 तीसरे सप्ताह में)',
    whatIfDelaySupplier: 'वितरक बिल में 2-सप्ताह की मोहलत ली (-₹82,000)',
    resolvingInvoices: 'रोकड़ की कमी को तुरंत पूरा करने वाले प्रमुख बिल:',
  },
};

