// Test: Simulate multi-bill rawText and verify totals calculation
// This replicates the exact parsing logic from server/index.js

// ============================================================
// MOCK DATA: Simulate what the EWA website returns for 3 bills
// ============================================================

const mockRawText_3Bills = `
استعلام عن فاتورة الكهرباء والماء
تفاصيل الفاتورة
رقم الحساب تفاصيل العميل العنوان تاريخ الاصدار القائمة لشهر الرصيد (د.ب)
1234567890
محمد أحمد علي
المنامة - بلوك 123
15/01/2026
01/2026
25.500
9876543210
فاطمة حسن محمود
المحرق - بلوك 456
15/01/2026
01/2026
42.750
5555666677
خالد عبدالله سالم
الرفاع - بلوك 789
15/01/2026
01/2026
18.300
مجموع المبالغ (د.ب): 86.550
مجموع المبلغ المدفوع (د.ب): 30.000
`;

const mockRawText_1Bill = `
استعلام عن فاتورة الكهرباء والماء
تفاصيل الفاتورة
رقم الحساب تفاصيل العميل العنوان تاريخ الاصدار القائمة لشهر الرصيد (د.ب)
1234567890
محمد أحمد علي
المنامة - بلوك 123
15/01/2026
01/2026
25.500
مجموع المبالغ (د.ب): 25.500
مجموع المبلغ المدفوع (د.ب): 10.000
`;

const mockRawText_2Bills = `
استعلام عن فاتورة الكهرباء والماء
تفاصيل الفاتورة
رقم الحساب تفاصيل العميل العنوان تاريخ الاصدار القائمة لشهر الرصيد (د.ب)
1111222233
سارة محمد
سلماباد - بلوك 100
20/02/2026
02/2026
100.250
4444555566
أحمد يوسف
عالي - بلوك 200
20/02/2026
02/2026
55.750
مجموع المبالغ (د.ب): 156.000
مجموع المبلغ المدفوع (د.ب): 0.000
`;

// ============================================================
// PARSING LOGIC: Exact copy from server/index.js lines 1815-1886
// ============================================================

function parseBills(rawText) {
  const result = {};
  
  if (rawText && rawText.includes('تفاصيل الفاتورة')) {
    try {
      const raw = rawText;
      const afterDetails = raw.substring(raw.indexOf('تفاصيل الفاتورة'));
      
      // Find all 10-digit account numbers (each one starts a new bill)
      const allAccounts = [];
      const accRegex = /(\d{10})/g;
      let m;
      while ((m = accRegex.exec(afterDetails)) !== null) {
        allAccounts.push({ index: m.index, accountNumber: m[1] });
      }
      
      const parsedBills = [];
      for (let i = 0; i < allAccounts.length; i++) {
        const start = allAccounts[i].index;
        const end = i + 1 < allAccounts.length ? allAccounts[i + 1].index : afterDetails.length;
        const section = afterDetails.substring(start, end);
        
        const bill = {};
        bill.accountNumber = allAccounts[i].accountNumber;
        
        // Customer name - line after account number
        const nameMatch = section.match(/\d{10}\n([^\n]+)/);
        if (nameMatch) bill.customerName = nameMatch[1].trim();
        
        // Address - line after customer name
        const addrMatch = section.match(/\d{10}\n[^\n]+\n([^\n]+)/);
        if (addrMatch) bill.address = addrMatch[1].trim();
        
        // Date (dd/mm/yyyy)
        const dateMatch = section.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) bill.issueDate = dateMatch[1];
        
        // Month (mm/yyyy)
        const monthMatch = section.match(/(\d{2}\/\d{4})/);
        if (monthMatch) bill.billMonth = monthMatch[1];
        
        // Balance - number with 3 decimal places
        const balMatch = section.match(/(\d+\.\d{3})/);
        if (balMatch) bill.balance = balMatch[1];
        
        parsedBills.push(bill);
      }
      
      // Extract totals from the full text
      const totalM = raw.match(/مجموع المبالغ \(د\.ب\): ([\d.]+)/);
      const paidM = raw.match(/مجموع المبلغ المدفوع \(د\.ب\): ([\d.]+)/);
      if (totalM) result.totalAmount = totalM[1];
      
      result.parsedBills = parsedBills;
      
      // Calculate totals as SUM of all bills' balances
      let calculatedTotal = 0;
      parsedBills.forEach(bill => {
        if (bill.balance) calculatedTotal += parseFloat(bill.balance) || 0;
      });
      
      // Use calculated sum for totalAmount (sum of all bills)
      const totalAmountStr = calculatedTotal.toFixed(3);
      const paidAmountStr = paidM ? paidM[1] : '0.000';
      
      result.totalAmount = totalAmountStr;
      result.totalSummary = {
        totalAmount: totalAmountStr,
        paidAmount: paidAmountStr
      };
      // Keep parsedData for backward compatibility (first bill)
      if (parsedBills.length > 0) {
        result.parsedData = { ...parsedBills[0], totalAmount: totalAmountStr, paidAmount: paidAmountStr };
      }
    } catch(e) { console.log('Parse error:', e.message); }
  }
  
  return result;
}

// ============================================================
// RUN TESTS
// ============================================================

console.log('='.repeat(60));
console.log('TEST 1: Three bills (25.500 + 42.750 + 18.300 = 86.550)');
console.log('='.repeat(60));

const result1 = parseBills(mockRawText_3Bills);
console.log(`Bills found: ${result1.parsedBills?.length}`);
result1.parsedBills?.forEach((bill, i) => {
  console.log(`  Bill ${i+1}: Account=${bill.accountNumber}, Name=${bill.customerName}, Balance=${bill.balance}`);
});
console.log(`totalAmount (top): ${result1.totalAmount}`);
console.log(`totalSummary.totalAmount (bottom): ${result1.totalSummary?.totalAmount}`);
console.log(`totalSummary.paidAmount (bottom): ${result1.totalSummary?.paidAmount}`);

const expected1Total = '86.550';
const pass1 = result1.totalAmount === expected1Total && result1.totalSummary?.totalAmount === expected1Total;
console.log(`\n>>> EXPECTED totalAmount: ${expected1Total}`);
console.log(`>>> GOT totalAmount: ${result1.totalAmount}`);
console.log(`>>> TEST 1: ${pass1 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n' + '='.repeat(60));
console.log('TEST 2: Single bill (25.500)');
console.log('='.repeat(60));

const result2 = parseBills(mockRawText_1Bill);
console.log(`Bills found: ${result2.parsedBills?.length}`);
result2.parsedBills?.forEach((bill, i) => {
  console.log(`  Bill ${i+1}: Account=${bill.accountNumber}, Name=${bill.customerName}, Balance=${bill.balance}`);
});
console.log(`totalAmount (top): ${result2.totalAmount}`);
console.log(`totalSummary.totalAmount (bottom): ${result2.totalSummary?.totalAmount}`);
console.log(`totalSummary.paidAmount (bottom): ${result2.totalSummary?.paidAmount}`);

const expected2Total = '25.500';
const pass2 = result2.totalAmount === expected2Total && result2.totalSummary?.totalAmount === expected2Total;
console.log(`\n>>> EXPECTED totalAmount: ${expected2Total}`);
console.log(`>>> GOT totalAmount: ${result2.totalAmount}`);
console.log(`>>> TEST 2: ${pass2 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n' + '='.repeat(60));
console.log('TEST 3: Two bills (100.250 + 55.750 = 156.000)');
console.log('='.repeat(60));

const result3 = parseBills(mockRawText_2Bills);
console.log(`Bills found: ${result3.parsedBills?.length}`);
result3.parsedBills?.forEach((bill, i) => {
  console.log(`  Bill ${i+1}: Account=${bill.accountNumber}, Name=${bill.customerName}, Balance=${bill.balance}`);
});
console.log(`totalAmount (top): ${result3.totalAmount}`);
console.log(`totalSummary.totalAmount (bottom): ${result3.totalSummary?.totalAmount}`);
console.log(`totalSummary.paidAmount (bottom): ${result3.totalSummary?.paidAmount}`);

const expected3Total = '156.000';
const pass3 = result3.totalAmount === expected3Total && result3.totalSummary?.totalAmount === expected3Total;
console.log(`\n>>> EXPECTED totalAmount: ${expected3Total}`);
console.log(`>>> GOT totalAmount: ${result3.totalAmount}`);
console.log(`>>> TEST 3: ${pass3 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n' + '='.repeat(60));
console.log(`OVERALL: ${pass1 && pass2 && pass3 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('='.repeat(60));
