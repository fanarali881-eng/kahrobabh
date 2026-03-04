import { useLocation } from 'wouter';
import { useLang } from './LanguageContext';

export default function StoreFooter() {
  const [, navigate] = useLocation();
  const { t, dir } = useLang();

  return (
    <footer dir={dir} style={{ background: '#1a1a1a', color: '#aaa', padding: '50px 0 20px' }}>
      <div className="store-footer-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* About */}
          <div className="footer-section-about">
            <span className="footer-brand-name" style={{ color: 'white', fontSize: '24px', fontWeight: 800, display: 'block', marginBottom: '15px' }}>{t('footer.brandName')}</span>
            <p className="footer-about-text" style={{ fontSize: '13px', lineHeight: 1.7, color: '#999' }}>{t('footer.about')}</p>
          </div>

          {/* Customer support */}
          <div className="footer-section-support">
            <h3 className="footer-section-title" style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>{t('footer.customerSupport')}</h3>
            <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a onClick={() => navigate('/store')} className="footer-link" style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.contactUs')}</a>
              <a onClick={() => navigate('/store')} className="footer-link" style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.faq')}</a>
              <a onClick={() => navigate('/store')} className="footer-link" style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.storeInfo')}</a>
              <a onClick={() => navigate('/store')} className="footer-link" style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.aboutUs')}</a>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>{t('footer.policies')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.returnPolicy')}</a>
              <a style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.deliveryTerms')}</a>
              <a style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.privacyPolicy')}</a>
              <a style={{ color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>{t('footer.termsConditions')}</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>{t('footer.contactTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="tel:1809090" style={{ color: '#999', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                1809090
              </a>
              <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                <a href="https://www.instagram.com/makanifoods" target="_blank" rel="noopener" style={{ color: '#999', transition: 'color 0.2s' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.facebook.com/makanifoods" target="_blank" rel="noopener" style={{ color: '#999', transition: 'color 0.2s' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com/makanifoods" target="_blank" rel="noopener" style={{ color: '#999', transition: 'color 0.2s' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="footer-payment-section" style={{ borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <p className="footer-copyright" style={{ fontSize: '13px', color: '#999' }}>{t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}</p>
          <div className="footer-payment-methods" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* VISA */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '50px' }}>
              <svg viewBox="0 0 38 24" width="38" height="24"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" opacity="0"/><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"/></svg>
            </div>
            {/* Mastercard */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '50px' }}>
              <svg viewBox="0 0 38 24" width="38" height="24"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" opacity="0"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.3c1.7 1.3 2.8 3.3 2.8 5.7 0 2.4-1.1 4.4-2.8 5.7-1.7-1.3-2.8-3.3-2.8-5.7 0-2.4 1.1-4.4 2.8-5.7" fill="#FF5F00"/></svg>
            </div>
            {/* KNET */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '50px' }}>
              <img src="/kpay/knet.png" alt="KNET" style={{ height: '22px', objectFit: 'contain' }} />
            </div>
            {/* Apple Pay */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '50px' }}>
              <svg viewBox="0 0 165.52 105.97" width="34" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M43.08 35.7a8.58 8.58 0 002-6.27 8.7 8.7 0 00-5.64 2.92 8.14 8.14 0 00-2.05 5.9 7.2 7.2 0 005.69-2.55zm1.97 3.22c-3.14-.19-5.81 1.78-7.3 1.78s-3.78-1.69-6.25-1.64a9.24 9.24 0 00-7.82 4.74c-3.35 5.78-.87 14.35 2.38 19.05 1.59 2.33 3.5 4.9 6 4.81s3.33-1.55 6.25-1.55 3.73 1.55 6.3 1.5 4.22-2.33 5.81-4.66a20.34 20.34 0 002.62-5.37 8.47 8.47 0 01-5.13-7.72 8.6 8.6 0 014.12-7.24 8.84 8.84 0 00-6.98-3.7zm26.06-6.46v35h4.84V53.81h6.7c6.3 0 10.73-4.33 10.73-10.68S89 32.46 82.76 32.46zm4.84 4.11h5.58c4.33 0 6.8 2.31 6.8 6.57s-2.47 6.6-6.83 6.6h-5.55zm26.72 31.25c3.04 0 5.86-1.54 7.14-3.98h.1v3.74h4.48V48.3c0-4.5-3.6-7.4-9.14-7.4-5.13 0-8.9 2.95-9.04 7h4.34a4.54 4.54 0 014.84-3.7c3.13 0 4.89 1.46 4.89 4.16v1.83l-6.4.38c-5.95.36-9.17 2.8-9.17 7.04 0 4.3 3.33 7.17 7.96 7.17zm1.3-3.62c-2.73 0-4.47-1.31-4.47-3.32 0-2.08 1.68-3.29 4.89-3.48l5.69-.36v1.87c0 3.1-2.62 5.29-6.11 5.29zm17.2 12.08c4.72 0 6.94-1.8 8.88-7.28l8.52-23.9h-4.94l-5.72 18.42h-.1l-5.71-18.42h-5.08l8.2 22.72-.44 1.38c-.74 2.38-1.94 3.29-4.08 3.29a11.6 11.6 0 01-1.52-.12v3.74a13.44 13.44 0 001.99.17z" fill="#000"/></svg>
            </div>
            {/* COD */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '50px' }}>
              <img src="/payment-icons/cod.png" alt="COD" style={{ height: '22px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .store-footer-inner {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
