import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  uk: {
    // Header
    'header.agency': 'Агентство нерухомості',
    'header.admin': 'Адмін',
    'header.login': 'Вхід',
    
    // Tabs
    'tabs.assistant': 'Помічник',
    'tabs.charts': 'Графіки',
    'tabs.banks': 'Банки',
    'tabs.table': 'Таблиця',
    'tabs.application': 'Заявка',
    
    // Calculator inputs
    'input.propertyValue': 'Вартість об\'єкта',
    'input.downPayment': 'Перший внесок',
    'input.loanTerm': 'Термін кредиту',
    'input.years': 'років',
    'input.interestRate': 'Річна ставка',
    'input.paymentType': 'Тип платежу',
    'input.annuity': 'Ануїтентний',
    'input.classic': 'Класичний',
    'input.governmentProgram': 'Державна програма',
    'input.governmentRate': 'Пільгова ставка',
    'input.calculate': 'Розрахувати',
    
    // Results
    'results.title': 'Результати розрахунку',
    'results.monthlyPayment': 'Щомісячний платіж',
    'results.totalPayment': 'Загальна сума виплат',
    'results.totalInterest': 'Загальні відсотки (переплата)',
    'results.effectiveRate': 'Ефективна річна ставка',
    'results.oneTimeCommission': 'Одноразова комісія',
    'results.totalMonthlyCommissions': 'Загальна щомісячна комісія',
    'results.savingsYeoselya': 'Економія за ЄОселя',
    'results.exportPDF': 'Експорт у PDF',
    
    // Bank comparison
    'banks.title': 'Порівняння банків-учасників ЄОселя',
    'banks.name': 'Банк',
    'banks.rate3': 'Ставка 3%',
    'banks.rate7': 'Ставка 7%',
    'banks.minDownPayment': 'Мін. внесок',
    'banks.monthlyPayment': 'Щоміс. платіж',
    'banks.yes': 'Так',
    'banks.no': 'Ні',
    'banks.details': 'Деталі',
    
    // Amortization table
    'schedule.title': 'Графік платежів',
    'schedule.first24': 'перші 24 місяці',
    'schedule.month': '#',
    'schedule.principal': 'Тіло',
    'schedule.interest': 'Відсотки',
    'schedule.payment': 'Платіж',
    'schedule.balance': 'Залишок',
    
    // PDF export
    'pdf.title': 'Розрахунок Іпотечного Кредиту',
    'pdf.agency': 'Revolution - Агентство Нерухомості',
    'pdf.date': 'Дата',
    'pdf.inputParams': 'Вхідні Параметри',
    'pdf.propertyValue': 'Вартість об\'єкта',
    'pdf.downPayment': 'Перший внесок',
    'pdf.loanAmount': 'Сума кредиту',
    'pdf.loanTerm': 'Термін кредиту',
    'pdf.yearsSuffix': 'років',
    'pdf.annualRate': 'Річна ставка',
    'pdf.paymentType': 'Тип платежу',
    'pdf.annuity': 'Ануїтентний',
    'pdf.classic': 'Класичний',
    'pdf.governmentProgram': 'Державна програма',
    'pdf.yes': 'Так',
    'pdf.no': 'Ні',
    'pdf.results': 'Результати Розрахунку',
    'pdf.monthlyPayment': 'Щомісячний платіж',
    'pdf.totalPayment': 'Загальна сума виплат',
    'pdf.totalInterest': 'Загальні відсотки (переплата)',
    'pdf.effectiveRate': 'Ефективна річна ставка',
    'pdf.oneTimeCommission': 'Одноразова комісія',
    'pdf.totalMonthlyCommissions': 'Загальна щомісячна комісія',
    'pdf.savingsYeoselya': 'Економія за ЄОселя',
    'pdf.bankComparison': 'Порівняння Банків-Учасників ЄОселя',
    'pdf.scheduleTitle': 'Графік Платежів (перші 24 місяці)',
    'pdf.footer': 'Калькулятор надає орієнтовні розрахунки. Точні умови кредитування уточнюйте у банку.',
    'pdf.page': 'Сторінка',
    'pdf.of': 'з',
    
    // Common
    'common.currency': '₴',
    'common.yes': 'Так',
    'common.no': 'Ні',
    
    // Programs
    'programs.title': 'Державні програми',
    'programs.compare': 'Порівняти програми',
    'programs.calculate': 'Розрахувати',
    'programs.eligibility': 'Хто може скористатись',
    
    // Consultation form
    'form.title': 'Заявка на консультацію',
    'form.name': 'Ваше ім\'я',
    'form.phone': 'Телефон',
    'form.email': 'Email',
    'form.bank': 'Оберіть банк',
    'form.message': 'Повідомлення',
    'form.submit': 'Відправити заявку',
    'form.success': 'Заявку успішно відправлено!',
    'form.error': 'Помилка відправки. Спробуйте ще раз.',
  },
  en: {
    // Header
    'header.agency': 'Real Estate Agency',
    'header.admin': 'Admin',
    'header.login': 'Login',
    
    // Tabs
    'tabs.assistant': 'Assistant',
    'tabs.charts': 'Charts',
    'tabs.banks': 'Banks',
    'tabs.table': 'Table',
    'tabs.application': 'Apply',
    
    // Calculator inputs
    'input.propertyValue': 'Property Value',
    'input.downPayment': 'Down Payment',
    'input.loanTerm': 'Loan Term',
    'input.years': 'years',
    'input.interestRate': 'Annual Rate',
    'input.paymentType': 'Payment Type',
    'input.annuity': 'Annuity',
    'input.classic': 'Classic',
    'input.governmentProgram': 'Government Program',
    'input.governmentRate': 'Preferential Rate',
    'input.calculate': 'Calculate',
    
    // Results
    'results.title': 'Calculation Results',
    'results.monthlyPayment': 'Monthly Payment',
    'results.totalPayment': 'Total Payment',
    'results.totalInterest': 'Total Interest (Overpayment)',
    'results.effectiveRate': 'Effective Annual Rate',
    'results.oneTimeCommission': 'One-time Commission',
    'results.totalMonthlyCommissions': 'Total Monthly Commissions',
    'results.savingsYeoselya': 'Savings with YeOselya',
    'results.exportPDF': 'Export to PDF',
    
    // Bank comparison
    'banks.title': 'Comparison of YeOselya Partner Banks',
    'banks.name': 'Bank',
    'banks.rate3': 'Rate 3%',
    'banks.rate7': 'Rate 7%',
    'banks.minDownPayment': 'Min. Down Payment',
    'banks.monthlyPayment': 'Monthly Payment',
    'banks.yes': 'Yes',
    'banks.no': 'No',
    'banks.details': 'Details',
    
    // Amortization table
    'schedule.title': 'Payment Schedule',
    'schedule.first24': 'first 24 months',
    'schedule.month': '#',
    'schedule.principal': 'Principal',
    'schedule.interest': 'Interest',
    'schedule.payment': 'Payment',
    'schedule.balance': 'Balance',
    
    // PDF export
    'pdf.title': 'Mortgage Loan Calculation',
    'pdf.agency': 'Revolution - Real Estate Agency',
    'pdf.date': 'Date',
    'pdf.inputParams': 'Input Parameters',
    'pdf.propertyValue': 'Property Value',
    'pdf.downPayment': 'Down Payment',
    'pdf.loanAmount': 'Loan Amount',
    'pdf.loanTerm': 'Loan Term',
    'pdf.yearsSuffix': 'years',
    'pdf.annualRate': 'Annual Rate',
    'pdf.paymentType': 'Payment Type',
    'pdf.annuity': 'Annuity',
    'pdf.classic': 'Classic',
    'pdf.governmentProgram': 'Government Program',
    'pdf.yes': 'Yes',
    'pdf.no': 'No',
    'pdf.results': 'Calculation Results',
    'pdf.monthlyPayment': 'Monthly Payment',
    'pdf.totalPayment': 'Total Payment',
    'pdf.totalInterest': 'Total Interest (Overpayment)',
    'pdf.effectiveRate': 'Effective Annual Rate',
    'pdf.oneTimeCommission': 'One-time Commission',
    'pdf.totalMonthlyCommissions': 'Total Monthly Commissions',
    'pdf.savingsYeoselya': 'Savings with YeOselya',
    'pdf.bankComparison': 'Comparison of YeOselya Partner Banks',
    'pdf.scheduleTitle': 'Payment Schedule (first 24 months)',
    'pdf.footer': 'The calculator provides estimated calculations. Confirm exact loan terms with your bank.',
    'pdf.page': 'Page',
    'pdf.of': 'of',
    
    // Common
    'common.currency': '₴',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Programs
    'programs.title': 'Government Programs',
    'programs.compare': 'Compare Programs',
    'programs.calculate': 'Calculate',
    'programs.eligibility': 'Who is eligible',
    
    // Consultation form
    'form.title': 'Consultation Request',
    'form.name': 'Your Name',
    'form.phone': 'Phone',
    'form.email': 'Email',
    'form.bank': 'Select Bank',
    'form.message': 'Message',
    'form.submit': 'Submit Request',
    'form.success': 'Request sent successfully!',
    'form.error': 'Sending error. Please try again.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'uk';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['uk']] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export translations for PDF (which doesn't have React context access)
export function getTranslations(lang: Language) {
  return translations[lang];
}
