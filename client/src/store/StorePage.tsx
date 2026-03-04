import { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from './StoreContext';
import { useLang } from './LanguageContext';
import { useLocation } from 'wouter';
import ProductCard from './ProductCard';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from './CartDrawer';

/* ── Hero Slider ── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const { dir } = useLang();
  const slides = [
    { desktop: '/store-images/banner1-desktop.webp', mobile: '/store-images/banner1-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner2-desktop.webp', mobile: '/store-images/banner2-mobile.webp', link: '/store/collection/oceans-pride' },
    { desktop: '/store-images/banner3-desktop.webp', mobile: '/store-images/banner3-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner4-desktop.webp', mobile: '/store-images/banner4-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner5-desktop.webp', mobile: '/store-images/banner5-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner6-desktop.webp', mobile: '/store-images/banner6-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner7-desktop.webp', mobile: '/store-images/banner7-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner8-desktop.webp', mobile: '/store-images/banner8-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner9-desktop.webp', mobile: '/store-images/banner9-mobile.webp', link: '/store/collection/promotion' },
    { desktop: '/store-images/banner10-desktop.webp', mobile: '/store-images/banner10-mobile.webp', link: '/store/collection/promotion' },
  ];
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#e4042c' }}>
      <div style={{ display: 'flex', transition: 'transform 0.6s ease', transform: `translateX(${dir === 'rtl' ? current * 100 : -(current * 100)}%)` }}>
        {slides.map((s, i) => (
          <div key={i} onClick={() => navigate(s.link)} style={{ minWidth: '100%', cursor: 'pointer' }}>
            <picture>
              <source media="(max-width: 768px)" srcSet={s.mobile} />
              <img src={s.desktop} alt="" style={{ width: '100%', display: 'block' }} />
            </picture>
          </div>
        ))}
      </div>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ width: i === current ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === current ? '#e4042c' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </section>
  );
}

/* ── Product Carousel ── */
function ProductCarousel({ title, products, viewAllLink, titleUnderline }: { title: string; products: any[]; viewAllLink?: string; titleUnderline?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { t } = useLang();
  // > arrow = show next items, < arrow = show previous items
  // In RTL the first items are on the right, scrolling "next" means going left
  const [canNext, setCanNext] = useState(false);
  const [canPrev, setCanPrev] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Check if we can scroll in either direction
      const atStart = Math.abs(scrollLeft) < 5;
      const atEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 5;
      // In RTL: start is right edge, end is left edge
      // > arrow (next) should be enabled when NOT at end
      // < arrow (prev) should be enabled when NOT at start
      setCanNext(!atEnd);
      setCanPrev(!atStart);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Small delay to let browser calculate RTL scroll position
      setTimeout(checkScroll, 100);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
    }
  }, [checkScroll, products]);

  const scrollNext = () => {
    if (scrollRef.current && canNext) {
      // In RTL, "next" means scrolling left (negative scrollLeft)
      const isRTL = getComputedStyle(scrollRef.current).direction === 'rtl';
      scrollRef.current.scrollBy({ left: isRTL ? -350 : 350, behavior: 'smooth' });
    }
  };
  const scrollPrev = () => {
    if (scrollRef.current && canPrev) {
      const isRTL = getComputedStyle(scrollRef.current).direction === 'rtl';
      scrollRef.current.scrollBy({ left: isRTL ? 350 : -350, behavior: 'smooth' });
    }
  };

  if (!products.length) return null;

  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <h2 className="store-section-title" style={{ fontSize: '28px', fontWeight: 700, color: '#333', textAlign: 'center', marginBottom: '25px', textDecoration: titleUnderline ? 'underline' : 'none', textUnderlineOffset: '8px' }}>{title}</h2>
        <div style={{ position: 'relative' }}>
          {/* Navigation arrows - stacked on the right like original */}
          <div className="store-carousel-arrows" style={{
            position: 'absolute', right: '-5px', top: '40%', transform: 'translateY(-50%)', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <button onClick={scrollNext} style={{
              background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canNext ? 'pointer' : 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canNext ? '#333' : '#ddd'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
            <button onClick={scrollPrev} style={{
              background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canPrev ? 'pointer' : 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canPrev ? '#333' : '#ddd'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          </div>

          <div ref={scrollRef} className="product-carousel-items" style={{
            display: 'flex', gap: '0', overflowX: 'auto', scrollBehavior: 'smooth', padding: '5px 0',
            scrollbarWidth: 'none',
          }}>
            {products.map(p => (
              <div key={p.id} className="store-product-carousel-item" style={{ minWidth: 'calc(25% - 1px)', maxWidth: 'calc(25% - 1px)', flexShrink: 0, borderLeft: '1px solid #f0f0f0' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
        {viewAllLink && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a onClick={() => navigate(viewAllLink)} style={{
              display: 'inline-block', background: '#e4042c', color: 'white', padding: '10px 30px', borderRadius: '25px',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', textDecoration: 'none',
            }}>{t('store.viewAll')}</a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Category Cards (الأكثر زيارة) ── */
function CategoryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { t } = useLang();
  const [canNext, setCanNext] = useState(false);
  const [canPrev, setCanPrev] = useState(false);

  const cats = [
    { handle: 'frozen_fries-appetizers', titleKey: 'cat.fries', image: '/store-images/cat-fries.webp' },
    { handle: 'frozen_beef', titleKey: 'cat.beef', image: '/store-images/cat-beef.jpg' },
    { handle: 'frozen_poultry', titleKey: 'cat.poultry', image: '/store-images/cat-poultry.jpg' },
    { handle: 'frozen_seafood', titleKey: 'cat.seafood', image: '/store-images/cat-seafood.jpg' },
    { handle: 'frozen_vegetables-fruits', titleKey: 'cat.vegetables', image: '/store-images/cat-vegs.jpg' },
    { handle: 'chilled-dry_cheese', titleKey: 'cat.dairy', image: '/store-images/cat-dairy.jpg' },
  ];

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atStart = Math.abs(scrollLeft) < 5;
      const atEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 5;
      setCanNext(!atEnd);
      setCanPrev(!atStart);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setTimeout(checkScroll, 100);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
    }
  }, [checkScroll]);

  const scrollNext = () => {
    if (scrollRef.current && canNext) {
      const isRTL = getComputedStyle(scrollRef.current).direction === 'rtl';
      scrollRef.current.scrollBy({ left: isRTL ? -350 : 350, behavior: 'smooth' });
    }
  };
  const scrollPrev = () => {
    if (scrollRef.current && canPrev) {
      const isRTL = getComputedStyle(scrollRef.current).direction === 'rtl';
      scrollRef.current.scrollBy({ left: isRTL ? 350 : -350, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <h2 className="store-section-title" style={{ fontSize: '28px', fontWeight: 700, color: '#333', textAlign: 'center', marginBottom: '25px' }}>{t('store.mostVisited')}</h2>
        <div style={{ position: 'relative' }}>
          {/* Navigation arrows - stacked on the right like original */}
          <div className="store-carousel-arrows" style={{
            position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <button onClick={scrollNext} style={{
              background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canNext ? 'pointer' : 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canNext ? '#333' : '#ddd'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
            <button onClick={scrollPrev} style={{
              background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canPrev ? 'pointer' : 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canPrev ? '#333' : '#ddd'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          </div>
          <div ref={scrollRef} style={{
            display: 'flex', gap: '20px', overflowX: 'auto', scrollBehavior: 'smooth', padding: '5px 0',
            scrollbarWidth: 'none',
          }}>
            {cats.map(cat => (
              <div key={cat.handle} className="store-category-card" onClick={() => navigate(`/store/collection/${cat.handle}`)}
                style={{
                  minWidth: 'calc(33.333% - 14px)', maxWidth: 'calc(33.333% - 14px)', flexShrink: 0, cursor: 'pointer',
                  borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee',
                  display: 'flex', alignItems: 'center', background: 'white',
                  transition: 'box-shadow 0.2s', height: '160px',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <img src={cat.image} alt={t(cat.titleKey)} style={{ width: '200px', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '20px', fontSize: '18px', fontWeight: 700, color: '#333', flex: 1, textAlign: 'center' }}>{t(cat.titleKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Brand Logos ── */
function BrandLogos() {
  const brands = [
    { name: "Chef's Palette", logo: '/store-images/brand-chefs-palette.png' },
    { name: 'Mr. Cleavers', logo: '/store-images/brand-mr-cleavers.png' },
    { name: 'Diamantina', logo: '/store-images/brand-diamantina.png' },
    { name: 'Lamb Weston', logo: '/store-images/brand-lamb-weston.png' },
    { name: 'Ardo', logo: '/store-images/brand-ardo.png' },
    { name: 'Sadia', logo: '/store-images/brand-sadia.png' },
    { name: "Ocean's Pride", logo: '/store-images/brand-oceans-pride.png' },
    { name: "Chef's Choice", logo: '/store-images/brand-chefs-choice.png' },
  ];

  return (
    <section style={{ padding: '50px 0', background: '#fff' }}>
      <div className="store-brand-logos" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '20px', alignItems: 'center' }}>
        {brands.map(b => (
          <div key={b.name} style={{ flex: '1 1 0', minWidth: 0, height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={b.logo} alt={b.name} style={{ maxWidth: '140px', maxHeight: '90px', objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Main Store Page ── */
export default function StorePage() {
  const { products, getProductsByCollection, isLoading } = useStore();
  const { t, dir } = useLang();

  if (isLoading) {
    return (
      <div dir={dir}>
        <StoreHeader />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid #eee', borderTop: '4px solid #e4042c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
            <p style={{ color: '#666' }}>{t('store.loading')}</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const newArrivals = getProductsByCollection('new-arrivals').slice(0, 10);
  const bestSellers = getProductsByCollection('frontpage').slice(0, 12);
  const offers = getProductsByCollection('promotion');
  const oceansPride = getProductsByCollection('oceans-pride').slice(0, 10);

  return (
    <div dir={dir} style={{ background: '#fff', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <StoreHeader />
      <CartDrawer />

      {/* Hero Slider */}
      <HeroSlider />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductCarousel title={t('store.newArrivals')} products={newArrivals} viewAllLink="/store/collection/new-arrivals" />
      )}

      {/* Best Sellers */}
      <ProductCarousel title={t('store.bestSellers')} products={bestSellers} viewAllLink="/store/collection/all-products" />

      {/* Most Visited Categories */}
      <CategoryCards />

      {/* Special Offers */}
      {offers.length > 0 && (
        <ProductCarousel title={t('store.specialOffers')} products={offers} viewAllLink="/store/collection/promotion" />
      )}

      {/* Ocean's Pride */}
      {oceansPride.length > 0 && (
        <ProductCarousel title={t('store.oceansPride')} products={oceansPride} viewAllLink="/store/collection/oceans-pride" titleUnderline />
      )}

      {/* Brand Logos */}
      <BrandLogos />

      <StoreFooter />

      <style>{`
        div::-webkit-scrollbar { display: none; }
        
        @media (max-width: 768px) {
          .store-product-carousel-item {
            min-width: calc(50% - 1px) !important;
            max-width: calc(50% - 1px) !important;
          }
          .store-category-card {
            min-width: 100% !important;
            max-width: 100% !important;
            height: 120px !important;
          }
          .store-category-card img {
            width: 140px !important;
            height: 120px !important;
          }
          .store-brand-logos {
            flex-wrap: wrap !important;
            gap: 12px !important;
            padding: 0 20px !important;
            justify-content: center !important;
          }
          .store-brand-logos > div {
            flex: 0 0 auto !important;
            min-width: 80px !important;
          }
          .store-brand-logos img {
            max-width: 100px !important;
            max-height: 60px !important;
          }
          .store-section-title {
            font-size: 22px !important;
          }
          .store-carousel-arrows {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
