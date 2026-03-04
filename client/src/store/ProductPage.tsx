import { useState, useMemo } from 'react';
import { useStore, Product } from './StoreContext';
import { useLang } from './LanguageContext';
import { useRoute, useLocation } from 'wouter';
import ProductCard from './ProductCard';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from './CartDrawer';

export default function ProductPage() {
  const { getProductByHandle, addToCart, products, isLoading, setCartDrawerOpen } = useStore();
  const { lang, t, dir, isRTL } = useLang();
  const [, params] = useRoute('/store/product/:handle');
  const [, navigate] = useLocation();
  const handle = params?.handle || '';
  const product = getProductByHandle(handle);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.vendor === product.vendor || p.productType === product.productType))
      .slice(0, 8);
  }, [product, products]);

  const getTitle = (p: any) => {
    if (lang === 'ar') return p.titleAr || p.title;
    return p.title;
  };

  const getDescription = (p: any) => {
    if (lang === 'ar' && p.descriptionAr) return p.descriptionAr;
    return p.bodyHtml || '';
  };

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

  if (!product) {
    return (
      <div dir={dir}>
        <StoreHeader />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>{t('productPage.notFound')}</p>
          <a onClick={() => navigate('/store')} style={{ color: '#e4042c', cursor: 'pointer' }}>{t('productPage.backToHome')}</a>
        </div>
        <StoreFooter />
      </div>
    );
  }

  const variant = product.variants[selectedVariant];
  const images = product.images || [product.image];
  const isCatchWeight = product.tags?.includes('catch_weight_item');

  // Always apply 50% discount to all products
  const originalPrice = parseFloat(variant?.price || '0');
  const discountedPrice = (originalPrice * 0.5).toFixed(3);
  const discountPercent = 50;

  // Badges
  const isNew = product.tags?.includes('new');
  const isOnSale = true;

  const getVariantLabel = (title: string) => {
    const tl = title.toLowerCase();
    if (tl === 'piece' || tl === 'default title' || tl === '1') {
      return lang === 'ar' ? 'قطعة واحدة' : 'Piece';
    }
    if (tl.includes('carton') || tl.includes('box')) {
      const match = tl.match(/(\d+)/);
      if (match) return lang === 'ar' ? `كرتونة ( ${match[1]} قطع )` : `Carton (${match[1]} pcs)`;
      return lang === 'ar' ? 'كرتونة' : 'Carton';
    }
    return title;
  };

  const handleAddToCart = () => {
    if (variant) {
      addToCart(product, variant, quantity);
      setCartDrawerOpen(true);
    }
  };

  const descHtml = getDescription(product);

  return (
    <div dir={dir} style={{ background: '#fff', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <StoreHeader />
      <CartDrawer />

      <div className="product-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 30px', width: '100%', overflow: 'hidden' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '10px', display: 'flex', gap: '5px' }}>
          <a onClick={() => navigate('/store')} style={{ color: '#999', cursor: 'pointer', textDecoration: 'none' }}>{t('productPage.home')}</a>
        </div>

        {/* Badges above product */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {isNew && (
            <span style={{
              padding: '4px 14px', border: '1px solid #333', borderRadius: '0',
              fontSize: '13px', fontWeight: 600, color: '#333', background: 'white',
            }}>{t('product.new')}</span>
          )}
          {isOnSale && (
            <span style={{
              padding: '4px 14px', border: '1px solid #333', borderRadius: '0',
              fontSize: '13px', fontWeight: 600, color: '#333', background: 'white',
            }}>{t('product.specialOffer')}</span>
          )}
        </div>

        {/* Product detail - 2 columns */}
        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
          {/* Left: Images */}
          <div>
            <div style={{ borderRadius: '0', overflow: 'hidden', marginBottom: '10px', background: '#fff' }}>
              <img src={images[selectedImage]} alt={getTitle(product)} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
            </div>
            {images.length > 1 && (
              <div className="product-images-thumbs" style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setSelectedImage(i)}
                    className="product-image-thumb"
                    style={{
                      width: '70px', height: '70px', objectFit: 'contain', cursor: 'pointer',
                      border: selectedImage === i ? '2px solid #e4042c' : '2px solid #eee',
                    }} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Brand */}
            <a style={{
              fontSize: '14px', color: '#333', marginBottom: '8px',
              textDecoration: 'underline', cursor: 'pointer', fontWeight: 600,
            }}>{product.vendor}</a>

            {/* Title */}
            <h1 className="product-title" style={{ fontSize: '28px', fontWeight: 700, color: '#333', marginBottom: '15px', lineHeight: 1.4 }}>
              {getTitle(product)}
            </h1>

            {/* Price */}
            <div className="product-price-section" style={{ marginBottom: '20px' }}>
              <span className="product-price" style={{ fontSize: '22px', fontWeight: 700, color: '#333' }}>
                {isCatchWeight ? `KG/KD${discountedPrice}` : `KD ${discountedPrice}`}
              </span>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '15px', color: '#e4042c', textDecoration: 'line-through' }}>
                  {isCatchWeight ? `KG/KD${variant?.price}` : `KD ${variant?.price}`}
                </span>
              </div>
              <span style={{ background: '#e4042c', color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: 700, padding: '4px 14px', marginTop: '8px', display: 'inline-block' }}>
                {discountPercent}%-
              </span>
            </div>

            {/* Variant selector */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#333' }}>{t('productPage.packageType')}</div>
                <div className="product-variants" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.variants.map((v, i) => (
                    <button key={v.id} onClick={() => { setSelectedVariant(i); setQuantity(1); }}
                      style={{
                        padding: '10px 22px', borderRadius: '30px', cursor: 'pointer', fontSize: '14px',
                        background: 'white',
                        color: '#333',
                        border: selectedVariant === i ? '2px solid #333' : '1.5px solid #ddd',
                        fontWeight: selectedVariant === i ? 600 : 400,
                        transition: 'all 0.2s',
                      }}>
                      {getVariantLabel(v.title)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart on same row */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#333' }}>{t('productPage.quantity')}</div>
              <div className="product-quantity-cart" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Quantity selector */}
                <div className="product-quantity-selector" style={{
                  display: 'flex', alignItems: 'center',
                  border: '1.5px solid #ddd', borderRadius: '30px',
                  overflow: 'hidden',
                }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      padding: '12px 18px', background: 'white', border: 'none',
                      cursor: 'pointer', fontSize: '18px', color: '#333',
                    }}>−</button>
                  <span style={{
                    padding: '12px 20px', fontSize: '16px', fontWeight: 600,
                    minWidth: '40px', textAlign: 'center', color: '#333',
                  }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{
                      padding: '12px 18px', background: 'white', border: 'none',
                      cursor: 'pointer', fontSize: '18px', color: '#333',
                    }}>+</button>
                </div>

                {/* Add to cart button */}
                <button onClick={handleAddToCart}
                  className="product-add-to-cart"
                  style={{
                    flex: 1, padding: '14px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer',
                    fontSize: '17px', fontWeight: 700,
                    background: '#e4042c', color: 'white',
                    transition: 'all 0.2s',
                  }}>
                  {t('productPage.addToCart')}
                </button>
              </div>
            </div>

            {/* Description */}
            {descHtml && (
              <div className="product-description" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3 className="product-description-title" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#333' }}>{t('productPage.description')}</h3>
                <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.9 }} dangerouslySetInnerHTML={{ __html: descHtml }} />
              </div>
            )}

            {/* Origin */}
            {product.tags?.some(tag => tag.includes('uae') || tag.includes('kuwait') || tag.includes('australia')) && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  {product.tags!.includes('uae') ? t('origin.uae') :
                   product.tags!.includes('australia') ? t('origin.australia') :
                   product.tags!.includes('kuwait') ? t('origin.kuwait') : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333', textAlign: 'center', marginBottom: '20px' }}>{t('productPage.relatedProducts')}</h2>
            <div className="store-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <StoreFooter />

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .store-related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
