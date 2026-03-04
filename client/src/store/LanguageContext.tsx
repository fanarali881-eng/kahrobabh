import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'ar' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

// UI translations
const translations: Record<string, Record<Lang, string>> = {
  // Header / Announcement
  'header.freeShippingBanner': {
    ar: 'توصيل مجاني للطلبات بقيمة 20 د.ك أو أكثر - شروط التوصيل ←',
    en: 'Free delivery for orders of 20 KD or more - Delivery terms ←',
  },
  'header.frozenFoods': { ar: 'أطعمة مجمدة', en: 'Frozen Foods' },
  'header.chilledDry': { ar: 'أطعمة مبردة وجافة', en: 'Chilled & Dry Foods' },
  'header.newArrivals': { ar: 'وصل حديثاً', en: 'New Arrivals' },
  'header.offers': { ar: 'عروض', en: 'Offers' },
  'header.boxes': { ar: 'بوكسات', en: 'Boxes' },
  'header.searchPlaceholder': { ar: 'ابحث عن منتجات...', en: 'Search products...' },
  'header.search': { ar: 'بحث', en: 'Search' },
  'header.noResults': { ar: 'لا توجد نتائج', en: 'No results' },
  'header.shopFrozen': { ar: 'تسوق الأطعمة المجمدة', en: 'Shop Frozen Foods' },
  'header.shopChilledDry': { ar: 'تسوق الأطعمة المبردة والجافة', en: 'Shop Chilled & Dry Foods' },
  'header.logoName': { ar: 'مكاني\nفودز', en: 'Makani\nFoods' },
  'header.logoTagline': { ar: 'مختصوا الأغذية المجمدة', en: 'Frozen Food Specialists' },

  // Product Card
  'product.new': { ar: 'جديد', en: 'New' },
  'product.specialOffer': { ar: 'عرض خاص', en: 'Special Offer' },
  'product.from': { ar: 'من', en: 'From' },
  'product.discountInCart': { ar: 'خصم في السلة', en: 'Discount in Cart' },

  // Quick Add Modal
  'quickAdd.packageType': { ar: 'نوع العبوة', en: 'Package Type' },
  'quickAdd.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart' },
  'quickAdd.added': { ar: '✓ تمت الإضافة', en: '✓ Added' },
  'quickAdd.viewDetails': { ar: 'عرض التفاصيل الكاملة', en: 'View Full Details' },

  // Variant labels
  'variant.piece': { ar: 'قطعة واحدة', en: 'Piece' },
  'variant.carton': { ar: 'كرتونة', en: 'Carton' },

  // Cart Drawer
  'cart.myCart': { ar: 'سلتي', en: 'My Cart' },
  'cart.empty': { ar: 'سلتك فارغة', en: 'Your cart is empty' },
  'cart.congratsFreeShipping': { ar: 'مبروك! أنت مؤهل للحصول على توصيل مجاني!', en: 'Congratulations! You qualify for free delivery!' },
  'cart.remainingForFreeShipping': { ar: 'أنت على بعد {amount} د.ك للحصول على توصيل مجاني!', en: 'You are {amount} KD away from free delivery!' },
  'cart.packageType': { ar: 'نوع العبوة:', en: 'Package:' },
  'cart.addNote': { ar: 'أضف ملاحظة على الطلب', en: 'Add a note to your order' },
  'cart.total': { ar: 'اجمالي', en: 'Total' },
  'cart.deliveryNote': { ar: 'رسوم التوصيل محسوبة على صفحة الشراء.', en: 'Delivery fees calculated at checkout.' },
  'cart.catchWeightNote': {
    ar: 'سعر الحبة {price} د.ك. سيتم استرداد أي فرق نقدي لحسابك تلقائيًا بناء على الوزن الصافي.',
    en: 'Price per piece {price} KD. Any difference will be automatically refunded based on net weight.',
  },

  // Product Page
  'productPage.home': { ar: 'الصفحة الرئيسية', en: 'Home' },
  'productPage.description': { ar: 'الوصف', en: 'Description' },
  'productPage.quantity': { ar: 'الكمية', en: 'Quantity' },
  'productPage.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart' },
  'productPage.relatedProducts': { ar: 'منتجات مشابهة', en: 'Related Products' },
  'productPage.notFound': { ar: 'المنتج غير موجود', en: 'Product not found' },
  'productPage.backToHome': { ar: 'العودة للرئيسية', en: 'Back to Home' },
  'productPage.packageType': { ar: 'نوع العبوة', en: 'Package Type' },

  // Collection Page
  'collection.home': { ar: 'الرئيسية', en: 'Home' },
  'collection.products': { ar: 'منتج', en: 'products' },
  'collection.defaultSort': { ar: 'الترتيب الافتراضي', en: 'Default Sort' },
  'collection.priceAsc': { ar: 'السعر: من الأقل للأعلى', en: 'Price: Low to High' },
  'collection.priceDesc': { ar: 'السعر: من الأعلى للأقل', en: 'Price: High to Low' },
  'collection.nameAsc': { ar: 'الاسم: أ - ي', en: 'Name: A - Z' },
  'collection.nameDesc': { ar: 'الاسم: ي - أ', en: 'Name: Z - A' },
  'collection.noProducts': { ar: 'لا توجد منتجات في هذا التصنيف', en: 'No products in this category' },
  'collection.backToHome': { ar: 'العودة للرئيسية', en: 'Back to Home' },
  'collection.previous': { ar: 'السابق', en: 'Previous' },
  'collection.next': { ar: 'التالي', en: 'Next' },
  'collection.allProducts': { ar: 'جميع المنتجات', en: 'All Products' },
  'collection.newArrivals': { ar: 'وصل حديثاً', en: 'New Arrivals' },
  'collection.offers': { ar: 'عروض', en: 'Offers' },
  'collection.boxes': { ar: 'بوكسات', en: 'Boxes' },
  'collection.bestSellers': { ar: 'الأكثر مبيعاً', en: 'Best Sellers' },
  'collection.oceansPride': { ar: 'أوشنز برايد', en: "Ocean's Pride" },

  // Store Page
  'store.newArrivals': { ar: 'وصل حديثاً', en: 'New Arrivals' },
  'store.bestSellers': { ar: 'الأكثر مبيعا', en: 'Best Sellers' },
  'store.mostVisited': { ar: 'الأكثر زيارة', en: 'Most Visited' },
  'store.specialOffers': { ar: 'عروض خاصة', en: 'Special Offers' },
  'store.oceansPride': { ar: 'أوشنز برايد', en: "Ocean's Pride" },
  'store.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'store.loading': { ar: 'جاري تحميل المتجر...', en: 'Loading store...' },

  // Category Cards
  'cat.fries': { ar: 'بطاطا مقلية ومقبلات', en: 'Fries & Appetizers' },
  'cat.beef': { ar: 'لحم بقر و عجل', en: 'Beef & Veal' },
  'cat.poultry': { ar: 'دواجن', en: 'Poultry' },
  'cat.seafood': { ar: 'مأكولات بحرية', en: 'Seafood' },
  'cat.vegetables': { ar: 'خضار وفواكه', en: 'Vegetables & Fruits' },
  'cat.dairy': { ar: 'ألبان ، أجبان ، وبيض', en: 'Dairy, Cheese & Eggs' },

  // Search Page
  'search.resultsFor': { ar: 'نتائج البحث عن', en: 'Search results for' },
  'search.results': { ar: 'نتيجة', en: 'results' },
  'search.noResults': { ar: 'لم يتم العثور على نتائج', en: 'No results found' },
  'search.tryDifferent': { ar: 'حاول البحث بكلمات مختلفة', en: 'Try searching with different keywords' },

  // Footer
  'footer.brandName': { ar: 'مكاني فودز', en: 'Makani Foods' },
  'footer.about': {
    ar: 'مختصوا الأغذية المجمدة في الكويت. نوفر لك أجود المنتجات المجمدة والمبردة بأسعار منافسة مع توصيل لباب بيتك.',
    en: 'Frozen food specialists in Kuwait. We provide you with the finest frozen and chilled products at competitive prices with delivery to your doorstep.',
  },
  'footer.customerSupport': { ar: 'دعم العملاء', en: 'Customer Support' },
  'footer.contactUs': { ar: 'تواصل معنا', en: 'Contact Us' },
  'footer.faq': { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  'footer.storeInfo': { ar: 'معلومات عن المحلات', en: 'Store Info' },
  'footer.aboutUs': { ar: 'نبذة عنا', en: 'About Us' },
  'footer.policies': { ar: 'السياسات', en: 'Policies' },
  'footer.returnPolicy': { ar: 'سياسة الاستبدال والاسترجاع', en: 'Return & Exchange Policy' },
  'footer.deliveryTerms': { ar: 'شروط التوصيل', en: 'Delivery Terms' },
  'footer.privacyPolicy': { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  'footer.termsConditions': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'footer.contactTitle': { ar: 'تواصل معنا', en: 'Contact Us' },
  'footer.paymentMethods': { ar: 'طرق الدفع:', en: 'Payment Methods:' },
  'footer.copyright': { ar: '© {year} مكاني فودز. جميع الحقوق محفوظة.', en: '© {year} Makani Foods. All rights reserved.' },

  // Origins
  'origin.uae': { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates' },
  'origin.australia': { ar: 'أستراليا', en: 'Australia' },
  'origin.kuwait': { ar: 'الكويت', en: 'Kuwait' },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('makani-lang');
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    localStorage.setItem('makani-lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => prev === 'ar' ? 'en' : 'ar');
  }, []);

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['ar'] || key;
  }, [lang]);

  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
