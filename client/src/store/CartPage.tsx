import { useStore } from './StoreContext';
import { useLocation } from 'wouter';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, clearCart } = useStore();
  const [, navigate] = useLocation();
  const total = getCartTotal();

  const handleCheckout = () => {
    const cartData = cart.map(item => ({
      name: item.product.titleAr || item.product.title,
      variant: item.variant.title,
      price: parseFloat(item.variant.price) * 0.5,
      quantity: item.quantity,
      image: item.product.image,
    }));
    
    sessionStorage.setItem('makani-checkout', JSON.stringify({
      items: cartData,
      total: total,
      currency: 'KWD',
    }));
    
    navigate('/summary-payment');
  };

  return (
    <div dir="rtl" style={{ background: '#fafafa', minHeight: '100vh' }}>
      <StoreHeader />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>سلة التسوق</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 15px' }}>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>سلة التسوق فارغة</p>
            <a onClick={() => navigate('/store')} style={{
              display: 'inline-block', padding: '10px 30px', background: '#e4042c', color: 'white',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none',
            }}>تصفح المنتجات</a>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.variant.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
                    borderBottom: index < cart.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }} className="cart-item">
                  <img src={item.product.image} alt={item.product.title}
                    onClick={() => navigate(`/store/product/${item.product.handle}`)}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>{item.product.titleAr || item.product.title}</div>
                    {item.variant.title !== 'Default Title' && (
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{item.variant.title}</div>
                    )}
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{(parseFloat(item.variant.price) * 0.5).toFixed(3)} KD</div>
                    <div style={{ fontSize: '12px', color: '#e4042c', textDecoration: 'line-through' }}>{item.variant.price} KD</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #ddd', borderRadius: '6px', flexShrink: 0 }}>
                    <button onClick={() => updateCartQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                      style={{ padding: '5px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}>-</button>
                    <span style={{ padding: '5px 12px', fontSize: '14px', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                      style={{ padding: '5px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
                    {(parseFloat(item.variant.price) * 0.5 * item.quantity).toFixed(3)} KD
                  </div>

                  <button onClick={() => removeFromCart(item.product.id, item.variant.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336', fontSize: '18px', flexShrink: 0, padding: '5px' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>المجموع الفرعي</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>{total.toFixed(3)} KD</span>
              </div>
              {total >= 20 && (
                <div style={{ fontSize: '13px', color: '#4CAF50', marginBottom: '10px' }}>✓ توصيل مجاني</div>
              )}
              {total < 20 && (
                <div style={{ fontSize: '13px', color: '#ff9800', marginBottom: '10px' }}>
                  أضف {(20 - total).toFixed(3)} KD للحصول على توصيل مجاني
                </div>
              )}

              <button onClick={handleCheckout}
                style={{
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '16px', fontWeight: 600, background: '#e4042c', color: 'white', marginBottom: '10px',
                }}>
                إتمام الطلب - {total.toFixed(3)} KD
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a onClick={() => navigate('/store')} style={{
                  flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                  color: '#666', cursor: 'pointer', fontSize: '14px', textDecoration: 'none',
                }}>متابعة التسوق</a>
                <button onClick={clearCart} style={{
                  padding: '10px 20px', borderRadius: '8px', border: '1px solid #f44336',
                  color: '#f44336', background: 'white', cursor: 'pointer', fontSize: '14px',
                }}>إفراغ السلة</button>
              </div>
            </div>
          </>
        )}
      </div>

      <StoreFooter />

      <style>{`
        @media (max-width: 768px) {
          .cart-item {
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 12px !important;
          }
          .cart-item img {
            width: 65px !important;
            height: 65px !important;
          }
        }
      `}</style>
    </div>
  );
}
