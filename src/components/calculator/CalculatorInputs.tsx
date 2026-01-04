import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Percent, Calendar, Building2, Flag, HelpCircle } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { calculateDownPaymentAmount, formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CalculatorInputsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
}

export function CalculatorInputs({ values, onChange }: CalculatorInputsProps) {
  const { t, language } = useLanguage();
  
  const updateValue = <K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) => {
    onChange({ ...values, [key]: value });
  };

  const loanAmount = values.propertyValue - calculateDownPaymentAmount(
    values.propertyValue,
    values.downPayment,
    values.downPaymentType
  );

  const downPaymentPercent = values.downPaymentType === 'percent' 
    ? values.downPayment 
    : (values.downPayment / values.propertyValue) * 100;

  // Tooltips content
  const tooltips = {
    propertyValue: {
      title: language === 'uk' ? 'Вартість нерухомості' : 'Property Value',
      description: language === 'uk'
        ? 'Повна ринкова вартість квартири, будинку або іншої нерухомості, яку ви плануєте придбати. Ця сума визначається на основі оцінки незалежного експерта або ціни в договорі купівлі-продажу. Для державних програм існують обмеження за регіонами (наприклад, до 2.5 млн грн для Києва).'
        : 'The full market value of the apartment, house, or other property you plan to purchase. This amount is determined based on an independent expert assessment or the price in the purchase agreement. Government programs have regional limits (e.g., up to 2.5M UAH for Kyiv).'
    },
    downPayment: {
      title: language === 'uk' ? 'Перший внесок' : 'Down Payment',
      description: language === 'uk'
        ? 'Сума власних коштів, яку ви сплачуєте одразу при оформленні кредиту. Чим більший перший внесок — тим менша сума кредиту та щомісячний платіж. Для програми ЄОселя мінімальний внесок — 20%, для комерційних кредитів — зазвичай від 10-30%. Рекомендуємо накопичити щонайменше 20-30% від вартості.'
        : 'The amount of your own funds that you pay immediately when applying for a loan. The larger the down payment, the smaller the loan amount and monthly payment. For the YeOselya program, the minimum is 20%, for commercial loans — usually 10-30%. We recommend saving at least 20-30% of the value.'
    },
    loanTerm: {
      title: language === 'uk' ? 'Термін кредитування' : 'Loan Term',
      description: language === 'uk'
        ? 'Період часу, протягом якого ви будете погашати кредит. Довший термін = менший щомісячний платіж, але більша загальна переплата. Коротший термін = більший платіж, але менша переплата. Оптимальний термін для іпотеки — 15-20 років. Максимум для держпрограм — 20-25 років.'
        : 'The period during which you will repay the loan. Longer term = smaller monthly payment but higher total overpayment. Shorter term = larger payment but less overpayment. The optimal mortgage term is 15-20 years. Maximum for government programs is 20-25 years.'
    },
    governmentProgram: {
      title: language === 'uk' ? 'Програма ЄОселя' : 'YeOselya Program',
      description: language === 'uk'
        ? 'Державна програма пільгового іпотечного кредитування для громадян України. Забезпечує фіксовану ставку 3% (для пільгових категорій: військові, вчителі, медики, науковці) або 7% (для всіх інших). Вимоги: громадянство України, відсутність власного житла, мінімум 20% першого внеску.'
        : 'Government preferential mortgage lending program for Ukrainian citizens. Provides a fixed rate of 3% (for priority categories: military, teachers, medics, scientists) or 7% (for everyone else). Requirements: Ukrainian citizenship, no own housing, minimum 20% down payment.'
    },
    interestRate: {
      title: language === 'uk' ? 'Процентна ставка' : 'Interest Rate',
      description: language === 'uk'
        ? 'Річна процентна ставка за кредитом — це плата банку за користування кредитними коштами. Комерційні ставки в Україні зазвичай становлять 15-25% річних. Державні програми пропонують значно нижчі ставки: 3% або 7% за ЄОселя. Ставка безпосередньо впливає на розмір щомісячного платежу та загальну переплату.'
        : 'The annual interest rate on the loan is the bank\'s fee for using credit funds. Commercial rates in Ukraine are usually 15-25% per year. Government programs offer much lower rates: 3% or 7% for YeOselya. The rate directly affects the monthly payment and total overpayment.'
    },
    paymentType: {
      title: language === 'uk' ? 'Тип платежу' : 'Payment Type',
      description: language === 'uk'
        ? 'Ануїтетний платіж — однакова сума щомісяця весь термін. Зручний для планування бюджету, але загальна переплата більша. Класичний (диференційований) — спочатку платіж більший, потім зменшується. Переплата менша, але перші роки навантаження на бюджет вище.'
        : 'Annuity payment — the same amount every month for the entire term. Convenient for budget planning, but total overpayment is higher. Classic (differentiated) — initially the payment is larger, then decreases. Less overpayment, but the first years put more strain on the budget.'
    },
    commissions: {
      title: language === 'uk' ? 'Банківські комісії' : 'Bank Commissions',
      description: language === 'uk'
        ? 'Додаткові платежі банку за обслуговування кредиту. Одноразова комісія (1-2%) — сплачується при видачі кредиту. Щомісячна комісія (0.01-0.1%) — стягується з залишку боргу кожного місяця. Комісії суттєво впливають на ефективну ставку — обовʼязково враховуйте їх при порівнянні пропозицій!'
        : 'Additional bank fees for loan servicing. One-time commission (1-2%) — paid when the loan is issued. Monthly commission (0.01-0.1%) — charged on the remaining debt each month. Commissions significantly affect the effective rate — be sure to consider them when comparing offers!'
    }
  };

  const InfoIcon = ({ tooltipKey }: { tooltipKey: keyof typeof tooltips }) => (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="ml-1.5 inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm" side="right" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">{tooltips[tooltipKey].title}</h4>
          <p className="text-muted-foreground leading-relaxed">{tooltips[tooltipKey].description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="space-y-6">
      {/* Вартість об'єкта */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Home className="h-5 w-5 text-primary mr-2" />
            {t('input.propertyValue')}
            <InfoIcon tooltipKey="propertyValue" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={values.propertyValue || ''}
              onChange={(e) => updateValue('propertyValue', Number(e.target.value))}
              className="text-lg font-medium"
              placeholder="0"
            />
            <span className="text-muted-foreground whitespace-nowrap">{t('input.currency')}</span>
          </div>
          <Slider
            value={[values.propertyValue]}
            onValueChange={([value]) => updateValue('propertyValue', value)}
            min={100000}
            max={20000000}
            step={50000}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('input.min')}</span>
            <span>{t('input.max')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Перший внесок */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Percent className="h-5 w-5 text-primary mr-2" />
            {t('input.downPayment')}
            <InfoIcon tooltipKey="downPayment" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs 
            value={values.downPaymentType} 
            onValueChange={(v) => updateValue('downPaymentType', v as 'amount' | 'percent')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="percent">{t('input.percent')}</TabsTrigger>
              <TabsTrigger value="amount">{t('input.amount')}</TabsTrigger>
            </TabsList>
            <TabsContent value="percent" className="mt-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={values.downPayment || ''}
                  onChange={(e) => updateValue('downPayment', Number(e.target.value))}
                  className="text-lg font-medium"
                  placeholder="0"
                  min={values.isGovernmentProgram ? 20 : 6}
                  max={90}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <Slider
                value={[values.downPayment]}
                onValueChange={([value]) => updateValue('downPayment', value)}
                min={values.isGovernmentProgram ? 20 : 6}
                max={90}
                step={1}
                className="mt-4"
              />
            </TabsContent>
            <TabsContent value="amount" className="mt-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={values.downPayment || ''}
                  onChange={(e) => updateValue('downPayment', Number(e.target.value))}
                  className="text-lg font-medium"
                  placeholder="0"
                />
                <span className="text-muted-foreground whitespace-nowrap">{t('input.currency')}</span>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('input.loanAmount')}:</span>
              <span className="font-semibold">{formatCurrency(Math.max(0, loanAmount))}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t('input.contribution')}:</span>
              <span className="font-medium">{downPaymentPercent.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Термін кредиту */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            {t('input.loanTerm')}
            <InfoIcon tooltipKey="loanTerm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={values.loanTermYears || ''}
              onChange={(e) => updateValue('loanTermYears', Number(e.target.value))}
              className="text-lg font-medium"
              min={1}
              max={30}
            />
            <span className="text-muted-foreground">{t('input.years')}</span>
          </div>
          <Slider
            value={[values.loanTermYears]}
            onValueChange={([value]) => updateValue('loanTermYears', value)}
            min={1}
            max={30}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 {t('input.year')}</span>
            <span>30 {t('input.years')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Державна програма */}
      <Card className={values.isGovernmentProgram ? 'border-government' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-lg">
              <Flag className="h-5 w-5 text-government mr-2" />
              {t('input.yeoselia')}
              <InfoIcon tooltipKey="governmentProgram" />
            </div>
            <Switch
              checked={values.isGovernmentProgram}
              onCheckedChange={(checked) => {
                updateValue('isGovernmentProgram', checked);
                if (checked && values.downPaymentType === 'percent' && values.downPayment < 20) {
                  updateValue('downPayment', 20);
                }
              }}
            />
          </CardTitle>
        </CardHeader>
        {values.isGovernmentProgram && (
          <CardContent className="space-y-4">
            <div className="p-3 bg-government/10 rounded-lg border border-government/20">
              <p className="text-sm text-foreground/80 mb-3">
                {t('input.selectCategory')}
              </p>
              <RadioGroup
                value={String(values.governmentRate)}
                onValueChange={(v) => updateValue('governmentRate', Number(v) as 3 | 7)}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="3" id="rate-3" className="mt-0.5" />
                  <div>
                    <Label htmlFor="rate-3" className="font-medium cursor-pointer flex items-center gap-2">
                      {t('input.rate3')}
                      <Badge variant="secondary" className="bg-success text-success-foreground">{t('input.privileged')}</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('input.rate3desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="7" id="rate-7" className="mt-0.5" />
                  <div>
                    <Label htmlFor="rate-7" className="font-medium cursor-pointer flex items-center gap-2">
                      {t('input.rate7')}
                      <Badge variant="outline">{t('input.standard')}</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('input.rate7desc')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Процентна ставка (якщо не держпрограма) */}
      {!values.isGovernmentProgram && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Percent className="h-5 w-5 text-primary mr-2" />
              {t('input.annualRate')}
              <InfoIcon tooltipKey="interestRate" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={values.interestRate || ''}
                onChange={(e) => updateValue('interestRate', Number(e.target.value))}
                className="text-lg font-medium"
                step={0.1}
                min={0.1}
                max={50}
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Тип платежу */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            {t('input.paymentType')}
            <InfoIcon tooltipKey="paymentType" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={values.paymentType}
            onValueChange={(v) => updateValue('paymentType', v as 'annuity' | 'classic')}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="annuity" id="annuity" />
              <Label htmlFor="annuity" className="cursor-pointer">
                <div className="font-medium">{t('input.annuity')}</div>
                <p className="text-xs text-muted-foreground">{t('input.equalPayments')}</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="classic" id="classic" />
              <Label htmlFor="classic" className="cursor-pointer">
                <div className="font-medium">{t('input.classic')}</div>
                <p className="text-xs text-muted-foreground">{t('input.decreasingPayments')}</p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Комісії */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Building2 className="h-5 w-5 text-primary mr-2" />
            {t('input.bankCommissions')}
            <InfoIcon tooltipKey="commissions" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">{t('input.oneTimeCommission')}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="number"
                value={values.oneTimeCommission || ''}
                onChange={(e) => updateValue('oneTimeCommission', Number(e.target.value))}
                step={0.1}
                min={0}
                max={10}
                placeholder="0"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">{t('input.monthlyCommission')}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="number"
                value={values.monthlyCommission || ''}
                onChange={(e) => updateValue('monthlyCommission', Number(e.target.value))}
                step={0.01}
                min={0}
                max={2}
                placeholder="0"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}