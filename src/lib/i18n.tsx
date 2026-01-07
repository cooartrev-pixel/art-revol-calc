import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations = {
  uk: {
    // Header
    'header.agency': 'Агентство нерухомості',
    'header.admin': 'Адмін',
    'header.login': 'Вхід',
    'header.installApp': 'Встановити додаток',
    'header.title': 'Іпотечний Калькулятор',
    'header.subtitle': 'Розрахуйте вигідні умови кредитування, включаючи державну програму "ЄОселя" зі ставками від 3% річних',
    
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
    'input.year': 'рік',
    'input.interestRate': 'Річна ставка',
    'input.paymentType': 'Тип платежу',
    'input.annuity': 'Ануїтетний',
    'input.classic': 'Класичний',
    'input.governmentProgram': 'Державна програма',
    'input.governmentRate': 'Пільгова ставка',
    'input.calculate': 'Розрахувати',
    'input.percent': 'Відсоток',
    'input.amount': 'Сума',
    'input.loanAmount': 'Сума кредиту',
    'input.contribution': 'Внесок',
    'input.currency': 'грн',
    'input.min': '100 тис',
    'input.max': '20 млн',
    'input.yeoselia': 'Програма "ЄОселя"',
    'input.selectCategory': 'Оберіть вашу категорію для визначення процентної ставки:',
    'input.rate3': '3% річних',
    'input.rate7': '7% річних',
    'input.privileged': 'Пільгова',
    'input.standard': 'Стандартна',
    'input.rate3desc': 'Військовослужбовці, педагоги, медики, науковці',
    'input.rate7desc': 'Ветерани, ВПО, особи без власного житла (>52,5 м²)',
    'input.annualRate': 'Річна процентна ставка',
    'input.equalPayments': 'Рівні платежі',
    'input.decreasingPayments': 'Спадні платежі',
    'input.bankCommissions': 'Комісії банку',
    'input.oneTimeCommission': 'Одноразова комісія',
    'input.monthlyCommission': 'Щомісячна комісія',
    
    // Results
    'results.title': 'Результати розрахунку',
    'results.monthlyPayment': 'Щомісячний платіж',
    'results.loanAmount': 'Сума кредиту',
    'results.totalPayment': 'Загальна сума виплат',
    'results.totalInterest': 'Загальні відсотки (переплата)',
    'results.overpayment': 'Переплата',
    'results.totalSum': 'Загальна сума',
    'results.effectiveRate': 'Ефективна ставка',
    'results.oneTimeCommission': 'Одноразова комісія',
    'results.monthlyCommissions': 'Щомісячні комісії (всього)',
    'results.totalMonthlyCommissions': 'Загальна щомісячна комісія',
    'results.savingsYeoselya': 'Економія за ЄОселя',
    'results.exportPDF': 'Експорт у PDF',
    'results.commissions': 'Комісії',
    
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
    'banks.officialInfo': 'Офіційна інформація про програму "ЄОселя"',
    'banks.officialDesc': 'Актуальні умови, вимоги та перелік банків-учасників',
    'banks.officialSite': 'Офіційний сайт ЄОселя',
    'banks.privilegedRate': 'Пільгова ставка',
    'banks.standardRate': 'Стандартна ставка',
    'banks.forPriority': 'для пріоритетних категорій',
    'banks.forOthers': 'для інших категорій',
    'banks.participantBanks': 'Банків-учасників',
    'banks.asOf2025': 'станом на 2025 рік',
    'banks.comparisonTitle': 'Порівняння банків-учасників програми "ЄОселя"',
    'banks.table': 'Таблиця',
    'banks.cards': 'Картки',
    'banks.rate': 'Ставка',
    'banks.maxAmount': 'Макс. сума',
    'banks.downPayment': 'Внесок',
    'banks.term': 'Термін',
    'banks.processing': 'Розгляд',
    'banks.website': 'Сайт',
    'banks.limitExceeded': 'Перевищено ліміт',
    'banks.calcNote': '* Розрахунок для суми кредиту {loanAmount} на {years} років за ставкою {rate}%',
    'banks.upToYears': 'до {years} років',
    'banks.bankWebsite': 'Сайт банку',
    'banks.goToWebsite': 'Перейти на сайт банку',
    'banks.loanExceedsLimit': 'Сума кредиту перевищує ліміт банку',
    'banks.importantInfo': 'Важлива інформація',
    'banks.info1': 'Ви можете подати заявку одночасно до 5 банків через додаток "Дія"',
    'banks.info2': 'Після 10 років ставка змінюється: з 3% до 6% або з 7% до 10%',
    'banks.info3': 'Для молоді до 25 років мінімальний внесок знижено до 10%',
    'banks.info4': 'Банки можуть мати додаткові вимоги до позичальників та об\'єктів нерухомості',
    
    // Amortization table
    'schedule.title': 'Таблиця амортизації',
    'schedule.export': 'Експорт',
    'schedule.first24': 'перші 24 місяці',
    'schedule.month': '№',
    'schedule.openingBalance': 'Поч. залишок',
    'schedule.principal': 'Тіло',
    'schedule.interest': 'Відсотки',
    'schedule.payment': 'Платіж',
    'schedule.closingBalance': 'Кін. залишок',
    'schedule.balance': 'Залишок',
    'schedule.collapse': 'Згорнути таблицю',
    'schedule.showAll': 'Показати всі {months} місяців',
    'schedule.csvMonth': 'Місяць',
    'schedule.csvOpeningBalance': 'Початковий залишок',
    'schedule.csvPrincipal': 'Тіло кредиту',
    'schedule.csvInterest': 'Відсотки',
    'schedule.csvPayment': 'Загальний платіж',
    'schedule.csvClosingBalance': 'Кінцевий залишок',
    
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
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.success': 'Успішно',
    'common.copyright': '© 2024 Revolution - Агентство нерухомості. Всі права захищені.',
    'common.disclaimer': 'Калькулятор надає орієнтовні розрахунки. Точні умови кредитування уточнюйте у банку.',
    
    // Programs
    'programs.title': 'Державні програми',
    'programs.compare': 'Порівняти програми',
    'programs.calculate': 'Розрахувати',
    'programs.eligibility': 'Хто може скористатись',
    
    // Consultation form
    'form.title': 'Заявка на консультацію',
    'form.subtitle': 'Залиште заявку і наш агент зв\'яжеться з вами для детальної консультації',
    'form.name': 'Ім\'я',
    'form.namePlaceholder': 'Ваше ім\'я',
    'form.phone': 'Телефон',
    'form.phonePlaceholder': '+380 XX XXX XX XX',
    'form.email': 'Email',
    'form.emailOptional': 'Email (необов\'язково)',
    'form.emailPlaceholder': 'your@email.com',
    'form.bank': 'Обраний банк (необов\'язково)',
    'form.bankPlaceholder': 'Виберіть банк',
    'form.bankNotDecided': 'Не визначився',
    'form.message': 'Додаткове повідомлення',
    'form.messagePlaceholder': 'Опишіть ваші побажання або питання...',
    'form.includeCalculation': 'Додати дані розрахунку',
    'form.calculationIncluded': '{amount} на {years} років під {rate}%',
    'form.calculationNotIncluded': 'Дані розрахунку не будуть додані',
    'form.submit': 'Надіслати заявку',
    'form.submitting': 'Надсилання...',
    'form.success': 'Заявку надіслано!',
    'form.successDesc': 'Наш агент зв\'яжеться з вами найближчим часом.',
    'form.error': 'Помилка',
    'form.errorDesc': 'Не вдалося надіслати заявку. Спробуйте ще раз.',
    'form.thankYou': 'Дякуємо за заявку!',
    'form.thankYouDesc': 'Наш агент зв\'яжеться з вами найближчим часом для консультації.',
    'form.submitAnother': 'Надіслати ще одну заявку',
    'form.required': '*',
    
    // Validation messages
    'validation.nameMin': 'Ім\'я повинно містити мінімум 2 символи',
    'validation.nameMax': 'Ім\'я занадто довге',
    'validation.phoneInvalid': 'Введіть коректний номер телефону',
    'validation.phoneMax': 'Номер телефону занадто довгий',
    'validation.emailInvalid': 'Некоректна email адреса',
    'validation.emailMax': 'Email занадто довгий',
    'validation.messageMax': 'Повідомлення занадто довге',
    
    // Callback widget
    'callback.title': 'Зворотний зв\'язок',
    'callback.description': 'Залиште ваші контактні дані і ми зв\'яжемося з вами найближчим часом',
    'callback.defaultMessage': 'Запит на зворотний дзвінок',
    'callback.success': 'Заявку відправлено!',
    'callback.successDesc': 'Ми зв\'яжемося з вами найближчим часом',
    'callback.error': 'Помилка',
    'callback.errorDesc': 'Не вдалося відправити заявку. Спробуйте ще раз.',
    'callback.messagePlaceholder': 'Опишіть ваше питання (необов\'язково)',
    'callback.submit': 'Надіслати заявку',
  },
  en: {
    // Header
    'header.agency': 'Real Estate Agency',
    'header.admin': 'Admin',
    'header.login': 'Login',
    'header.installApp': 'Install App',
    'header.title': 'Mortgage Calculator',
    'header.subtitle': 'Calculate favorable loan terms, including the "YeOselya" government program with rates from 3% per annum',
    
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
    'input.year': 'year',
    'input.interestRate': 'Annual Rate',
    'input.paymentType': 'Payment Type',
    'input.annuity': 'Annuity',
    'input.classic': 'Classic',
    'input.governmentProgram': 'Government Program',
    'input.governmentRate': 'Preferential Rate',
    'input.calculate': 'Calculate',
    'input.percent': 'Percent',
    'input.amount': 'Amount',
    'input.loanAmount': 'Loan Amount',
    'input.contribution': 'Contribution',
    'input.currency': 'UAH',
    'input.min': '100K',
    'input.max': '20M',
    'input.yeoselia': 'YeOselya Program',
    'input.selectCategory': 'Select your category to determine the interest rate:',
    'input.rate3': '3% per annum',
    'input.rate7': '7% per annum',
    'input.privileged': 'Preferential',
    'input.standard': 'Standard',
    'input.rate3desc': 'Military, educators, medical workers, scientists',
    'input.rate7desc': 'Veterans, IDPs, persons without own housing (>52.5 m²)',
    'input.annualRate': 'Annual Interest Rate',
    'input.equalPayments': 'Equal payments',
    'input.decreasingPayments': 'Decreasing payments',
    'input.bankCommissions': 'Bank Commissions',
    'input.oneTimeCommission': 'One-time Commission',
    'input.monthlyCommission': 'Monthly Commission',
    
    // Results
    'results.title': 'Calculation Results',
    'results.monthlyPayment': 'Monthly Payment',
    'results.loanAmount': 'Loan Amount',
    'results.totalPayment': 'Total Payment',
    'results.totalInterest': 'Total Interest (Overpayment)',
    'results.overpayment': 'Overpayment',
    'results.totalSum': 'Total Amount',
    'results.effectiveRate': 'Effective Rate',
    'results.oneTimeCommission': 'One-time Commission',
    'results.monthlyCommissions': 'Monthly Commissions (total)',
    'results.totalMonthlyCommissions': 'Total Monthly Commissions',
    'results.savingsYeoselya': 'Savings with YeOselya',
    'results.exportPDF': 'Export to PDF',
    'results.commissions': 'Commissions',
    
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
    'banks.officialInfo': 'Official YeOselya Program Information',
    'banks.officialDesc': 'Current terms, requirements, and list of partner banks',
    'banks.officialSite': 'Official YeOselya Website',
    'banks.privilegedRate': 'Preferential Rate',
    'banks.standardRate': 'Standard Rate',
    'banks.forPriority': 'for priority categories',
    'banks.forOthers': 'for other categories',
    'banks.participantBanks': 'Partner Banks',
    'banks.asOf2025': 'as of 2025',
    'banks.comparisonTitle': 'Comparison of YeOselya Partner Banks',
    'banks.table': 'Table',
    'banks.cards': 'Cards',
    'banks.rate': 'Rate',
    'banks.maxAmount': 'Max Amount',
    'banks.downPayment': 'Down Payment',
    'banks.term': 'Term',
    'banks.processing': 'Processing',
    'banks.website': 'Website',
    'banks.limitExceeded': 'Limit Exceeded',
    'banks.calcNote': '* Calculation for loan amount {loanAmount} for {years} years at {rate}%',
    'banks.upToYears': 'up to {years} years',
    'banks.bankWebsite': 'Bank Website',
    'banks.goToWebsite': 'Go to bank website',
    'banks.loanExceedsLimit': 'Loan amount exceeds bank limit',
    'banks.importantInfo': 'Important Information',
    'banks.info1': 'You can apply to up to 5 banks simultaneously through the "Diia" app',
    'banks.info2': 'After 10 years, the rate changes: from 3% to 6% or from 7% to 10%',
    'banks.info3': 'For youth under 25, minimum down payment is reduced to 10%',
    'banks.info4': 'Banks may have additional requirements for borrowers and properties',
    
    // Amortization table
    'schedule.title': 'Amortization Table',
    'schedule.export': 'Export',
    'schedule.first24': 'first 24 months',
    'schedule.month': '#',
    'schedule.openingBalance': 'Opening Bal.',
    'schedule.principal': 'Principal',
    'schedule.interest': 'Interest',
    'schedule.payment': 'Payment',
    'schedule.closingBalance': 'Closing Bal.',
    'schedule.balance': 'Balance',
    'schedule.collapse': 'Collapse table',
    'schedule.showAll': 'Show all {months} months',
    'schedule.csvMonth': 'Month',
    'schedule.csvOpeningBalance': 'Opening Balance',
    'schedule.csvPrincipal': 'Principal',
    'schedule.csvInterest': 'Interest',
    'schedule.csvPayment': 'Total Payment',
    'schedule.csvClosingBalance': 'Closing Balance',
    
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
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.copyright': '© 2024 Revolution - Real Estate Agency. All rights reserved.',
    'common.disclaimer': 'The calculator provides estimated calculations. Confirm exact loan terms with your bank.',
    
    // Programs
    'programs.title': 'Government Programs',
    'programs.compare': 'Compare Programs',
    'programs.calculate': 'Calculate',
    'programs.eligibility': 'Who is eligible',
    
    // Consultation form
    'form.title': 'Consultation Request',
    'form.subtitle': 'Submit a request and our agent will contact you for detailed consultation',
    'form.name': 'Name',
    'form.namePlaceholder': 'Your name',
    'form.phone': 'Phone',
    'form.phonePlaceholder': '+380 XX XXX XX XX',
    'form.email': 'Email',
    'form.emailOptional': 'Email (optional)',
    'form.emailPlaceholder': 'your@email.com',
    'form.bank': 'Selected Bank (optional)',
    'form.bankPlaceholder': 'Select bank',
    'form.bankNotDecided': 'Not decided',
    'form.message': 'Additional Message',
    'form.messagePlaceholder': 'Describe your wishes or questions...',
    'form.includeCalculation': 'Include calculation data',
    'form.calculationIncluded': '{amount} for {years} years at {rate}%',
    'form.calculationNotIncluded': 'Calculation data will not be included',
    'form.submit': 'Submit Request',
    'form.submitting': 'Submitting...',
    'form.success': 'Request sent!',
    'form.successDesc': 'Our agent will contact you shortly.',
    'form.error': 'Error',
    'form.errorDesc': 'Failed to send request. Please try again.',
    'form.thankYou': 'Thank you for your request!',
    'form.thankYouDesc': 'Our agent will contact you soon for consultation.',
    'form.submitAnother': 'Submit another request',
    'form.required': '*',
    
    // Validation messages
    'validation.nameMin': 'Name must contain at least 2 characters',
    'validation.nameMax': 'Name is too long',
    'validation.phoneInvalid': 'Enter a valid phone number',
    'validation.phoneMax': 'Phone number is too long',
    'validation.emailInvalid': 'Invalid email address',
    'validation.emailMax': 'Email is too long',
    'validation.messageMax': 'Message is too long',
    
    // Callback widget
    'callback.title': 'Callback Request',
    'callback.description': 'Leave your contact details and we will contact you shortly',
    'callback.defaultMessage': 'Callback request',
    'callback.success': 'Request sent!',
    'callback.successDesc': 'We will contact you shortly',
    'callback.error': 'Error',
    'callback.errorDesc': 'Failed to send request. Please try again.',
    'callback.messagePlaceholder': 'Describe your question (optional)',
    'callback.submit': 'Submit Request',
  },
};

// Language context for i18n support
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations['uk']] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return text;
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