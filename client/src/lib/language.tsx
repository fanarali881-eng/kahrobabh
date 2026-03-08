import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  toggleLang: () => {},
  t: (key: string) => key,
  dir: "rtl",
});

export const useLanguage = () => useContext(LanguageContext);

const translations: Record<string, Record<Lang, string>> = {
  // Header
  "lang_toggle": { ar: "English", en: "عربي" },
  "electronic_services": { ar: "الخدمات الإلكترونية", en: "eServices" },
  "information_guide": { ar: "دليل المعلومات", en: "Information Guide" },
  "login": { ar: "تسجيل الدخول", en: "Login" },
  "login_popup_msg": { ar: "بإمكانك الدفع من خلال خدمة الدفع السريع أدناه", en: "You can pay through the quick payment service below" },

  // Navigation
  "home_page": { ar: "الصفحة الرئيسية", en: "Home" },
  "services_by_category": { ar: "الخدمات الإلكترونية حسب التصنيف", en: "eServices by Category" },
  "services_by_provider": { ar: "الخدمات الإلكترونية حسب المقدم", en: "eServices by Provider" },
  "gov_app_store": { ar: "متجر تطبيقات الحكومة الإلكترونية", en: "eGovernment Apps Store" },

  // Banner
  "banner_text1": { ar: "استفد من خدمات التخويل الإلكتروني", en: "Benefit from electronic authorization services" },
  "banner_text2": { ar: "لإنجاز خدمات المكاتب الأمامية للجهات الحكومية", en: "To complete front office services for government entities" },

  // Form
  "pay_ewa_bill": { ar: "دفع فاتورة الكهرباء والماء", en: "Pay Electricity & Water Bill" },
  "menu": { ar: "القائمة", en: "Menu" },
  "click_instructions": { ar: "اضغط هنا لعرض التعليمات", en: "Click here to view instructions" },
  "required_data": { ar: "بيانات مطلوبة", en: "Required Data" },
  "client_details": { ar: "تفاصيل العميل", en: "Client Details" },
  "id_type": { ar: "نوع الهوية:", en: "ID Type:" },
  "select_id_type": { ar: "-- اختر نوع الهوية --", en: "-- Select ID Type --" },
  "id_number": { ar: "رقم الهوية:", en: "ID Number:" },
  "enter_id_number": { ar: "أدخل رقم الهوية", en: "Enter ID Number" },
  "account_number": { ar: "رقم الحساب:", en: "Account Number:" },
  "enter_account_number": { ar: "أدخل رقم الحساب", en: "Enter Account Number" },
  "submit": { ar: "إرسال", en: "Submit" },
  "back": { ar: "رجوع", en: "Back" },
  "loading": { ar: "جاري التحميل...", en: "Loading..." },

  // ID Types
  "bahraini_id": { ar: "الرقم الشخصي البحريني", en: "Bahraini Personal Number" },
  "emirati_id": { ar: "الرقم الشخصي الإماراتي", en: "Emirati Personal Number" },
  "saudi_id": { ar: "الرقم الشخصي السعودي", en: "Saudi Personal Number" },
  "omani_id": { ar: "الرقم الشخصي العماني", en: "Omani Personal Number" },
  "qatari_id": { ar: "الرقم الشخصي القطري", en: "Qatari Personal Number" },
  "bahraini_id": { ar: "الرقم الشخصي البحريني", en: "Bahraini Personal Number" },
  "owners_union": { ar: "رقم اتحاد الملاك", en: "Owners Union Number" },
  "gov_entity": { ar: "رقم الجهة الحكومية", en: "Government Entity Number" },
  "passport": { ar: "رقم الجواز", en: "Passport Number" },
  "commercial_reg": { ar: "رقم السجل التجاري", en: "Commercial Registration Number" },
  "establishment": { ar: "رقم المنشأة", en: "Establishment Number" },

  // Bills page
  "ewa_bills": { ar: "فواتير الكهرباء والماء", en: "Electricity & Water Bills" },
  "account_info": { ar: "معلومات الحساب", en: "Account Information" },
  "account_holder": { ar: "صاحب الحساب:", en: "Account Holder:" },
  "account_no": { ar: "رقم الحساب:", en: "Account Number:" },
  "outstanding_bills": { ar: "الفواتير المستحقة", en: "Outstanding Bills" },
  "bill_number": { ar: "رقم الفاتورة", en: "Bill Number" },
  "bill_date": { ar: "تاريخ الفاتورة", en: "Bill Date" },
  "bill_amount": { ar: "المبلغ", en: "Amount" },
  "bill_status": { ar: "الحالة", en: "Status" },
  "unpaid": { ar: "غير مدفوعة", en: "Unpaid" },
  "pay_full_amount": { ar: "دفع كامل المبلغ", en: "Pay Full Amount" },
  "pay_partial_amount": { ar: "دفع جزء من المبلغ", en: "Pay Partial Amount" },
  "total_after_discount": { ar: "المجموع النهائي بعد الخصم (25%)", en: "Final Total After Discount (25%)" },
  "final_total": { ar: "المجموع النهائي", en: "Final Total" },
  "bd": { ar: "د.ب", en: "BD" },
  "proceed_to_pay": { ar: "المتابعة للدفع", en: "Proceed to Pay" },
  "discount_note": { ar: "خصم 25% عند دفع كامل المبلغ", en: "25% discount when paying full amount" },
  "partial_min": { ar: "الحد الأدنى ثلث المبلغ", en: "Minimum is one-third of total" },
  "enter_amount": { ar: "أدخل المبلغ", en: "Enter Amount" },

  // Summary page
  "payment_summary": { ar: "ملخص الدفع", en: "Payment Summary" },
  "payment_method": { ar: "طريقة الدفع", en: "Payment Method" },
  "credit_card": { ar: "بطاقة ائتمان", en: "Credit Card" },
  "confirm_payment": { ar: "تأكيد الدفع", en: "Confirm Payment" },
  "card_number": { ar: "رقم البطاقة", en: "Card Number" },
  "expiry_date": { ar: "تاريخ الانتهاء", en: "Expiry Date" },
  "cvv": { ar: "CVV", en: "CVV" },
  "cardholder_name": { ar: "اسم حامل البطاقة", en: "Cardholder Name" },
  "total_amount": { ar: "المبلغ الإجمالي", en: "Total Amount" },
  "apple_pay_disabled": { ar: "غير متاح حالياً", en: "Currently unavailable" },

  // Footer
  "about_bahrain": { ar: "عن البحرين", en: "About Bahrain" },
  "discover_bahrain": { ar: "اكتشف البحرين", en: "Discover Bahrain" },
  "about_bahrain_link": { ar: "عن البحرين", en: "About Bahrain" },
  "gov_services_guide": { ar: "دليل الخدمات الحكومية", en: "Government Services Guide" },
  "gov_guide": { ar: "الدليل الحكومي", en: "Government Directory" },
  "ai_bahrain": { ar: "الذكاء الاصطناعي في البحرين", en: "AI in Bahrain" },
  "customer_service_guide": { ar: "دليل خدمة العملاء", en: "Customer Service Guide" },
  "follow_us": { ar: "تابعنا على", en: "Follow Us" },
  "contact_us": { ar: "اتصل بنا", en: "Contact Us" },
  "national_call_center": { ar: "المركز الوطني للاتصال", en: "National Contact Center" },
  "available_24_7": { ar: "متاح على مدار الساعة", en: "Available 24/7" },
  "terms_of_use": { ar: "شروط الإستخدام", en: "Terms of Use" },
  "privacy_policy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "accessibility": { ar: "إمكانية الوصول", en: "Accessibility" },
  "faq": { ar: "الأسئلة الشائعة", en: "FAQ" },
  "help": { ar: "مساعدة", en: "Help" },
  "contact_link": { ar: "تواصل معنا", en: "Contact Us" },
  "sitemap": { ar: "خريطة الموقع", en: "Sitemap" },
  "last_update": { ar: "آخر تحديث على البوابة الوطنية :", en: "Last update on the National Portal:" },
  "developed_by": { ar: "تم التطوير من قبل", en: "Developed by" },
  "iga": { ar: "هيئة المعلومات والحكومة الإلكترونية", en: "Information & eGovernment Authority" },
  "copyright": { ar: "حقوق الطبع ©", en: "Copyright ©" },
  "kingdom_of_bahrain": { ar: "مملكة البحرين", en: "Kingdom of Bahrain" },
  "all_rights_reserved": { ar: "جميع الحقوق محفوظة", en: "All Rights Reserved" },

  // Weather
  "weather": { ar: "الطقس", en: "Weather" },
  "clear": { ar: "صافي", en: "Clear" },
  "partly_cloudy": { ar: "غائم جزئياً", en: "Partly Cloudy" },
  "cloudy": { ar: "غائم", en: "Cloudy" },
  "rainy": { ar: "ممطر", en: "Rainy" },
  "stormy": { ar: "عاصف", en: "Stormy" },
  "min_temp": { ar: "الصغرى", en: "Min" },
  "max_temp": { ar: "العظمى", en: "Max" },
  "humidity": { ar: "الرطوبة", en: "Humidity" },
  "sunrise": { ar: "شروق الشمس", en: "Sunrise" },
  "sunset": { ar: "غروب الشمس", en: "Sunset" },
  "more_info": { ar: "لمزيد من المعلومات :", en: "For more information:" },

  // Chat
  "chat_support": { ar: "خدمة العملاء", en: "Customer Support" },
  "ewa_authority": { ar: "هيئة الكهرباء والماء", en: "Electricity & Water Authority" },
  "welcome_ewa": { ar: "مرحباً بك في هيئة الكهرباء والماء", en: "Welcome to the Electricity & Water Authority" },
  "how_help": { ar: "كيف يمكننا مساعدتك؟", en: "How can we help you?" },
  "type_message": { ar: "اكتب رسالتك...", en: "Type your message..." },
  "new_support_msg": { ar: "رسالة من الدعم", en: "Message from support" },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("ewa_lang");
    return (saved === "en" ? "en" : "ar") as Lang;
  });

  useEffect(() => {
    localStorage.setItem("ewa_lang", lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === "ar" ? "rtl" : "ltr";

  const value = useMemo(() => ({ lang, toggleLang, t, dir }), [lang, toggleLang, t, dir]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
