import { useMemo } from 'react';
import { useStore } from './StoreContext';
import { useLang } from './LanguageContext';
import { useLocation } from 'wouter';
import ProductCard from './ProductCard';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from './CartDrawer';

export default function SearchPage() {
  const { searchProducts, isLoading } = useStore();
  const { t, dir } = useLang();
  const [location] = useLocation();

  const query = useMemo(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return params.get('q') || '';
  }, [location]);

  const results = useMemo(() => searchProducts(query), [query, searchProducts]);

  if (isLoading) {
    return (
      <div dir={dir}>
        <StoreHeader />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #eee', borderTop: '4px solid #e4042c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div dir={dir} style={{ background: '#fafafa', minHeight: '100vh' }}>
      <StoreHeader />
      <CartDrawer />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
          {t('search.resultsFor')} "{query}"
        </h1>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>{results.length} {t('search.results')}</p>

        {results.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {results.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>{t('search.noResults')}</p>
            <p style={{ fontSize: '14px', color: '#999' }}>{t('search.tryDifferent')}</p>
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
