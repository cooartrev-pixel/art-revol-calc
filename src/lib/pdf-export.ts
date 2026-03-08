import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { MortgageResult, AmortizationRow, formatCurrency, formatPercent } from "./mortgage-calculations";
import { banks } from "./banks-data";
import { getTranslations, Language } from "./i18n";
import { loadRobotoFont } from "./pdf-font";
import logoSvg from "@/assets/logo-revolution.svg";

export interface PDFExportOptions {
  theme: 'light' | 'dark';
  includeCharts: boolean;
  chartElements?: HTMLElement[];
}

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
  options?: PDFExportOptions;
}

// Theme colors
const THEMES = {
  light: {
    bg: [255, 255, 255] as [number, number, number],
    cardBg: [248, 248, 248] as [number, number, number],
    text: [30, 30, 30] as [number, number, number],
    textMuted: [120, 120, 120] as [number, number, number],
    primary: [232, 121, 22] as [number, number, number],
    primaryLight: [255, 243, 230] as [number, number, number],
    accent: [139, 90, 43] as [number, number, number],
    success: [34, 139, 34] as [number, number, number],
    successBg: [230, 255, 230] as [number, number, number],
    border: [220, 220, 220] as [number, number, number],
    tableBg: [245, 245, 245] as [number, number, number],
    tableAlt: [255, 255, 255] as [number, number, number],
    headerBg: [139, 90, 43] as [number, number, number],
    headerText: [255, 255, 255] as [number, number, number],
  },
  dark: {
    bg: [25, 25, 25] as [number, number, number],
    cardBg: [35, 35, 35] as [number, number, number],
    text: [240, 240, 240] as [number, number, number],
    textMuted: [160, 160, 160] as [number, number, number],
    primary: [232, 150, 60] as [number, number, number],
    primaryLight: [50, 35, 20] as [number, number, number],
    accent: [200, 150, 80] as [number, number, number],
    success: [80, 200, 80] as [number, number, number],
    successBg: [25, 50, 25] as [number, number, number],
    border: [60, 60, 60] as [number, number, number],
    tableBg: [30, 30, 30] as [number, number, number],
    tableAlt: [40, 40, 40] as [number, number, number],
    headerBg: [60, 40, 20] as [number, number, number],
    headerText: [255, 220, 170] as [number, number, number],
  },
};

const PDF_FONT_FILE = 'Roboto-Regular.ttf';
const PDF_FONT_NAME = 'Roboto';

async function registerUnicodeFont(doc: jsPDF): Promise<void> {
  const fontBase64 = await loadRobotoFont();

  const docWithVFS = doc as jsPDF & {
    getFileFromVFS?: (fileName: string) => string | undefined;
  };

  if (!docWithVFS.getFileFromVFS?.(PDF_FONT_FILE)) {
    doc.addFileToVFS(PDF_FONT_FILE, fontBase64);
  }

  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'normal', 'Identity-H');
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'bold', 'Identity-H');
  doc.setFont(PDF_FONT_NAME, 'normal');
}

function calculateBankMonthlyPayment(loanAmount: number, loanTermYears: number, rate: number): number {
  const monthlyRate = rate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  if (monthlyRate === 0) return loanAmount / totalMonths;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

async function loadLogoAsDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(logoSvg);
    const svgText = await response.text();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 200, 200);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

async function captureCharts(elements: HTMLElement[], themeMode: 'light' | 'dark'): Promise<string[]> {
  const images: string[] = [];
  const chartBackground = themeMode === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)';

  for (const el of elements) {
    try {
      const canvas = await html2canvas(el, {
        scale: Math.max(2, window.devicePixelRatio || 1),
        useCORS: true,
        logging: false,
        backgroundColor: chartBackground,
      });
      images.push(canvas.toDataURL('image/png'));
    } catch {
      // skip failed chart
    }
  }
  return images;
}

export async function exportToPDF(data: PDFExportData): Promise<void> {
  const lang = data.language || 'uk';
  const t = getTranslations(lang);
  const opts = data.options || { theme: 'light', includeCharts: false };
  const theme = THEMES[opts.theme];
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  
  // Load and register Roboto font for Cyrillic (Unicode-safe)
  try {
    await registerUnicodeFont(doc);
  } catch (e) {
    console.warn('Failed to load Roboto font, using default', e);
  }
  
  // Load logo
  const logoDataUrl = await loadLogoAsDataUrl();
  
  // Capture charts if requested
  let chartImages: string[] = [];
  if (opts.includeCharts && opts.chartElements?.length) {
    chartImages = await captureCharts(opts.chartElements, opts.theme);
  }
  
  let y = margin;
  
  // Helper: check page break
  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      // Background for new page
      doc.setFillColor(...theme.bg);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      y = margin;
    }
  };
  
  // Background
  doc.setFillColor(...theme.bg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // ===== HEADER =====
  // Header background band
  doc.setFillColor(...theme.primaryLight);
  doc.rect(0, 0, pageWidth, 38, 'F');
  
  // Accent line
  doc.setFillColor(...theme.primary);
  doc.rect(0, 38, pageWidth, 1.5, 'F');
  
  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, 5, 28, 28);
    } catch { /* skip logo */ }
  }
  
  // Title
  doc.setFont(PDF_FONT_NAME, 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...theme.primary);
  const titleX = logoDataUrl ? margin + 33 : margin;
  doc.text(t['pdf.title'], titleX, 16);
  
  // Agency name
  doc.setFontSize(9);
  doc.setTextColor(...theme.textMuted);
  doc.text(t['pdf.agency'], titleX, 22);
  
  // Date
  const dateLocale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  doc.setFontSize(8);
  doc.text(`${t['pdf.date']}: ${new Date().toLocaleDateString(dateLocale)}`, titleX, 28);
  
  // Phone/contact on right
  doc.setFontSize(8);
  doc.setTextColor(...theme.textMuted);
  doc.text('art-revol-calc.lovable.app', pageWidth - margin, 16, { align: 'right' });
  
  y = 45;
  
  // ===== INPUT PARAMETERS =====
  doc.setFontSize(11);
  doc.setTextColor(...theme.primary);
  doc.text(t['pdf.inputParams'], margin, y);
  y += 5;
  
  const inputData = [
    [t['pdf.propertyValue'], formatCurrency(data.propertyValue)],
    [t['pdf.downPayment'], formatCurrency(data.downPayment)],
    [t['pdf.loanAmount'], formatCurrency(data.loanAmount)],
    [t['pdf.loanTerm'], `${data.loanTermYears} ${t['pdf.yearsSuffix']}`],
    [t['pdf.annualRate'], formatPercent(data.interestRate)],
    [t['pdf.paymentType'], data.paymentType === "annuity" ? t['pdf.annuity'] : t['pdf.classic']],
    [t['pdf.governmentProgram'], data.isGovernmentProgram ? `ЄОселя (${data.governmentRate}%)` : t['pdf.no']],
  ];

  autoTable(doc, {
    startY: y,
    body: inputData,
    theme: "plain",
    styles: { 
      fontSize: 8, 
      cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
      textColor: theme.text,
      font: 'Roboto',
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55, textColor: theme.textMuted },
      1: { cellWidth: 50, textColor: theme.text },
    },
    didDrawCell: (hookData) => {
      if (hookData.row.index % 2 === 0) {
        doc.setFillColor(...theme.tableBg);
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  
  // ===== RESULTS - Key metrics in a highlighted box =====
  checkPage(55);
  
  // Results header
  doc.setFontSize(11);
  doc.setTextColor(...theme.primary);
  doc.text(t['pdf.results'], margin, y);
  y += 4;
  
  // Main monthly payment card
  const cardHeight = 22;
  doc.setFillColor(...theme.primary);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(t['pdf.monthlyPayment'], margin + 5, y + 7);
  
  doc.setFontSize(18);
  doc.text(formatCurrency(data.result.monthlyPayment), margin + 5, y + 17);
  
  if (data.isGovernmentProgram && data.result.savingsVsCommercial > 0) {
    doc.setFontSize(8);
    doc.setTextColor(200, 255, 200);
    const savingsText = `${lang === 'uk' ? 'Економія' : 'Savings'}: ${formatCurrency(data.result.savingsVsCommercial)}`;
    doc.text(savingsText, pageWidth - margin - 5, y + 17, { align: 'right' });
  }
  
  y += cardHeight + 4;
  
  // Results details table
  const resultsData = [
    [t['pdf.totalPayment'], formatCurrency(data.result.totalPayment)],
    [t['pdf.totalInterest'], formatCurrency(data.result.totalInterest)],
    [t['pdf.effectiveRate'], formatPercent(data.result.effectiveRate)],
    [t['pdf.oneTimeCommission'], formatCurrency(data.result.oneTimeCommissionAmount)],
    [t['pdf.totalMonthlyCommissions'], formatCurrency(data.result.totalMonthlyCommissions)],
  ];

  autoTable(doc, {
    startY: y,
    body: resultsData,
    theme: "plain",
    styles: { 
      fontSize: 8, 
      cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
      textColor: theme.text,
      font: 'Roboto',
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70, textColor: theme.textMuted },
      1: { cellWidth: 45, textColor: theme.text },
    },
    alternateRowStyles: { fillColor: theme.tableBg },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  
  // ===== ADDITIONAL COSTS =====
  const costs = data.result.additionalCosts;
  if (costs && costs.totalAdditional > 0) {
    checkPage(45);
    
    doc.setFontSize(11);
    doc.setTextColor(...theme.primary);
    doc.text(t['pdf.additionalCosts'], margin, y);
    y += 5;

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
      startY: y,
      body: costItems,
      theme: "plain",
      styles: { 
        fontSize: 8, 
        cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
        textColor: theme.text,
        font: 'Roboto',
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70, textColor: theme.textMuted },
        1: { cellWidth: 45, textColor: theme.text },
      },
      alternateRowStyles: { fillColor: theme.tableBg },
      didParseCell: (hookData) => {
        if (hookData.row.index >= costItems.length - 2) {
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.textColor = theme.primary;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }
  
  // ===== BANK COMPARISON =====
  checkPage(60);
  
  doc.setFontSize(11);
  doc.setTextColor(...theme.primary);
  doc.text(t['pdf.bankComparison'], margin, y);
  y += 5;

  const bankHeaders = [t['banks.name'], t['banks.rate3'], t['banks.rate7'], t['banks.minDownPayment'], t['banks.monthlyPayment']];
  const bankData = banks.map((bank) => {
    const rate = data.isGovernmentProgram ? data.governmentRate : 7;
    const mp = calculateBankMonthlyPayment(data.loanAmount, data.loanTermYears, rate);
    return [
      bank.name,
      bank.rates.privileged === 3 ? t['banks.yes'] : t['banks.no'],
      bank.rates.standard === 7 ? t['banks.yes'] : t['banks.no'],
      `${bank.minDownPayment}%`,
      formatCurrency(mp),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [bankHeaders],
    body: bankData,
    theme: "striped",
    styles: { 
      fontSize: 7, 
      cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      textColor: theme.text,
      font: 'Roboto',
    },
    headStyles: { 
      fillColor: theme.headerBg, 
      textColor: theme.headerText,
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: theme.tableBg },
    bodyStyles: { fillColor: theme.tableAlt },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  
  // ===== CHARTS =====
  if (chartImages.length > 0) {
    for (const imgData of chartImages) {
      checkPage(85);
      
      // Chart container with border
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 80, 2, 2, 'S');
      
      try {
        doc.addImage(imgData, 'PNG', margin + 2, y + 2, contentWidth - 4, 76);
      } catch { /* skip */ }
      y += 84;
    }
  }
  
  // ===== AMORTIZATION SCHEDULE =====
  checkPage(40);
  
  doc.setFontSize(11);
  doc.setTextColor(...theme.primary);
  doc.text(t['pdf.scheduleTitle'], margin, y);
  y += 5;

  const scheduleHeaders = [t['schedule.month'], t['schedule.principal'], t['schedule.interest'], t['schedule.payment'], t['schedule.balance']];
  const scheduleData = data.schedule.slice(0, 24).map((row) => [
    row.month.toString(),
    formatCurrency(row.principalPayment),
    formatCurrency(row.interestPayment),
    formatCurrency(row.totalPayment),
    formatCurrency(row.closingBalance),
  ]);

  autoTable(doc, {
    startY: y,
    head: [scheduleHeaders],
    body: scheduleData,
    theme: "striped",
    styles: { 
      fontSize: 6.5, 
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
      textColor: theme.text,
      font: 'Roboto',
    },
    headStyles: { 
      fillColor: theme.headerBg, 
      textColor: theme.headerText,
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: theme.tableBg },
    bodyStyles: { fillColor: theme.tableAlt },
  });

  // ===== FOOTER on all pages =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Background for each page (except first which is already done)
    if (i > 1) {
      // ensure bg is set
    }
    
    // Footer line
    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    
    // Footer text
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...theme.textMuted);
    doc.text(t['pdf.footer'], pageWidth / 2, pageHeight - 9, { align: "center" });
    
    doc.setFontSize(7);
    doc.text(`${t['pdf.page']} ${i} ${t['pdf.of']} ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    
    // Small logo icon in footer
    doc.setTextColor(...theme.primary);
    doc.text('Revolution', margin, pageHeight - 9);
  }

  // Save
  const fileName = lang === 'uk'
    ? `ipoteka-rozrahunok-${new Date().toISOString().split("T")[0]}.pdf`
    : `mortgage-calculation-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
