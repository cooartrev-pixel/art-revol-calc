export interface BankInfo {
  id: string;
  name: string;
  logo: string;
  website: string;
  rates: {
    privileged: number; // 3% категорія
    standard: number;   // 7% категорія
  };
  minDownPayment: number;
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
    website: 'https://www.oschadbank.ua/credit/nerukhomist-na-vtorinnomu-rinku',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 4000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Найбільша мережа відділень', 'Державний банк', 'Швидке рішення'],
    processingTime: '3-5 днів',
  },
  {
    id: 'privatbank',
    name: 'ПриватБанк',
    logo: '🏛️',
    website: 'https://privatbank.ua/kredyty/eoselya',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
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
    website: 'https://www.ukrgasbank.com/',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    maxDownPayment: 70,
    minTerm: 3,
    maxTerm: 20,
    maxLoanAmount: 3500000,
    oneTimeCommission: '0.99%',
    monthlyCommission: '0%',
    features: ['Еко-банк', 'Гнучкі умови', 'Державний банк'],
    processingTime: '3-7 днів',
  },
  {
    id: 'globus',
    name: 'Глобус Банк',
    logo: '🌐',
    website: 'https://globusbank.com.ua/ua/yeoselia-derzhavna-prohrama.html',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Індивідуальний підхід', 'Швидкий розгляд', 'Лояльні вимоги'],
    processingTime: '2-5 днів',
  },
  {
    id: 'skybank',
    name: 'Скай Банк',
    logo: '☁️',
    website: 'https://www.sky.bank/',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
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
    minDownPayment: 20,
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
    minDownPayment: 20,
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 3000000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Регіональний банк', 'Персональний менеджер', 'Гнучкі умови'],
    processingTime: '5-7 днів',
  },
  {
    id: 'tascombank',
    name: 'ТАСКОМБАНК',
    logo: '🔷',
    website: 'https://tascombank.ua/you/credits/derzhavnaprogramaprydbanniazhytlaieoselia',
    rates: { privileged: 3, standard: 7 },
    minDownPayment: 20,
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
    maxDownPayment: 70,
    minTerm: 2,
    maxTerm: 20,
    maxLoanAmount: 2500000,
    oneTimeCommission: '1%',
    monthlyCommission: '0%',
    features: ['Новий учасник програми', 'Індивідуальний підхід', 'Регіональний банк'],
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
