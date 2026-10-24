// Marathi (मराठी) UI strings for DueMitra
// अस्सल मराठी व्यापारी शब्द (Pune / Maharashtra MSME Trade Terminology)

export const mr = {
  appName: 'ड्युमित्र (DueMitra)',
  tagline: 'स्वायत्त व्यापार उधारी व रोख प्रवाह संरक्षण प्रणाली',

  // Navigation
  nav: {
    dashboard: 'डॅशबोर्ड',
    invoices: 'बीजके (Invoices)',
    newInvoice: 'नवीन बीजक',
    customers: 'ग्राहक (व्यापारी)',
    followups: 'आजचे पाठपुरावे',
    ladder: 'वसुली शिडी (Ladder)',
    inbox: 'तक्रार व दाव्यांची पेटी',
    payments: 'बँक ताळमेळ',
    forecast: '१३ आठवड्यांचा अंदाज',
    bankExpenses: 'बँक व खर्च',
    chase: 'तात्काळ वसुली यादी',
    documents: 'कागदपत्रे व पुरावे',
    settings: 'सेटिंग्ज',
  },

  // Common buttons & actions
  actions: {
    saveDraft: 'मसुदा साठवा (Draft)',
    sendInvoice: 'बीजक बनवा व पाठवा',
    markAsSent: 'पाठवले म्हणून नोंदवा',
    snooze: '३ दिवस पुढे ढकला',
    promiseToPay: 'दिलेली तारीख नोंदवा',
    viewInvoice: 'बीजक पहा',
    viewTimeline: 'इतिहास पहा',
    printA4: 'प्रिंट / PDF जतन करा',
    downloadEvidence: 'पुरावा संच (PDF)',
    filter: 'फिल्टर',
    search: 'शोधा...',
    resetDemo: 'डेमो डेटा रीसेट करा',
    cancel: 'रद्द करा',
    confirm: 'नक्की करा',
    apply: 'लागू करा',
    simulatePay: 'UPI पेमेंट तपासा',
    testWebhook: 'n8n वेबहुक तपासा',
    uploadCsv: 'बँक स्टेटमेंट CSV जोडा',
    matchAll: 'स्वयंचलित ताळमेळ करा',
    acceptClaim: 'मान्य करा व सोडवा',
    rejectClaim: 'दावा नाकारा',
    includeMsmeInterest: 'मागणी पत्रात MSME कायद्यानुसार व्याज जोडा',
  },

  // Terminology & Tooltips (Plain words with accounting tooltips)
  terms: {
    moneyToCollect: 'ग्राहकांकडून येणे बाकी',
    moneyToCollectTip: 'व्यापार येणी (Accounts Receivable): ग्राहकांकडून येणे असलेली एकूण रक्कम',
    overdueAmount: 'मुदत संपलेली थकीत रक्कम',
    overdueAmountTip: '३० दिवसांची उधारी मुदत संपलेली बिले',
    expectedThisWeek: 'या आठवड्यात येणारी रक्कम',
    expectedThisWeekTip: 'ग्राहकांच्या जुन्या पेमेंट सवयीनुसार अपेक्षित जमा',
    expectedThisMonth: 'या महिन्यात येणारी रक्कम',
    shopBillsNext30: 'पुढील ३० दिवसांचे दुकानाचे देणे',
    shopBillsNext30Tip: 'देणी (Accounts Payable): भाडे, पगार, वितरकांचे बिल व GST',
    cashInBank: 'बँकेत शिल्लक रोख',
    cashInBankTip: 'HDFC चालू खात्यातील प्रत्यक्ष शिल्लक',
    lowestForecast: '१३ आठवड्यांतील नीचांकी रोख',
    lowestForecastTip: 'पुढील ३ महिन्यांत रोख पैशांची सर्वात कमी पातळी',
    safetyBuffer: 'किमान सुरक्षा रोख रक्कम',
    safetyBufferTip: 'भाडे व पगार वेळेवर देण्यासाठी किमान शिल्लक',
  },

  // Statuses
  status: {
    draft: 'कच्चा मसुदा (Draft)',
    sent: 'पाठवले',
    due_soon: 'मुदत जवळ आली',
    overdue: 'थकीत (Overdue)',
    part_paid: 'काही रक्कम जमा',
    paid: 'पूर्ण जमा झाले',
    disputed: 'तक्रार नोंदवली',
    all: 'सर्व स्थिती',
  },

  // Customer grades
  grade: {
    A: 'श्रेणी अ (अतिउत्कृष्ट व्यवहार)',
    B: 'श्रेणी ब (सरासरी / पाठपुरावा आवश्यक)',
    C: 'श्रेणी क (जोखमीचे / उशीर करणारे)',
  },

  // Dashboard sections
  dashboard: {
    title: 'रोख प्रवाह व व्यापार उधारी नियंत्रण केंद्र',
    subtitle: 'कवच मोबाईल ॲक्सेसरीज • पुणे, महाराष्ट्र',
    ageingTitle: 'थकीत दिवसांनुसार वर्गीकरण (Ageing)',
    notYetDue: 'मुदत बाकी असलेली बिले',
    days1_30: '१ ते ३० दिवस थकीत',
    days31_60: '३१ ते ६० दिवस थकीत',
    days61_90: '६१ ते ९० दिवस थकीत',
    days90Plus: '९० दिवसांपेक्षा जास्त थकीत',
    chaseHeader: 'या आठवड्यात प्राधान्याने वसुली करायची बिले',
    chaseSub: 'रोख तुटवड्यावरील परिणाम व जुन्या सवयीनुसार क्रमवारी',
    n8nStatus: 'n8n ऑटोमेशन इंजिन',
    n8nConnected: 'वेबहुक जोडले गेले आहे',
    n8nFallback: 'ब्राउझर बॅकअप सक्रिय',
    advanceDate: 'सिम्युलेटेड तारीख पुढे न्या',
    todayIs: 'ॲपमधील आजची तारीख (IST):',
  },

  // Demand Letter
  demandLetter: {
    title: 'थकीत रक्कम मागणी पत्र',
    disclaimer: 'हे पत्र खालील बिलांच्या थकीत रकमेसाठी कवच मोबाईल ॲक्सेसरीज यांच्याकडून पाठवले आहे. ही GST विभागाची नोटीस नाही आणि वकिलाची कायदेशीर नोटीसही नाही.',
    dueNotice: '३० दिवसांच्या मान्य केलेल्या व्यापार उधारी अटींनुसार खालील बिले अद्याप थकीत आहेत:',
    deadlineText: 'कृपया हे पत्र मिळाल्यापासून ७ दिवसांच्या आत थकीत रक्कम जमा करावी.',
    msmeClause: 'सूक्ष्म, लघु व मध्यम उद्योग विकास (MSMED) कायदा, २००६ नुसार खरेदीदाराने ४५ दिवसांच्या आत पेमेंट करणे बंधनकारक आहे. उशीर झाल्यास RBI बँक दराच्या ३ पट दराने (१९.५०% दरसाल) मासिक चक्रवाढ व्याज आकारले जाईल.',
    msmeInterestCalculated: 'MSME कायद्यानुसार वैधानिक व्याज (१९.५०% वार्षिक):',
    howToPay: 'पेमेंट करण्याच्या पद्धती व बँक माहिती',
    upiScan: 'कोणत्याही UPI ॲपवरून स्कॅन करून भरा',
    disputeNotice: 'बिलाविषयी काही अडचण किंवा शंका असल्यास सुरेश पाटील यांच्याशी accounts@duemitra.in किंवा +91 98230 12345 वर संपर्क साधावा.',
  },

  // Invoices screen
  invoices: {
    title: 'कर बीजके व बिलिंग (Tax Invoices)',
    subtitle: 'B2B उधारी विक्री, GST नियम व पेमेंट मुदत व्यवस्थापन',
    newBtn: 'नवीन बीजक बनवा',
    searchPlaceholder: 'बीजक क्रमांक किंवा ग्राहकाचे नाव शोधा...',
    filterCustomer: 'सर्व ग्राहक',
    filterStatus: 'स्थिती',
    invoiceCol: 'बीजक क्र.',
    dateCol: 'तारीख',
    dueDateCol: 'देय तारीख',
    customerCol: 'ग्राहक',
    totalCol: 'एकूण रक्कम',
    balanceCol: 'येणे बाकी',
    statusCol: 'स्थिती',
    actionsCol: 'कृती',
  },

  // Reconciliation
  reconciliation: {
    title: 'बँक स्टेटमेंट व स्वयंचलित ताळमेळ',
    subtitle: 'HDFC बँकेचे स्टेटमेंट जोडून उघड्या बिलांशी ताळमेळ घाला',
    matched: 'जुळले (Matched)',
    tdsWarning: 'TDS कापला असण्याची शक्यता: ग्राहकाकडून TDS प्रमाणपत्र मागा (कलम 194Q / 194C)',
    overpaymentWarning: 'जास्त पेमेंट: बिलाच्या रकमेपेक्षा जास्त पैसे जमा झाले आहेत',
    partPaymentInfo: 'अंशतः पेमेंट: उर्वरित रक्कम बिलावर येणे बाकी राहील',
    multiBillInfo: 'एकाच पेमेंटमध्ये अनेक बिले एकत्र जमा झाली आहेत',
    unmatchedWarning: 'अनोळखी डिपॉझिट: संबंधित बीजक सापडले नाही',
    confidence: 'AI जुळणी खात्री (Confidence)',
    confirmBtn: 'नोंद नक्की करा व खातेवहीत नोंदवा',
    confirmedBtn: 'नक्की केले',
  },

  // Cash forecast
  forecast: {
    title: '१३ आठवड्यांचा रोख प्रवाह अंदाज',
    subtitle: 'ग्राहकांच्या उशिरा देण्याच्या सवयी व दुकानाचा खर्च लक्षात घेऊन अंदाज',
    openingCash: 'सुरुवातीची रोख शिल्लक',
    inflows: 'जमा रक्कम (बिले)',
    outflows: 'खर्च होणारी रक्कम',
    closingCash: 'अखेरची शिल्लक',
    bufferAlert: 'रोख रक्कम ₹२,००,००० च्या सुरक्षा पातळीपेक्षा खाली जात आहे:',
    whatIfTitle: 'तणाव चाचणी ("जर असे झाले तर...")',
    whatIfCustomerDelay: 'सह्याद्री टेलिकॉमने ३० दिवस उशिरा पैसे दिले तर',
    whatIfBigOrder: 'सणासुदीची मोठी ऑर्डर मिळाली तर (+₹१,५०,०००, आठवडा ३)',
    whatIfDelaySupplier: 'वितरकाचे बिल २ आठवडे लांबणीवर टाकले तर (-₹८२,०००)',
    resolvingInvoices: 'हा तुटवडा लगेच भरून काढू शकणारी बिले:',
  },
};

