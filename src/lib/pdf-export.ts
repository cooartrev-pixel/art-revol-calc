import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MortgageResult, AmortizationRow, AdditionalCosts, formatCurrency, formatPercent } from "./mortgage-calculations";
import { banks } from "./banks-data";
import { getTranslations, Language } from "./i18n";

interface PDFExportData {
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  loanTermYears: number;
  interestRate: number;
  paymentType: "annuity" | "classic";
  isGovernmentProgram: boolean;
  governmentRate: number;
  result: MortgageResult;
  schedule: AmortizationRow[];
  language?: Language;
}

// Helper to calculate monthly payment for a bank
function calculateBankMonthlyPayment(
  loanAmount: number,
  loanTermYears: number,
  rate: number
): number {
  const monthlyRate = rate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  if (monthlyRate === 0) return loanAmount / totalMonths;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
         (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

export function exportToPDF(data: PDFExportData): void {
  const lang = data.language || 'uk';
  const t = getTranslations(lang);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(t['pdf.title'], pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(t['pdf.agency'], pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  doc.setFontSize(10);
  const dateLocale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  doc.text(`${t['pdf.date']}: ${new Date().toLocaleDateString(dateLocale)}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t['pdf.inputParams'], 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const inputData = [
    [t['pdf.propertyValue'], formatCurrency(data.propertyValue)],
    [t['pdf.downPayment'], formatCurrency(data.downPayment)],
    [t['pdf.loanAmount'], formatCurrency(data.loanAmount)],
    [t['pdf.loanTerm'], `${data.loanTermYears} ${t['pdf.yearsSuffix']}`],
    [t['pdf.annualRate'], formatPercent(data.interestRate)],
    [t['pdf.paymentType'], data.paymentType === "annuity" ? t['pdf.annuity'] : t['pdf.classic']],
    [t['pdf.governmentProgram'], data.isGovernmentProgram ? `YeOselya (${data.governmentRate}%)` : t['pdf.no']],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: inputData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { cellWidth: 70 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Results Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t['pdf.results'], 14, yPosition);
  yPosition += 8;

  const resultsData = [
    [t['pdf.monthlyPayment'], formatCurrency(data.result.monthlyPayment)],
    [t['pdf.totalPayment'], formatCurrency(data.result.totalPayment)],
    [t['pdf.totalInterest'], formatCurrency(data.result.totalInterest)],
    [t['pdf.effectiveRate'], formatPercent(data.result.effectiveRate)],
    [t['pdf.oneTimeCommission'], formatCurrency(data.result.oneTimeCommissionAmount)],
    [t['pdf.totalMonthlyCommissions'], formatCurrency(data.result.totalMonthlyCommissions)],
  ];

  if (data.isGovernmentProgram && data.result.savingsVsCommercial > 0) {
    resultsData.push([t['pdf.savingsYeoselya'], formatCurrency(data.result.savingsVsCommercial)]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: resultsData,
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90 },
      1: { cellWidth: 50 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Bank Comparison Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t['pdf.bankComparison'], 14, yPosition);
  yPosition += 8;

  const bankHeaders = [
    t['banks.name'], 
    t['banks.rate3'], 
    t['banks.rate7'], 
    t['banks.minDownPayment'], 
    t['banks.monthlyPayment']
  ];
  
  const bankData = banks.map((bank) => {
    const rate = data.isGovernmentProgram ? data.governmentRate : 7;
    const monthlyPayment = calculateBankMonthlyPayment(data.loanAmount, data.loanTermYears, rate);
    
    return [
      bank.name,
      bank.rates.privileged === 3 ? t['banks.yes'] : t['banks.no'],
      bank.rates.standard === 7 ? t['banks.yes'] : t['banks.no'],
      `${bank.minDownPayment}%`,
      formatCurrency(monthlyPayment),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [bankHeaders],
    body: bankData,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [139, 90, 43], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Additional Costs Section
  const costs = data.result.additionalCosts;
  if (costs && costs.totalAdditional > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(t['pdf.additionalCosts'], 14, yPosition);
    yPosition += 8;

    const costItems: string[][] = [];
    if (costs.pensionFund > 0) costItems.push([t['costs.pensionFund'], formatCurrency(costs.pensionFund)]);
    if (costs.duty > 0) costItems.push([t['costs.duty'], formatCurrency(costs.duty)]);
    if (costs.incomeTax > 0) costItems.push([t['costs.incomeTax'], formatCurrency(costs.incomeTax)]);
    if (costs.militaryTax > 0) costItems.push([t['costs.militaryTax'], formatCurrency(costs.militaryTax)]);
    if (costs.notary > 0) costItems.push([t['costs.notary'], formatCurrency(costs.notary)]);
    if (costs.appraisal > 0) costItems.push([t['costs.appraisal'], formatCurrency(costs.appraisal)]);
    if (costs.insuranceTotal > 0) costItems.push([t['costs.insuranceTotal'], formatCurrency(costs.insuranceTotal)]);
    if (costs.agencyCommission > 0) costItems.push([t['costs.agencyCommission'], formatCurrency(costs.agencyCommission)]);
    costItems.push([t['costs.totalAdditional'], formatCurrency(costs.totalAdditional)]);
    costItems.push([t['pdf.grandTotal'], formatCurrency(data.result.grandTotal)]);

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: costItems,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { cellWidth: 50 },
      },
      didParseCell: (hookData) => {
        // Bold last two rows (total + grand total)
        if (hookData.row.index >= costItems.length - 2) {
          hookData.cell.styles.fontStyle = 'bold';
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page for amortization
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Amortization Table (first 24 months or less)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t['pdf.scheduleTitle'], 14, yPosition);
  yPosition += 8;

  const scheduleHeaders = [
    t['schedule.month'], 
    t['schedule.principal'], 
    t['schedule.interest'], 
    t['schedule.payment'], 
    t['schedule.balance']
  ];
  const scheduleData = data.schedule.slice(0, 24).map((row) => [
    row.month.toString(),
    formatCurrency(row.principalPayment),
    formatCurrency(row.interestPayment),
    formatCurrency(row.totalPayment),
    formatCurrency(row.closingBalance),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [scheduleHeaders],
    body: scheduleData,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [139, 90, 43], textColor: 255 },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      t['pdf.footer'],
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      `${t['pdf.page']} ${i} ${t['pdf.of']} ${totalPages}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  // Save the PDF
  const fileName = lang === 'uk' 
    ? `ipoteka-rozrahunok-${new Date().toISOString().split("T")[0]}.pdf`
    : `mortgage-calculation-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
