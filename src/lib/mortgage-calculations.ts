export interface MortgageInput {
  propertyValue: number;
  downPayment: number;
  downPaymentType: 'amount' | 'percent';
  loanTermYears: number;
  interestRate: number;
  paymentType: 'annuity' | 'classic';
  isGovernmentProgram: boolean;
  governmentRate: 3 | 7;
  oneTimeCommission: number;
  monthlyCommission: number;
  // ЄОселя — нові поля
  familySize?: number;
  propertyType?: 'apartment' | 'house';
  propertyAge?: 'new' | 'secondary';
  isYouth?: boolean;
  // Додаткові витрати
  pensionFundPercent?: number;      // Пенсійний фонд (1%)
  dutyPercent?: number;             // Мито (1%)
  incomeTaxPercent?: number;        // Податок на доходи (5%)
  militaryTaxPercent?: number;      // Військовий збір (5%)
  notaryCost?: number;              // Нотаріус (фіксована сума грн)
  appraisalCost?: number;           // Оцінка (фіксована сума грн)
  insurancePercent?: number;        // Страховка (0.25% від вартості об'єкту, щорічно)
  agencyCommissionPercent?: number; // Комісія агенції нерухомості (%)
}

// Обмеження площі ЄОселя (актуальні з 9 лютого 2025)
export interface AreaLimits {
  baseLimit: number;    // Базовий ліміт (52,5 або 62,5 м²)
  perExtra: number;     // На кожного наступного члена (21 м²)
  maxLimit: number;     // Максимум (115,5 або 125,5 м²)
  allowedOverage: number; // Допустиме перевищення (10% для нового житла, 0% для вторинного)
}

export function getYeoselyaAreaLimits(
  familySize: number,
  propertyType: 'apartment' | 'house',
  propertyAge: 'new' | 'secondary'
): { maxArea: number; baseMaxArea: number; allowedOverpercent: number } {
  const base = propertyType === 'house' ? 62.5 : 52.5;
  const maxCap = propertyType === 'house' ? 125.5 : 115.5;
  const perExtra = 21;

  // Базова площа: для 1 або 2 осіб — base, для кожного наступного +21
  const extraMembers = Math.max(0, familySize - 2);
  const baseMaxArea = Math.min(base + extraMembers * perExtra, maxCap);

  // 10% допуск тільки для нового житла (до 3 років)
  const allowedOverpercent = propertyAge === 'new' ? 10 : 0;
  const maxArea = baseMaxArea * (1 + allowedOverpercent / 100);

  return { maxArea, baseMaxArea, allowedOverpercent };
}

export interface YeoselyaEligibilityResult {
  eligible: boolean;
  warnings: string[];
  maxAllowedArea: number;
  maxAllowedLoan: number;
}

// Перевірка відповідності умовам ЄОселя
export function checkYeoselyaEligibility(input: MortgageInput): YeoselyaEligibilityResult {
  const warnings: string[] = [];
  let maxAllowedLoan = 4000000; // типовий ліміт банків

  if (!input.isGovernmentProgram) {
    return { eligible: true, warnings: [], maxAllowedArea: Infinity, maxAllowedLoan };
  }

  const familySize = input.familySize ?? 1;
  const propertyType = input.propertyType ?? 'apartment';
  const propertyAge = input.propertyAge ?? 'secondary';
  const isYouth = input.isYouth ?? false;

  const { maxArea, baseMaxArea, allowedOverpercent } = getYeoselyaAreaLimits(familySize, propertyType, propertyAge);

  // Перевірка мінімального внеску
  const downPaymentPercent = input.downPaymentType === 'percent'
    ? input.downPayment
    : (input.downPayment / input.propertyValue) * 100;

  const minDownPayment = isYouth ? 10 : 20;
  if (downPaymentPercent < minDownPayment) {
    warnings.push(`Мінімальний перший внесок за ЄОселя — ${minDownPayment}% (${isYouth ? 'для молоді' : 'стандарт'})`);
  }

  // Перевірка терміну
  if (input.loanTermYears > 20) {
    warnings.push('Максимальний термін кредиту за ЄОселя — 20 років');
  }

  // Попередження про прогресивну ставку
  if (input.loanTermYears > 10) {
    const rate2 = input.governmentRate === 3 ? 6 : 10;
    warnings.push(`Увага: після 10 років ставка зросте з ${input.governmentRate}% до ${rate2}%`);
  }

  return { eligible: warnings.length === 0, warnings, maxAllowedArea: maxArea, maxAllowedLoan };
}

export interface AdditionalCosts {
  pensionFund: number;
  duty: number;
  incomeTax: number;
  militaryTax: number;
  notary: number;
  appraisal: number;
  insuranceAnnual: number;
  insuranceTotal: number;
  agencyCommission: number;
  totalAdditional: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  oneTimeCommissionAmount: number;
  totalMonthlyCommissions: number;
  savingsVsCommercial: number;
  additionalCosts: AdditionalCosts;
  grandTotal: number; // totalPayment + downPayment + all additional costs
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  closingBalance: number;
}

const COMMERCIAL_RATE = 18; // Типова комерційна ставка для порівняння

export function calculateDownPaymentAmount(
  propertyValue: number,
  downPayment: number,
  downPaymentType: 'amount' | 'percent'
): number {
  if (downPaymentType === 'percent') {
    return (propertyValue * downPayment) / 100;
  }
  return downPayment;
}

export function calculateDownPaymentPercent(
  propertyValue: number,
  downPayment: number,
  downPaymentType: 'amount' | 'percent'
): number {
  if (downPaymentType === 'amount') {
    return (downPayment / propertyValue) * 100;
  }
  return downPayment;
}

// Розрахунок ануїтетного платежу для відрізку з фіксованою ставкою
function calcAnnuityPayment(balance: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return balance / months;
  return balance * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPaymentAmount = calculateDownPaymentAmount(
    input.propertyValue,
    input.downPayment,
    input.downPaymentType
  );
  
  const loanAmount = input.propertyValue - downPaymentAmount;
  const totalMonths = input.loanTermYears * 12;

  // Прогресивна ставка ЄОселя: перші 10 років — 3% або 7%, далі — 6% або 10%
  const isGov = input.isGovernmentProgram;
  const rate1 = isGov ? input.governmentRate : input.interestRate;
  const rate2 = isGov
    ? (input.governmentRate === 3 ? 6 : 10)
    : input.interestRate;
  const phase1Months = isGov ? Math.min(totalMonths, 10 * 12) : totalMonths;
  const phase2Months = isGov ? Math.max(0, totalMonths - 10 * 12) : 0;

  let monthlyPayment: number;
  let totalPayment: number;

  if (input.paymentType === 'annuity') {
    if (!isGov || phase2Months === 0) {
      // Одна ставка на весь строк
      monthlyPayment = calcAnnuityPayment(loanAmount, rate1 / 100 / 12, totalMonths);
      totalPayment = monthlyPayment * totalMonths;
    } else {
      // Фаза 1: перші 10 років
      const mp1 = calcAnnuityPayment(loanAmount, rate1 / 100 / 12, totalMonths);
      let balance = loanAmount;
      let totalPaid = 0;
      const mr1 = rate1 / 100 / 12;
      for (let m = 0; m < phase1Months; m++) {
        const interest = balance * mr1;
        const principal = mp1 - interest;
        balance = Math.max(0, balance - principal);
        totalPaid += mp1;
      }
      // Фаза 2: після 10 років — нова ставка на залишок
      const mp2 = calcAnnuityPayment(balance, rate2 / 100 / 12, phase2Months);
      totalPaid += mp2 * phase2Months;
      monthlyPayment = mp1; // показуємо платіж першої фази
      totalPayment = totalPaid;
    }
  } else {
    // Класичний платіж
    const principalPayment = loanAmount / totalMonths;
    let totalInterestClassic = 0;
    let remainingBalance = loanAmount;
    
    for (let i = 0; i < totalMonths; i++) {
      const rate = isGov && i >= phase1Months ? rate2 : rate1;
      const monthlyRate = rate / 100 / 12;
      totalInterestClassic += remainingBalance * monthlyRate;
      remainingBalance -= principalPayment;
    }
    
    totalPayment = loanAmount + totalInterestClassic;
    monthlyPayment = totalPayment / totalMonths;
  }
  
  const totalInterest = totalPayment - loanAmount;
  
  // Комісії
  const oneTimeCommissionAmount = (loanAmount * input.oneTimeCommission) / 100;
  const totalMonthlyCommissions = (loanAmount * input.monthlyCommission / 100) * totalMonths;
  
  // Ефективна ставка (спрощений розрахунок)
  const totalCost = totalPayment + oneTimeCommissionAmount + totalMonthlyCommissions;
  const effectiveRate = ((totalCost / loanAmount - 1) / input.loanTermYears) * 100;
  
  // Додаткові витрати
  const pensionFund = (input.propertyValue * (input.pensionFundPercent ?? 0)) / 100;
  const duty = (input.propertyValue * (input.dutyPercent ?? 0)) / 100;
  const incomeTax = (input.propertyValue * (input.incomeTaxPercent ?? 0)) / 100;
  const militaryTax = (input.propertyValue * (input.militaryTaxPercent ?? 0)) / 100;
  const notary = input.notaryCost ?? 0;
  const appraisal = input.appraisalCost ?? 0;
  const insuranceAnnual = (input.propertyValue * (input.insurancePercent ?? 0)) / 100;
  const insuranceTotal = insuranceAnnual * input.loanTermYears;
  const agencyCommission = (input.propertyValue * (input.agencyCommissionPercent ?? 0)) / 100;
  const totalAdditional = pensionFund + duty + incomeTax + militaryTax + notary + appraisal + insuranceTotal + agencyCommission;

  const additionalCosts: AdditionalCosts = {
    pensionFund, duty, incomeTax, militaryTax, notary, appraisal,
    insuranceAnnual, insuranceTotal, agencyCommission, totalAdditional,
  };

  // Економія порівняно з комерційним кредитом
  let savingsVsCommercial = 0;
  if (input.isGovernmentProgram) {
    const commercialMonthlyRate = COMMERCIAL_RATE / 100 / 12;
    const commercialMonthlyPayment = loanAmount * 
      (commercialMonthlyRate * Math.pow(1 + commercialMonthlyRate, totalMonths)) / 
      (Math.pow(1 + commercialMonthlyRate, totalMonths) - 1);
    const commercialTotal = commercialMonthlyPayment * totalMonths;
    savingsVsCommercial = commercialTotal - totalPayment;
  }

  const grandTotal = totalPayment + downPaymentAmount + oneTimeCommissionAmount + totalMonthlyCommissions + totalAdditional;
  
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    effectiveRate,
    oneTimeCommissionAmount,
    totalMonthlyCommissions,
    savingsVsCommercial,
    additionalCosts,
    grandTotal,
  };
}

export function generateAmortizationSchedule(input: MortgageInput): AmortizationRow[] {
  const downPaymentAmount = calculateDownPaymentAmount(
    input.propertyValue,
    input.downPayment,
    input.downPaymentType
  );
  
  const loanAmount = input.propertyValue - downPaymentAmount;
  const totalMonths = input.loanTermYears * 12;
  const isGov = input.isGovernmentProgram;
  const rate1 = isGov ? input.governmentRate : input.interestRate;
  const rate2 = isGov ? (input.governmentRate === 3 ? 6 : 10) : input.interestRate;
  const phase1Months = isGov ? Math.min(totalMonths, 10 * 12) : totalMonths;
  
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  
  if (input.paymentType === 'annuity') {
    // Платіж для фази 1 (весь строк, якщо одна ставка)
    const mr1 = rate1 / 100 / 12;
    const mp1 = mr1 === 0 ? loanAmount / totalMonths
      : loanAmount * (mr1 * Math.pow(1 + mr1, totalMonths)) / (Math.pow(1 + mr1, totalMonths) - 1);

    for (let month = 1; month <= totalMonths; month++) {
      const isPhase2 = isGov && month > phase1Months;
      const mr = isPhase2 ? rate2 / 100 / 12 : mr1;
      
      let monthlyPayment = mp1;
      // На початку фази 2 — перерахувати платіж на залишок
      if (isGov && month === phase1Months + 1) {
        const remainingMonths = totalMonths - phase1Months;
        monthlyPayment = mr === 0 ? balance / remainingMonths
          : balance * (mr * Math.pow(1 + mr, remainingMonths)) / (Math.pow(1 + mr, remainingMonths) - 1);
      } else if (isGov && month > phase1Months + 1) {
        const remainingMonths = totalMonths - (month - 1);
        monthlyPayment = mr === 0 ? balance / remainingMonths
          : balance * (mr * Math.pow(1 + mr, remainingMonths)) / (Math.pow(1 + mr, remainingMonths) - 1);
      }

      const interestPayment = balance * mr;
      const principalPayment = monthlyPayment - interestPayment;
      const newBalance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        month,
        openingBalance: balance,
        principalPayment,
        interestPayment,
        totalPayment: monthlyPayment,
        closingBalance: newBalance,
      });
      
      balance = newBalance;
    }
  } else {
    const principalPayment = loanAmount / totalMonths;
    
    for (let month = 1; month <= totalMonths; month++) {
      const rate = isGov && month > phase1Months ? rate2 : rate1;
      const monthlyRate = rate / 100 / 12;
      const interestPayment = balance * monthlyRate;
      const totalPayment = principalPayment + interestPayment;
      const newBalance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        month,
        openingBalance: balance,
        principalPayment,
        interestPayment,
        totalPayment,
        closingBalance: newBalance,
      });
      
      balance = newBalance;
    }
  }
  
  return schedule;
}


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' грн';
}

export function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}
