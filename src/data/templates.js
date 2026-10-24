// Escalation reminder templates for each ladder stage in English and Hindi

export const reminderTemplates = {
  heads_up: {
    stage: 1,
    nameEn: 'Friendly Heads-up',
    nameHi: 'मित्रतापूर्ण पूर्व सूचना',
    nameMr: 'स्नेहपूर्वक पूर्वसूचना (-३ दिवस)',
    trigger: '-3 days',
    en: `Hello {customerName},

Greetings from {businessName}, Pune!

This is a gentle heads-up that invoice {invoiceNumber} for {amount} is maturing on {dueDate}.

You can review your bill and pay quickly via UPI here:
{payLink}

Thank you for your ongoing partnership!`,
    hi: `नमस्ते {customerName},

{businessName}, पुणे की ओर से सप्रेम नमस्कार!

यह एक विनम्र पूर्व सूचना है कि बिल संख्या {invoiceNumber} राशि {amount} की देय तिथि {dueDate} है।

आप अपना बिल देखकर तुरंत UPI द्वारा यहाँ भुगतान कर सकते हैं:
{payLink}

हमारे साथ व्यापार करने के लिए धन्यवाद!`,
    mr: `सस्नेह नमस्कार {customerName},

{businessName}, पुणे यांच्याकडून सप्रेम नमस्कार!

आपल्या माहितीसाठी नम्र सूचना की बीजक क्र. {invoiceNumber} ची रक्कम {amount} ही {dueDate} रोजी देय आहे.

आपले बीजक तपासून थेट UPI द्वारे लगेच पेमेंट करण्यासाठी येथे क्लिक करा:
{payLink}

आपल्या निरंतर सहकार्याबद्दल मनापासून धन्यवाद!`,
  },

  due_date: {
    stage: 2,
    nameEn: 'Due Date Reminder',
    nameHi: 'देय तिथि स्मरण पत्र',
    nameMr: 'देय तारीख स्मरणपत्र (आज देय)',
    trigger: '0 days (Due today)',
    en: `Hello {customerName},

Invoice {invoiceNumber} for {amount} from {businessName} is due for payment today, {dueDate}.

Kindly process the payment to our bank account or instantly via UPI:
UPI ID: {upiId}
Quick Pay link: {payLink}

If you have already initiated the transfer, please share the transaction reference. Thank you!`,
    hi: `नमस्ते {customerName},

{businessName} का बिल संख्या {invoiceNumber} राशि {amount} का भुगतान आज {dueDate} को देय है।

कृपया हमारे बैंक खाते में या सीधे UPI द्वारा भुगतान करें:
UPI ID: {upiId}
त्वरित भुगतान लिंक: {payLink}

यदि आप भुगतान कर चुके हैं, तो कृपया संदर्भ संख्या साझा करें। धन्यवाद!`,
    mr: `सस्नेह नमस्कार {customerName},

{businessName} यांचे बीजक क्र. {invoiceNumber} ची रक्कम {amount} आज {dueDate} रोजी देय आहे.

कृपया रक्कम आमच्या बँक खात्यात किंवा थेट UPI द्वारे जमा करावी:
UPI ID: {upiId}
त्वरित भरणा लिंक: {payLink}

जर आपण आधीच पैसे पाठवले असतील, तर कृपया UTR किंवा पावती क्रमांक पाठवून द्यावा. धन्यवाद!`,
  },

  firm_reminder: {
    stage: 3,
    nameEn: 'Firmer Reminder (7 Days Overdue)',
    nameHi: 'सख्त स्मरण पत्र (7 दिन अतिदेय)',
    nameMr: 'महत्त्वाचे स्मरणपत्र (७ दिवस थकीत)',
    trigger: '+7 days',
    en: `Dear {customerName},

Your payment of {amount} for invoice {invoiceNumber} is now {daysOverdue} days overdue (due date was {dueDate}).

As a local wholesale & retail supplier, smooth cash flow is vital for our inventory restocking. We request you to clear this balance today:
{payLink}

Please reach out immediately if there are any discrepancies.`,
    hi: `प्रिय {customerName},

बिल संख्या {invoiceNumber} की राशि {amount} अब {daysOverdue} दिनों से बकाया है (देय तिथि {dueDate} थी)।

सामान पुनः मंगाने और दुकान का लेन-देन बनाए रखने के लिए समय पर भुगतान आवश्यक है। कृपया आज ही बकाया राशि चुकाएं:
{payLink}

यदि बिल में कोई विसंगति हो, तो तुरंत संपर्क करें।`,
    mr: `प्रति {customerName},

आपले बीजक क्र. {invoiceNumber} चे येणे {amount} हे आता {daysOverdue} दिवसांपासून थकीत आहे (देय तारीख {dueDate} होती).

दुकानातील नवीन मालाची खरेदी व नियमित पुरवठा सुरळीत ठेवण्यासाठी वेळेवर पेमेंट अत्यंत महत्त्वाचे आहे. कृपया ही बाकी रक्कम आजच जमा करावी:
{payLink}

बिलाविषयी काही अडचण असल्यास कृपया त्वरित संपर्क साधावा.`,
  },

  final_reminder: {
    stage: 4,
    nameEn: 'Final Reminder + Call (15 Days Overdue)',
    nameHi: 'अंतिम स्मरण पत्र व कॉल (15 दिन अतिदेय)',
    nameMr: 'अंतिम स्मरणपत्र व कॉल (१५ दिवस थकीत)',
    trigger: '+15 days',
    en: `URGENT: Invoice {invoiceNumber} for {amount} is {daysOverdue} days past due.

Dear {customerName}, multiple reminders regarding invoice {invoiceNumber} remain unaddressed. To avoid disruption in credit terms and supply of mobile accessories, please settle the outstanding amount immediately:
{payLink}

Our accounts desk will also follow up with you via telephone today.`,
    hi: `अति आवश्यक: बिल {invoiceNumber} राशि {amount} पिछले {daysOverdue} दिनों से बकाया है।

प्रिय {customerName}, पूर्व में भेजे गए स्मरण पत्रों के बावजूद भुगतान प्राप्त नहीं हुआ है। क्रेडिट सुविधा और सामग्री आपूर्ति में रुकावट से बचने हेतु कृपया तुरंत भुगतान करें:
{payLink}

हमारे कार्यालय से आज आपको दूरभाष (कॉल) पर भी संपर्क किया जाएगा।`,
    mr: `अत्यंत महत्त्वाचे: बीजक {invoiceNumber} चे येणे {amount} हे गेल्या {daysOverdue} दिवसांपासून बाकी आहे.

माननीय {customerName}, पूर्वी पाठवलेल्या स्मरणपत्रांवर अद्याप प्रतिसाद मिळालेला नाही. आपली उधारी सुविधा व मालाचा पुरवठा खंडित होऊ नये म्हणून कृपया ही थकीत रक्कम त्वरित जमा करावी:
{payLink}

आमचे कार्यालय आज आपल्याशी दूरध्वनीवरून (फोनवर) देखील चर्चा करेल.`,
  },

  demand_letter: {
    stage: 5,
    nameEn: 'Payment Demand Letter (30 Days Overdue)',
    nameHi: 'भुगतान मांग पत्र (30 दिन अतिदेय)',
    nameMr: 'थकीत रक्कम मागणी पत्र (३० दिवस थकीत)',
    trigger: '+30 days',
    en: `PAYMENT DEMAND LETTER
(Not a notice from the GST department and not a legal notice from a lawyer)

Dear {customerName},

This letter is from {businessName} about money owed for invoice {invoiceNumber} ({amount}), which is now {daysOverdue} days overdue.

Please take note that full settlement must be completed within 7 calendar days from this notice (Deadline: {graceDeadline}).

Payment Link / UPI: {payLink}
Bank Account: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234`,
    hi: `भुगतान मांग पत्र (Payment Demand Letter)
(यह GST विभाग की कोई सूचना नहीं है और न ही किसी वकील का कानूनी नोटिस है)

प्रिय {customerName},

यह पत्र {businessName} द्वारा बिल संख्या {invoiceNumber} ({amount}) के बकाया भुगतान हेतु है, जो कि अब {daysOverdue} दिनों से लंबित है।

कृपया संज्ञान लें कि इस पत्र के 7 दिनों के भीतर (अंतिम तिथि: {graceDeadline}) पूर्ण भुगतान किया जाना आवश्यक है।

भुगतान लिंक / UPI: {payLink}
बैंक खाता: HDFC Bank | खाता संख्या: 50200012345678 | IFSC: HDFC0001234`,
    mr: `थकीत रक्कम मागणी पत्र (Payment Demand Letter)
(ही GST विभागाची नोटीस नाही आणि वकिलाची कायदेशीर नोटीसही नाही)

प्रति {customerName},

हे पत्र {businessName} यांच्याकडून बीजक क्र. {invoiceNumber} ({amount}) च्या थकीत रकमेसाठी आहे, जे आता {daysOverdue} दिवसांपासून देय आहे.

कृपया नोंद घ्यावी की या पत्रापासून ७ दिवसांच्या आत (शेवटची मुदत: {graceDeadline}) पूर्ण रक्कम जमा करणे आवश्यक आहे.

पेमेंट लिंक / UPI: {payLink}
बँक खाते: HDFC Bank | खाते क्र.: 50200012345678 | IFSC: HDFC0001234`,
  },

  next_steps: {
    stage: 6,
    nameEn: 'Next Steps & MSME Samadhaan (45+ Days Overdue)',
    nameHi: 'अगले कदम व एमएसएमई समाधान (45+ दिन अतिदेय)',
    nameMr: 'पुढील कायदेशीर पावले व MSME समाधान (४५+ दिवस)',
    trigger: '+45 days',
    en: `ADVISORY: Invoice {invoiceNumber} is {daysOverdue} days overdue.

Under the MSMED Act 2006, payments to registered Micro/Small enterprises cannot exceed 45 days. Since this threshold has passed, recommended actions:
1. Direct phone call with dealer proprietor
2. Consult legal counsel for recovery options
3. File online claim on MSME Samadhaan portal (https://samadhaan.msme.gov.in)`,
    hi: `परामर्श: बिल संख्या {invoiceNumber} अब {daysOverdue} दिनों से अतिदेय है।

एमएसएमईडी अधिनियम 2006 (MSMED Act 2006) के तहत सूक्ष्म एवं लघु उद्यमों को भुगतान की अधिकतम अवधि 45 दिन है। यह अवधि बीत जाने के कारण अनुशंसित कदम:
1. डीलर के मालिक से व्यक्तिगत फोन वार्ता
2. कानूनी सलाहकार से परामर्श
3. एमएसएमई समाधान पोर्टल पर ऑनलाइन आवेदन (https://samadhaan.msme.gov.in)`,
    mr: `सूचना: बीजक क्र. {invoiceNumber} हे आता {daysOverdue} दिवसांपेक्षा जास्त थकीत आहे.

MSMED कायदा २००६ नुसार सूक्ष्म व लघु उद्योगांना देयके देण्याची कमाल मुदत ४५ दिवस आहे. ही मुदत संपल्यामुळे पुढील शिफारशी:
१. खरेदीदाराच्या मालकाशी थेट दूरध्वनीवर चर्चा
२. वसुलीच्या पर्यायांसाठी कायदेशीर सल्लागारांशी चर्चा
३. MSME समाधान पोर्टलवर ऑनलाइन दावा नोंदवणे (https://samadhaan.msme.gov.in)`,
  },
};

