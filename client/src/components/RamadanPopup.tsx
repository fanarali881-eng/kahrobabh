import { useState, useEffect, useCallback } from 'react';

function RamadanPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Generate random countdown under 12 hours on each visit
  useEffect(() => {
    const totalSeconds = Math.floor(Math.random() * (12 * 3600 - 1800)) + 1800; // 30min to 12hrs
    const endTime = Date.now() + totalSeconds * 1000;
    sessionStorage.setItem('ramadan_end', endTime.toString());

    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Show popup after 500ms
    const showTimer = setTimeout(() => setIsVisible(true), 500);

    return () => {
      clearInterval(interval);
      clearTimeout(showTimer);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'ramadanFadeIn 0.4s ease-out',
        }}
      >
        {/* Popup Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #1a2744 40%, #0d1f3c 100%)',
            borderRadius: '24px',
            padding: '0',
            maxWidth: '420px',
            width: '90%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.15)',
            animation: 'ramadanSlideUp 0.5s ease-out',
          }}
        >
          {/* Decorative top border */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #d4af37, #f5d060, #d4af37, transparent)',
          }} />

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            ✕
          </button>

          {/* Content */}
          <div style={{ padding: '30px 30px 28px', textAlign: 'center' }}>
            {/* EWA Logo */}
            <div style={{ marginBottom: '16px' }}>
              <img
                src="/ewa-logo.png"
                alt="EWA Logo"
                style={{
                  width: '160px',
                  height: 'auto',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 4px 20px rgba(212,175,55,0.3))',
                }}
              />
            </div>

            {/* Store Name */}
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#d4af37',
              marginBottom: '6px',
              fontFamily: '"Makani Bold", Arial, sans-serif',
              letterSpacing: '1px',
            }}>
              هيئة الكهرباء والماء
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(212,175,55,0.6)',
              marginBottom: '20px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              EWA Bills
            </div>

            {/* Discount Text */}
            <div style={{
              background: 'linear-gradient(135deg, #d4af37, #f5d060, #d4af37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '52px',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '4px',
            }}>
              25%
            </div>
            <div style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '6px',
            }}>
              خصم
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              marginBottom: '24px',
            }}>
              على فواتير هيئة الكهرباء والماء عند دفع كامل المبلغ
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
              marginBottom: '20px',
            }} />

            {/* Countdown Label */}
            <div style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              marginBottom: '12px',
              fontWeight: 500,
            }}>
              ينتهي العرض خلال
            </div>

            {/* Countdown Timer */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '24px',
              direction: 'ltr',
            }}>
              {/* Hours */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  minWidth: '64px',
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#f5d060',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}>
                    {pad(timeLeft.hours)}
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>ساعة</div>
              </div>

              <div style={{ color: '#d4af37', fontSize: '28px', fontWeight: 700, paddingTop: '10px' }}>:</div>

              {/* Minutes */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  minWidth: '64px',
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#f5d060',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}>
                    {pad(timeLeft.minutes)}
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>دقيقة</div>
              </div>

              <div style={{ color: '#d4af37', fontSize: '28px', fontWeight: 700, paddingTop: '10px' }}>:</div>

              {/* Seconds */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  minWidth: '64px',
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#f5d060',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}>
                    {pad(timeLeft.seconds)}
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>ثانية</div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d060)',
                color: '#0a1628',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 40px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,175,55,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.3)';
              }}
            >
              ادفع الآن
            </button>
          </div>

          {/* Decorative bottom border */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #d4af37, #f5d060, #d4af37, transparent)',
          }} />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes ramadanFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ramadanSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

export default RamadanPopup;
