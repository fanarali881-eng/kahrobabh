import { useState, useMemo, useEffect } from 'react';
import { useStore } from './StoreContext';
import { useLang } from './LanguageContext';
import { useRoute, useLocation } from 'wouter';
import ProductCard from './ProductCard';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from './CartDrawer';

export default function CollectionPage() {
  const { products, getProductsByCollection, categories, isLoading } = useStore();
  const { lang, t, dir } = useLang();
  const [, params] = useRoute('/store/collection/:handle');
  const [, navigate] = useLocation();
  const handle = params?.handle || '';
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 24;

  // Reset page when handle changes
  useEffect(() => { setCurrentPage(1); setSortBy('default'); }, [handle]);

  // Helper to get title based on language
  const getCatTitle = (item: any) => {
    if (lang === 'en' && item.titleEn) return item.titleEn;
    return item.title;
  };

  // Find collection title and parent info
  let title = handle;
  let parentCategory: string | null = null;
  let parentTitle: string | null = null;
  let subcategories: any[] = [];

  // Special collection names
  const specialNames: Record<string, string> = {
    'all-products': t('collection.allProducts'),
    'new-arrivals': t('collection.newArrivals'),
    'promotion': t('collection.offers'),
    'boxes': t('collection.boxes'),
    'frontpage': t('collection.bestSellers'),
    'oceans-pride': t('collection.oceansPride'),
  };

  if (specialNames[handle]) {
    title = specialNames[handle];
  } else {
    // Check main categories and their nested subcategories
    for (const [, cat] of Object.entries(categories)) {
      if (cat.handle === handle) {
        title = getCatTitle(cat);
        subcategories = cat.subcategories || [];
        break;
      }
      // Check level 1 subcategories
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          if (sub.handle === handle) {
            title = getCatTitle(sub);
            parentCategory = cat.handle;
            parentTitle = getCatTitle(cat);
            subcategories = (sub as any).subcategories || [];
            break;
          }
          // Check level 2 subcategories (nested)
          if ((sub as any).subcategories) {
            for (const nested of (sub as any).subcategories) {
              if (nested.handle === handle) {
                title = getCatTitle(nested);
                parentCategory = cat.handle;
                parentTitle = getCatTitle(cat);
                break;
              }
            }
          }
        }
      }
    }
  }

  // Get products
  const collectionProducts = useMemo(() => {
    if (handle === 'all-products') return products;
    
    const directProducts = getProductsByCollection(handle);
    if (directProducts.length > 0) return directProducts;
    
    // If no direct products, try aggregating from subcategories
    if (subcategories.length > 0) {
      const allIds = new Set<number>();
      const allProducts: any[] = [];
      for (const sub of subcategories) {
        const subProds = getProductsByCollection(sub.handle);
        for (const p of subProds) {
          if (!allIds.has(p.id)) {
            allIds.add(p.id);
            allProducts.push(p);
          }
        }
        if (sub.subcategories) {
          for (const nested of sub.subcategories) {
            const nestedProds = getProductsByCollection(nested.handle);
            for (const p of nestedProds) {
              if (!allIds.has(p.id)) {
                allIds.add(p.id);
                allProducts.push(p);
              }
            }
          }
        }
      }
      return allProducts;
    }
    
    return directProducts;
  }, [handle, products, getProductsByCollection, subcategories]);

  // Sort
  const sortedProducts = useMemo(() => {
    const sorted = [...collectionProducts];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => parseFloat(a.variants[0]?.price || '0') - parseFloat(b.variants[0]?.price || '0'));
      case 'price-desc':
        return sorted.sort((a, b) => parseFloat(b.variants[0]?.price || '0') - parseFloat(a.variants[0]?.price || '0'));
      case 'name-asc':
        return sorted.sort((a, b) => {
          const aTitle = lang === 'ar' ? (a.titleAr || a.title) : a.title;
          const bTitle = lang === 'ar' ? (b.titleAr || b.title) : b.title;
          return aTitle.localeCompare(bTitle, lang === 'ar' ? 'ar' : 'en');
        });
      case 'name-desc':
        return sorted.sort((a, b) => {
          const aTitle = lang === 'ar' ? (a.titleAr || a.title) : a.title;
          const bTitle = lang === 'ar' ? (b.titleAr || b.title) : b.title;
          return bTitle.localeCompare(aTitle, lang === 'ar' ? 'ar' : 'en');
        });
      default:
        return sorted;
    }
  }, [collectionProducts, sortBy, lang]);

  const totalPages = Math.ceil(sortedProducts.length / perPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

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
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <a onClick={() => navigate('/store')} style={{ color: '#e4042c', cursor: 'pointer', textDecoration: 'none' }}>{t('collection.home')}</a>
          <span>/</span>
          {parentCategory && (
            <>
              <a onClick={() => navigate(`/store/collection/${parentCategory}`)} style={{ color: '#e4042c', cursor: 'pointer', textDecoration: 'none' }}>
                {parentTitle}
              </a>
              <span>/</span>
            </>
          )}
          <span>{title}</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>{title}</h1>

        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {subcategories.map((sub: any) => (
              <a key={sub.handle} onClick={() => navigate(`/store/collection/${sub.handle}`)}
                style={{
                  padding: '8px 18px', borderRadius: '20px', fontSize: '14px',
                  background: 'white', border: '1px solid #ddd', color: '#333',
                  cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s',
                  fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e4042c'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#e4042c'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#333'; e.currentTarget.style.borderColor = '#ddd'; }}>
                {getCatTitle(sub)}
              </a>
            ))}
          </div>
        )}

        {/* Sort & count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>{sortedProducts.length} {t('collection.products')}</span>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', background: 'white', direction: dir }}>
            <option value="default">{t('collection.defaultSort')}</option>
            <option value="price-asc">{t('collection.priceAsc')}</option>
            <option value="price-desc">{t('collection.priceDesc')}</option>
            <option value="name-asc">{t('collection.nameAsc')}</option>
            <option value="name-desc">{t('collection.nameDesc')}</option>
          </select>
        </div>

        {/* Products grid */}
        {paginatedProducts.length > 0 ? (
          <div className="store-collection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {paginatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>{t('collection.noProducts')}</p>
            <a onClick={() => navigate('/store')} style={{ color: '#e4042c', cursor: 'pointer', textDecoration: 'none' }}>{t('collection.backToHome')}</a>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '30px', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
              <button onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                {t('collection.previous')}
              </button>
            )}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              let page: number;
              if (totalPages <= 10) {
                page = i + 1;
              } else if (currentPage <= 5) {
                page = i + 1;
              } else if (currentPage >= totalPages - 4) {
                page = totalPages - 9 + i;
              } else {
                page = currentPage - 4 + i;
              }
              return (
                <button key={page} onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
                    background: currentPage === page ? '#e4042c' : 'white',
                    color: currentPage === page ? 'white' : '#333',
                    border: currentPage === page ? '1px solid #e4042c' : '1px solid #ddd',
                  }}>
                  {page}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <button onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                {t('collection.next')}
              </button>
            )}
          </div>
        )}
      </div>

      <StoreFooter />

      <style>{`
        @media (max-width: 768px) {
          .store-collection-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
