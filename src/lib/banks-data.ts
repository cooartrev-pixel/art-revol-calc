export interface BankInfo {
  id: string;
  name: string;
  logo: string;
  website: string;
  rates: {
    privileged: number; // 3% категорія
    standard: number;   // 7% категорія
  };
  effectiveRates?: {
    privileged: number; // Реальна ставка з комісіями
    standard: number;
  };
  minDownPayment: number;       // Для вторинного ринку
  minDownPaymentNewBuild: number; // Для новобудов від забудовника
  maxDownPayment: number;
  minTerm: number;
  maxTerm: number;
  maxLoanAmount: number;
  oneTimeCommission: string;
  monthlyCommission: string;
  features: string[];
  processingTime: string;
}

export const OFFICIAL_YEOSELYA_URL = 'https://eoselia.diia.gov.ua/';
export const UKRFINZHYTLO_URL = 'https://ukrfinzhytlo.in.ua/e-oselia/';

export const banks: BankInfo[] = [
  {
    id: 'oschadbank',
    name: 'Ощадбанк',
    logo: '🏦',
    website: 'https://www.oschadbank.ua/credit/eoselia',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 4.0, standard: 8.27 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 6000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Найбільша мережа відділень', 'Державний банк', 'Макс. сума 6 млн'],
    processingTime: '3-5 днів',
  },
  {
    id: 'privatbank',
    name: 'ПриватБанк',
    logo: '🏛️',
    website: 'https://privatbank.ua/kredyty/e-oselya',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 4.45, standard: 8.64 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 80,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 4000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Найбільший банк України', 'Зручний мобільний додаток', 'Онлайн заявка'],
    processingTime: '1-3 дні',
  },
  {
    id: 'ukrgasbank',
    name: 'Укргазбанк',
    logo: '🌿',
    website: 'https://www.ukrgasbank.com/private/credits/e_oselya/',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 3.91, standard: 8.19 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 3,
    maxTerm: 20,
    maxLoanAmount: 5000000,
    oneTimeCommission: '0.99%',
    monthlyCommission: '0%',
    features: ['Еко-банк', 'Макс. сума 5 млн', 'Державний банк'],
    processingTime: '3-7 днів',
  },
  {
    id: 'globus',
    name: 'Глобус Банк',
    logo: '🌐',
    website: 'https://globusbank.com.ua/ua/yeoselya.html',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 3.75, standard: 7.95 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Найнижча ефективна ставка', 'Швидкий розгляд', 'Лояльні вимоги'],
    processingTime: '2-5 днів',
  },
  {
    id: 'ukreximbank',
    name: 'Укрексімбанк',
    logo: '🏛️',
    website: 'https://www.eximb.com/ua/business/pryvatnym-klientam/pryvatnym-klientam-kredituvannya/eoselya.html',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 3.99, standard: 8.71 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 4000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Державний банк', 'Калькулятор на сайті', 'Широка мережа'],
    processingTime: '3-5 днів',
  },
  {
    id: 'skybank',
    name: 'Скай Банк',
    logo: '☁️',
    website: 'https://www.sky.bank/ru/node/277',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 4.5, standard: 9.47 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Сучасний банк', 'Цифрові сервіси', 'Онлайн обслуговування'],
    processingTime: '3-5 днів',
  },
  {
    id: 'sensebank',
    name: 'Сенс Банк',
    logo: '💡',
    website: 'https://sensebank.ua/ipotecnij-kredit',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 4.09, standard: 8.49 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3500000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Колишній Альфа-Банк', 'Великий досвід', 'Якісний сервіс'],
    processingTime: '3-7 днів',
  },
  {
    id: 'creditdnipro',
    name: 'Банк Кредит Дніпро',
    logo: '🏢',
    website: 'https://creditdnepr.com.ua/ipoteka/eoselia',
    rates: { privileged: 3, standard: 7 },
    effectiveRates: { privileged: 3.8, standard: 7.9 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Найнижча ефективна 7%', 'Персональний менеджер', 'Гнучкі умови'],
    processingTime: '5-7 днів',
  },
  {
    id: 'tascombank',
    name: 'ТАСКОМБАНК',
    logo: '🔷',
    website: 'https://tascombank.ua/you/credits/derzhavnaprogramaprydbanniazhytlaieoselia',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Надійний банк', 'Прозорі умови', 'Якісна підтримка'],
    processingTime: '3-5 днів',
  },
  {
    id: 'bisbank',
    name: 'BISBANK',
    logo: '🔶',
    website: 'https://bisbank.com.ua/',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 2500000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Сучасний підхід', 'Зручні сервіси', 'Швидке оформлення'],
    processingTime: '3-5 днів',
  },
  {
    id: 'radabank',
    name: 'РАДАБАНК',
    logo: '🏦',
    website: 'https://www.radabank.com.ua/krediti/e-oselya',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    minDownPaymentNewBuild: 30,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 2500000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Індивідуальний підхід', 'Регіональний банк', 'Гнучкі умови'],
    processingTime: '5-7 днів',
  },
];

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' грн';
}
