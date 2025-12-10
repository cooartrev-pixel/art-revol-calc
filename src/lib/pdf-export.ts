import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MortgageResult, AmortizationRow, formatCurrency, formatPercent } from "./mortgage-calculations";
import { banks, BankInfo } from "./banks-data";

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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Rozrahunok Ipotechnogo Kredytu", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Revolution - Agentstvo Neruhomosti", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString("uk-UA")}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Vhidni Parametry", 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const inputData = [
    ["Vartist ob'ekta", formatCurrency(data.propertyValue)],
    ["Pershyy vnesok", formatCurrency(data.downPayment)],
    ["Suma kredytu", formatCurrency(data.loanAmount)],
    ["Termin kredytu", `${data.loanTermYears} rokiv`],
    ["Richna stavka", formatPercent(data.interestRate)],
    ["Typ platezhu", data.paymentType === "annuity" ? "Anuitentnyy" : "Klasychnyy"],
    ["Derzhavna programa", data.isGovernmentProgram ? `YeOselya (${data.governmentRate}%)` : "Ni"],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: inputData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 80 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Results Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Rezultaty Rozrahunku", 14, yPosition);
  yPosition += 8;

  const resultsData = [
    ["Shchomisyachnyy platizh", formatCurrency(data.result.monthlyPayment)],
    ["Zagalna suma vyplat", formatCurrency(data.result.totalPayment)],
    ["Zagalni vidsotky (pereplata)", formatCurrency(data.result.totalInterest)],
    ["Efektyvna richna stavka", formatPercent(data.result.effectiveRate)],
    ["Odnorazova komisiya", formatCurrency(data.result.oneTimeCommissionAmount)],
    ["Zagalna shchomisyachna komisiya", formatCurrency(data.result.totalMonthlyCommissions)],
  ];

  if (data.isGovernmentProgram && data.result.savingsVsCommercial > 0) {
    resultsData.push(["Ekonomiya za YeOselya", formatCurrency(data.result.savingsVsCommercial)]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: resultsData,
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { cellWidth: 60 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Bank Comparison Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Porivnyannya Bankiv-Uchasnykiv YeOselya", 14, yPosition);
  yPosition += 8;

  const bankHeaders = ["Bank", "Stavka 3%", "Stavka 7%", "Min. vnesok", "Shchomis. platizh"];
  
  const bankData = banks.map((bank) => {
    const rate = data.isGovernmentProgram ? data.governmentRate : 7;
    const monthlyPayment = calculateBankMonthlyPayment(data.loanAmount, data.loanTermYears, rate);
    
    return [
      bank.name,
      bank.rates.privileged === 3 ? "Tak" : "Ni",
      bank.rates.standard === 7 ? "Tak" : "Ni",
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

  // Check if we need a new page for amortization
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Amortization Table (first 24 months or less)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Grafik Platezhiv (pershi 24 misyatsi)", 14, yPosition);
  yPosition += 8;

  const scheduleHeaders = ["#", "Tilo", "Vidsotky", "Platizh", "Zalyshok"];
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
      "Kalkulyator nadaye oriyentovni rozrahunky. Tochni umovy kredytuvannya utochnyuyte u banku.",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      `Storinka ${i} z ${totalPages}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  // Save the PDF
  const fileName = `ipoteka-rozrahunok-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
