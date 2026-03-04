import { useState, useRef, useEffect } from 'react';
import { useStore } from './StoreContext';
import { useLang } from './LanguageContext';
import { useLocation } from 'wouter';

export default function StoreHeader() {
  const { categories, getCartCount, searchQuery, setSearchQuery, searchProducts, setCartDrawerOpen } = useStore();
  const { lang, toggleLang, t, dir, isRTL } = useLang();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const cartCount = getCartCount();
  const megaTimeoutRef = useRef<any>(null);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      setSearchResults(searchProducts(q).slice(0, 8));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchResults([]);
    }
  };

  const openMega = (key: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setMegaMenuOpen(key);
  };

  const closeMega = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaMenuOpen(null), 150);
  };

  const megaMenuKeys = ['frozen', 'chilled-dry'];

  const megaImages: Record<string, string> = {
    'frozen': '/images/frozen-mega.webp',
    'chilled-dry': '/images/chilled-mega.webp',
  };

  const megaShopAllText: Record<string, string> = {
    'frozen': t('header.shopFrozen'),
    'chilled-dry': t('header.shopChilledDry'),
  };

  // Helper to get category/subcategory title based on language
  const getCatTitle = (item: any) => {
    if (lang === 'en' && item.titleEn) return item.titleEn;
    return item.title;
  };

  // Helper to get product title based on language
  const getProductTitle = (p: any) => {
    if (lang === 'ar') return p.titleAr || p.title;
    return p.title;
  };

  return (
    <header className="store-header" dir={dir} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top announcement bar */}
      <div className="store-announcement-bar" style={{ background: '#4c4c4c', color: 'white', padding: '8px 20px', fontSize: '13px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <a onClick={() => navigate('/store')} style={{ color: 'white', textDecoration: 'none', cursor: 'pointer', fontWeight: 700 }}>
          {t('header.freeShippingBanner')}
        </a>
        <button
          className="store-lang-btn"
          onClick={toggleLang}
          style={{
            position: 'absolute',
            right: '20px',
            fontSize: '13px',
            cursor: 'pointer',
            color: 'white',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            padding: '3px 12px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        >
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      {/* Main header - Red background */}
      <div className="store-main-header" style={{ background: '#e4042c', padding: '12px 0' }}>
        <div className="store-main-header-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo + tagline */}
          <a onClick={() => navigate('/store')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
            <span className="store-logo-name" style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1.1, fontFamily: '"Makani Bold", Arial, sans-serif', whiteSpace: 'pre-line' }}>{t('header.logoName')}</span>
            <span className="store-logo-tagline" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500 }}>{t('header.logoTagline')}</span>
          </a>

          {/* Navigation - desktop */}
          <nav className="store-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {/* Frozen mega menu */}
            <div
              onMouseEnter={() => openMega('frozen')}
              onMouseLeave={closeMega}
              style={{ position: 'relative' }}
            >
              <a onClick={() => { navigate('/store/collection/frozen'); setMegaMenuOpen(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: megaMenuOpen === 'frozen' ? 700 : 500, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                {t('header.frozenFoods')}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" fill="none"/></svg>
              </a>
            </div>

            {/* Chilled & Dry mega menu */}
            <div
              onMouseEnter={() => openMega('chilled-dry')}
              onMouseLeave={closeMega}
              style={{ position: 'relative' }}
            >
              <a onClick={() => { navigate('/store/collection/chilled-dry'); setMegaMenuOpen(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: megaMenuOpen === 'chilled-dry' ? 700 : 500, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                {t('header.chilledDry')}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" fill="none"/></svg>
              </a>
            </div>

            {/* Other nav items */}
            <a onClick={() => navigate('/store/collection/new-arrivals')}
              style={{ padding: '10px 16px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('header.newArrivals')}
            </a>
            <a onClick={() => navigate('/store/collection/promotion')}
              style={{ padding: '10px 16px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('header.offers')}
            </a>
            <a onClick={() => navigate('/store/collection/boxes')}
              style={{ padding: '10px 16px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('header.boxes')}
            </a>
          </nav>

          {/* Icons */}
          <div className="store-icons" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <a className="store-header-profile" style={{ cursor: 'pointer', padding: '4px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
            <a onClick={() => setCartDrawerOpen(true)} style={{ cursor: 'pointer', position: 'relative', padding: '4px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', [isRTL ? 'right' : 'left']: '-6px', background: 'white', color: '#e4042c', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </a>
            <button className="store-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: '4px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      {megaMenuOpen && megaMenuKeys.includes(megaMenuOpen) && categories[megaMenuOpen] && (
        <div
          onMouseEnter={() => openMega(megaMenuOpen!)}
          onMouseLeave={closeMega}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            zIndex: 99,
            direction: dir,
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 30px 20px', display: 'flex', gap: '30px' }}>
            {/* Left side - Image */}
            <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <img
                src={megaImages[megaMenuOpen]}
                alt=""
                style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <a
                onClick={() => { navigate(`/store/collection/${megaMenuOpen}`); setMegaMenuOpen(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                  marginTop: '12px', color: '#333', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', textDecoration: 'none',
                }}
              >
                {megaShopAllText[megaMenuOpen]}
                <span style={{ fontSize: '16px' }}>{isRTL ? '←' : '→'}</span>
              </a>
            </div>

            {/* Right side - Categories grid */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px 30px',
              alignContent: 'start',
            }}>
              {categories[megaMenuOpen].subcategories.map((sub: any) => (
                <div key={sub.handle} style={{ marginBottom: '10px' }}>
                  <a
                    onClick={() => { navigate(`/store/collection/${sub.handle}`); setMegaMenuOpen(null); }}
                    style={{
                      display: 'block',
                      fontSize: '15px', fontWeight: 700, color: '#222',
                      marginBottom: '8px', cursor: 'pointer', textDecoration: 'none',
                    }}
                  >
                    {getCatTitle(sub)}
                  </a>
                  {sub.subcategories && sub.subcategories.map((nested: any) => (
                    <a
                      key={nested.handle}
                      onClick={() => { navigate(`/store/collection/${nested.handle}`); setMegaMenuOpen(null); }}
                      style={{
                        display: 'block',
                        fontSize: '13px', color: '#555',
                        padding: '3px 0', cursor: 'pointer', textDecoration: 'none',
                      }}
                    >
                      {getCatTitle(nested)}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Categories Bar */}
      <div className="store-mobile-categories" style={{ background: '#e4042c', padding: '0', display: 'none', overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ display: 'flex', gap: '0', padding: '0', whiteSpace: 'nowrap' }}>
          <a onClick={() => navigate('/store/collection/frozen')} style={{ flex: '0 0 auto', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            {t('header.frozenFoods')}
          </a>
          <a onClick={() => navigate('/store/collection/chilled-dry')} style={{ flex: '0 0 auto', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            {t('header.chilledDry')}
          </a>
          <a onClick={() => navigate('/store/collection/new-arrivals')} style={{ flex: '0 0 auto', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            {t('header.newArrivals')}
          </a>
          <a onClick={() => navigate('/store/collection/promotion')} style={{ flex: '0 0 auto', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            {t('header.offers')}
          </a>
          <a onClick={() => navigate('/store/collection/boxes')} style={{ flex: '0 0 auto', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
            {t('header.boxes')}
          </a>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          zIndex: 99,
          maxHeight: '500px', overflowY: 'auto',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 30px' }}>
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder={t('header.search') || 'Search products...'}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  outline: 'none',
                }}
                autoFocus
              />
              <button type="submit" style={{ background: '#e4042c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                {t('header.search') || 'Search'}
              </button>
            </form>
            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {searchResults.map(p => (
                  <a
                    key={p.id}
                    onClick={() => { navigate(`/store/product/${p.handle}`); setSearchOpen(false); }}
                    style={{
                      cursor: 'pointer', textDecoration: 'none', color: '#333',
                      padding: '10px', borderRadius: '4px', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                      {getProductTitle(p)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      KD {p.variants[0]?.price || 'N/A'}
                    </div>
                  </a>
                ))}
              </div>
            ) : searchQuery ? (
              <p style={{ textAlign: 'center', color: '#999' }}>{t('header.noResults')}</p>
            ) : null}
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, width: '280px', height: '100%', background: 'white', zIndex: 201, overflowY: 'auto', boxShadow: '2px 0 15px rgba(0,0,0,0.2)', direction: dir }}>
            <div style={{ background: '#e4042c', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>{t('header.logoName')}</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {Object.keys(categories).map((catKey) => {
                const cat = categories[catKey];
                return (
                  <div key={catKey}>
                    <a onClick={() => { navigate(`/store/collection/${catKey}`); setMobileMenuOpen(false); }} style={{ display: 'block', padding: '14px 20px', fontSize: '15px', fontWeight: 700, color: '#222', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
                      {getCatTitle(cat)}
                    </a>
                    {cat.subcategories && cat.subcategories.map((sub: any) => (
                      <a key={sub.handle} onClick={() => { navigate(`/store/collection/${sub.handle}`); setMobileMenuOpen(false); }} style={{ display: 'block', padding: '10px 20px 10px 36px', fontSize: '13px', color: '#555', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid #f8f8f8' }}>
                        {getCatTitle(sub)}
                      </a>
                    ))}
                  </div>
                );
              })}
              <a onClick={() => { navigate('/store/collection/new-arrivals'); setMobileMenuOpen(false); }} style={{ display: 'block', padding: '14px 20px', fontSize: '15px', fontWeight: 700, color: '#222', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
                {t('header.newArrivals')}
              </a>
              <a onClick={() => { navigate('/store/collection/promotion'); setMobileMenuOpen(false); }} style={{ display: 'block', padding: '14px 20px', fontSize: '15px', fontWeight: 700, color: '#e4042c', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
                {t('header.offers')}
              </a>
              <a onClick={() => { navigate('/store/collection/boxes'); setMobileMenuOpen(false); }} style={{ display: 'block', padding: '14px 20px', fontSize: '15px', fontWeight: 700, color: '#222', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
                {t('header.boxes')}
              </a>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .store-nav-desktop { display: none !important; }
          .store-mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 768px) {
          .store-header .store-announcement-bar {
            font-size: 10px !important;
            padding: 5px 60px 5px 10px !important;
          }
          .store-header .store-announcement-bar a {
            font-size: 10px !important;
          }
          .store-header .store-lang-btn {
            font-size: 10px !important;
            padding: 2px 8px !important;
            right: 6px !important;
            position: absolute !important;
          }
          .store-header .store-main-header {
            padding: 8px 0 !important;
          }
          .store-header .store-main-header-inner {
            padding: 0 12px !important;
          }
          .store-header .store-logo-name {
            font-size: 20px !important;
          }
          .store-header .store-logo-tagline {
            font-size: 11px !important;
          }
          .store-header .store-icons {
            gap: 12px !important;
          }
          .store-mobile-categories {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
