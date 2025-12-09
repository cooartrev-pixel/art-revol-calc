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

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPaymentAmount = calculateDownPaymentAmount(
    input.propertyValue,
    input.downPayment,
    input.downPaymentType
  );
  
  const loanAmount = input.propertyValue - downPaymentAmount;
  const rate = input.isGovernmentProgram ? input.governmentRate : input.interestRate;
  const monthlyRate = rate / 100 / 12;
  const totalMonths = input.loanTermYears * 12;
  
  let monthlyPayment: number;
  let totalPayment: number;
  
  if (input.paymentType === 'annuity') {
    // Ануїтетний платіж
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalMonths;
    } else {
      monthlyPayment = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    totalPayment = monthlyPayment * totalMonths;
  } else {
    // Класичний (диференційований) платіж - середній
    const principalPayment = loanAmount / totalMonths;
    let totalInterestClassic = 0;
    let remainingBalance = loanAmount;
    
    for (let i = 0; i < totalMonths; i++) {
      totalInterestClassic += remainingBalance * monthlyRate;
      remainingBalance -= principalPayment;
    }
    
    totalPayment = loanAmount + totalInterestClassic;
    // Середній платіж для відображення
    monthlyPayment = totalPayment / totalMonths;
  }
  
  const totalInterest = totalPayment - loanAmount;
  
  // Комісії
  const oneTimeCommissionAmount = (loanAmount * input.oneTimeCommission) / 100;
  const totalMonthlyCommissions = (loanAmount * input.monthlyCommission / 100) * totalMonths;
  
  // Ефективна ставка (спрощений розрахунок)
  const totalCost = totalPayment + oneTimeCommissionAmount + totalMonthlyCommissions;
  const effectiveRate = ((totalCost / loanAmount - 1) / input.loanTermYears) * 100;
  
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
  
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    effectiveRate,
    oneTimeCommissionAmount,
    totalMonthlyCommissions,
    savingsVsCommercial,
  };
}

export function generateAmortizationSchedule(input: MortgageInput): AmortizationRow[] {
  const downPaymentAmount = calculateDownPaymentAmount(
    input.propertyValue,
    input.downPayment,
    input.downPaymentType
  );
  
  const loanAmount = input.propertyValue - downPaymentAmount;
  const rate = input.isGovernmentProgram ? input.governmentRate : input.interestRate;
  const monthlyRate = rate / 100 / 12;
  const totalMonths = input.loanTermYears * 12;
  
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  
  if (input.paymentType === 'annuity') {
    const monthlyPayment = monthlyRate === 0 
      ? loanAmount / totalMonths
      : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
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
