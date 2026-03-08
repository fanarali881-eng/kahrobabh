import { useState } from 'react';
import { useStore, Product, Variant } from './StoreContext';
import { useLang } from './LanguageContext';
import { useLocation } from 'wouter';
import QuickAddModal from './QuickAddModal';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: ProductCardProps) {
  const { addToCart } = useStore();
  const { lang, t, dir } = useLang();
  const [, navigate] = useLocation();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const variant = product.variants[0];
  const isCatchWeight = product.tags?.includes('catch_weight_item');
  const hasMultipleVariants = product.variants.length > 1;
  const saveTag = product.tags?.find(t => t.startsWith('Save '));
  const savePercent = saveTag ? saveTag.replace('Save ', '') : null;

  // Always apply 50% discount to all products
  const originalPrice = parseFloat(variant?.price || '0');
  const discountedPrice = (originalPrice * 0.5).toFixed(3);
  const discountPercent = 50;

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const getTitle = () => {
    if (lang === 'ar') return product.titleAr || product.title;
    return product.title;
  };

  const hasBadges = product.isOffer || product.isNew || isCatchWeight || !!savePercent;

  return (
    <>
      <div style={{
        background: 'white',
        overflow: 'visible',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate(`/store/product/${product.handle}`)}>

        {/* Badges row - ABOVE the image, outside */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          padding: '0 4px',
          minHeight: '32px',
          direction: dir,
        }}>
          {product.isNew && (
            <span style={{
              background: 'white',
              color: '#333',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1.5px solid #e0e0e0',
              borderRadius: '2px',
            }}>{t('product.new')}</span>
          )}
          {product.isOffer && (
            <span style={{
              background: 'white',
              color: '#333',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1.5px solid #e0e0e0',
              borderRadius: '2px',
            }}>{t('product.specialOffer')}</span>
          )}
          {/* Save X% Discount in Cart badge for box products */}
          {savePercent && (
            <span style={{
              background: 'white',
              color: '#333',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1.5px solid #e0e0e0',
              borderRadius: '2px',
            }}>{savePercent} {t('product.discountInCart')}</span>
          )}
          {/* Weight icon for catch_weight items */}
          {isCatchWeight && (
            <div style={{ marginRight: lang === 'ar' ? 'auto' : '0', marginLeft: lang === 'en' ? 'auto' : '0' }}>
              <img src="/store-images/weight-icon.png" alt="كغ" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '100%', background: '#fff' }}>
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
          />

          {/* Add to cart button - bottom left, red cart icon, only visible on hover */}
          <button onClick={handleCartClick}
            style={{
              position: 'absolute', bottom: '8px', left: '8px',
              background: 'transparent',
              color: '#e4042c',
              border: 'none',
              borderRadius: '0', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.3s',
              padding: 0,
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? 'auto' : 'none',
            }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#e4042c">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="product-card-info" style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', direction: dir, textAlign: 'center' }}>
          {/* Product title - larger */}
          <div className="product-card-title" style={{
            fontSize: '15px', fontWeight: 500, color: '#333', marginBottom: '4px',
            lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
          }}>
            {getTitle()}
          </div>
          {/* Vendor */}
          <div className="product-card-vendor" style={{ fontSize: '11px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.vendor}
          </div>

          <div style={{ marginTop: 'auto' }}>
            {/* New discounted price */}
            <div className="product-card-price" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {!isCatchWeight && hasMultipleVariants && <span className="product-card-from" style={{ fontSize: '12px', color: '#999' }}>{t('product.from')}</span>}
              <span className="product-card-price-value" style={{ fontSize: '15px', fontWeight: 700, color: '#333' }}>
                {isCatchWeight ? `KG/BD${discountedPrice}` : `BD ${discountedPrice}`}
              </span>
            </div>
            {/* Old price in red with strikethrough */}
            <div className="product-card-old-price" style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: '#e4042c', textDecoration: 'line-through', fontWeight: 500 }}>
                {isCatchWeight ? `KG/BD${variant?.price}` : `BD ${variant?.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Discount pill badge -50% - bottom left of card - always shown */}
        <div className="discount-badge" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
          <span style={{
            background: '#e4042c', color: 'white',
            borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            padding: '4px 12px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}>
            {discountPercent}%-
          </span>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showModal && (
        <QuickAddModal
          product={product}
          onClose={() => setShowModal(false)}
        />
      )}
      <style>{`
        @media (max-width: 768px) {
          .discount-badge span {
            font-size: 10px !important;
            padding: 2px 7px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
