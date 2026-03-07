import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Percent, Calendar, Building2, Flag, HelpCircle, Users, AlertTriangle, Info, DollarSign, Euro } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { calculateDownPaymentAmount, formatCurrency, checkYeoselyaEligibility, getYeoselyaAreaLimits } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { CurrencyAmount } from "./CurrencyAmount";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AdditionalCosts } from "./AdditionalCosts";

interface CalculatorInputsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
}

export function CalculatorInputs({ values, onChange }: CalculatorInputsProps) {
  const { t, language } = useLanguage();
  const { usd: usdRate, eur: eurRate, rateSource } = useCurrencyRates();
  const [propertyUsd, setPropertyUsd] = useState<number | ''>('');
  const [propertyEur, setPropertyEur] = useState<number | ''>('');
  
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

  // Перевірка умов ЄОселя
  const eligibility = checkYeoselyaEligibility(values);

  // Ліміти площі для підказки
  const familySize = values.familySize ?? 1;
  const propertyType = values.propertyType ?? 'apartment';
  const propertyAge = values.propertyAge ?? 'secondary';
  const areaLimits = values.isGovernmentProgram
    ? getYeoselyaAreaLimits(familySize, propertyType, propertyAge)
    : null;

  // Tooltips content
  const tooltips = {
    propertyValue: {
      title: language === 'uk' ? 'Вартість нерухомості' : 'Property Value',
      description: language === 'uk'
        ? 'Повна ринкова вартість квартири або будинку. Для ЄОселя вартість 1 м² та загальна вартість не можуть перевищувати нормативи Мінрозвитку × 2,0. Якщо вартість перевищує ліміт — різниця оплачується як збільшений перший внесок.'
        : 'Full market value of the apartment or house. For YeOselya, the cost per m² and total value cannot exceed the Ministry of Development norms × 2.0.'
    },
    downPayment: {
      title: language === 'uk' ? 'Перший внесок' : 'Down Payment',
      description: language === 'uk'
        ? 'Сума власних коштів при оформленні кредиту. За ЄОселя мінімум 20% (або 10% для молоді до 25 років). Якщо площа або вартість житла перевищує норму — різниця покривається за рахунок збільшення першого внеску.'
        : 'Amount of own funds when applying. YeOselya minimum: 20% (10% for youth under 25). If area or cost exceeds limits — the difference is covered by increasing the down payment.'
    },
    loanTerm: {
      title: language === 'uk' ? 'Термін кредитування' : 'Loan Term',
      description: language === 'uk'
        ? 'Максимальний термін за ЄОселя — 20 років. Ставка прогресивна: перші 10 років — 3% або 7%, з 11-го по 20-й рік — 6% або 10%. Позичальник не може бути старшим за 70 років на момент погашення кредиту.'
        : 'Maximum term under YeOselya — 20 years. Rate is progressive: first 10 years — 3% or 7%, years 11-20 — 6% or 10%.'
    },
    governmentProgram: {
      title: language === 'uk' ? 'Програма ЄОселя' : 'YeOselya Program',
      description: language === 'uk'
        ? 'Державна програма пільгового іпотечного кредитування. Ставки: 3%(→6%) для військових, педагогів, медиків, науковців; 7%(→10%) для ветеранів, ВПО, інших громадян без власного житла. Вимоги щодо площі: квартира — до 52,5 м² (1-2 особи) + 21 м² на кожного наступного, max 115,5 м²; будинок — до 62,5 м², max 125,5 м².'
        : 'Government preferential mortgage program. Rates: 3%(→6%) for military, teachers, medics, scientists; 7%(→10%) for veterans, IDPs, others without housing. Area limits: apartment — up to 52.5 m² (1-2 persons) + 21 m² per extra, max 115.5 m²; house — up to 62.5 m², max 125.5 m².'
    },
    interestRate: {
      title: language === 'uk' ? 'Процентна ставка' : 'Interest Rate',
      description: language === 'uk'
        ? 'Річна процентна ставка за кредитом. Комерційні ставки в Україні зазвичай 15-25% річних. За ЄОселя: 3% або 7% перші 10 років, потім 6% або 10%.'
        : 'Annual interest rate on the loan. Commercial rates in Ukraine are usually 15-25%. YeOselya: 3% or 7% for first 10 years, then 6% or 10%.'
    },
    paymentType: {
      title: language === 'uk' ? 'Тип платежу' : 'Payment Type',
      description: language === 'uk'
        ? 'Ануїтетний — однакова сума щомісяця. Класичний — платіж спадає (спочатку більший, потім менший). За ЄОселя платіж перераховується після 10 років.'
        : 'Annuity — same amount monthly. Classic — decreasing payments. For YeOselya the payment is recalculated after 10 years.'
    },
    commissions: {
      title: language === 'uk' ? 'Банківські комісії' : 'Bank Commissions',
      description: language === 'uk'
        ? 'Одноразова комісія (зазвичай 1%) — сплачується при видачі кредиту. Щомісячна комісія — стягується щомісяця. Також типові витрати за ЄОселя: пенсійне страхування (1% від вартості), страхування майна (щорічно), оцінка (~5 000 грн), нотаріус (~20 000 грн).'
        : 'One-time commission (~1%) paid at loan issuance. Monthly commission charged each month. Typical YeOselya costs: pension insurance (1%), property insurance (annual), appraisal (~5,000 UAH), notary (~20,000 UAH).'
    },
    familySize: {
      title: language === 'uk' ? 'Склад сім\'ї' : 'Family Size',
      description: language === 'uk'
        ? 'Враховуються: подружжя та неповнолітні діти, що проживають разом. Від складу сім\'ї залежить максимально допустима площа житла: 52,5 м² для 1-2 осіб, +21 м² на кожного наступного члена (але не більше 115,5 м² для квартир).'
        : 'Includes: spouse and minor children living together. Family size determines max allowed area: 52.5 m² for 1-2 persons, +21 m² per additional member (max 115.5 m² for apartments).'
    },
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
              onChange={(e) => {
                const val = Number(e.target.value);
                updateValue('propertyValue', val);
                setPropertyUsd('');
                setPropertyEur('');
              }}
              className="text-lg font-medium"
              placeholder="0"
            />
            <span className="text-muted-foreground whitespace-nowrap">{t('input.currency')}</span>
          </div>
          
          {/* USD input */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="number"
              value={propertyUsd}
              onChange={(e) => {
                const usd = Number(e.target.value);
                setPropertyUsd(usd || '');
                setPropertyEur('');
                if (usd > 0) {
                  updateValue('propertyValue', Math.round(usd * usdRate));
                }
              }}
              className="h-9"
              placeholder={t('input.propertyValueUsd')}
            />
            <span className="text-muted-foreground text-sm whitespace-nowrap">$</span>
          </div>
          
          {/* EUR input */}
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="number"
              value={propertyEur}
              onChange={(e) => {
                const eur = Number(e.target.value);
                setPropertyEur(eur || '');
                setPropertyUsd('');
                if (eur > 0) {
                  updateValue('propertyValue', Math.round(eur * eurRate));
                }
              }}
              className="h-9"
              placeholder={t('input.propertyValueEur')}
            />
            <span className="text-muted-foreground text-sm whitespace-nowrap">€</span>
          </div>
          
          <p className="text-[10px] text-muted-foreground -mt-2">
            {t('input.propertyValueCurrencyHint', { 
              source: rateSource === 'nbu' ? 'НБУ' : 'Універсалбанк', 
              usdRate: usdRate.toFixed(2),
              eurRate: eurRate.toFixed(2)
            })}
          </p>
          {values.propertyValue > 0 && (
            <div className="text-xs text-muted-foreground">
              <CurrencyAmount amount={values.propertyValue} usdRate={usdRate} eurRate={eurRate} showMain={false} size="sm" />
            </div>
          )}
          
          <Slider
            value={[values.propertyValue]}
            onValueChange={([value]) => {
              updateValue('propertyValue', value);
              setPropertyUsd('');
              setPropertyEur('');
            }}
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
                  min={values.isGovernmentProgram ? (values.isYouth ? 10 : (values.propertyAge === 'new' ? 30 : 20)) : 6}
                  max={90}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <Slider
                value={[values.downPayment]}
                onValueChange={([value]) => updateValue('downPayment', value)}
                min={values.isGovernmentProgram ? (values.isYouth ? 10 : (values.propertyAge === 'new' ? 30 : 20)) : 6}
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
          
          <div className="p-3 bg-muted/30 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{language === 'uk' ? 'Перший внесок' : 'Down payment'}:</span>
              <span className="font-semibold text-primary">{formatCurrency(calculateDownPaymentAmount(values.propertyValue, values.downPayment, values.downPaymentType))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('input.loanAmount')}:</span>
              <span className="font-semibold">{formatCurrency(Math.max(0, loanAmount))}</span>
            </div>
            <div className="flex justify-between text-sm">
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
                if (checked) {
                  const isNewBuild = values.propertyAge === 'new';
                  const minDP = values.isYouth ? 10 : (isNewBuild ? 30 : 20);
                  if (values.downPaymentType === 'percent' && values.downPayment < minDP) {
                    updateValue('downPayment', minDP);
                  }
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
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {t('input.rate3progression')}
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
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {t('input.rate7progression')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Тип нерухомості */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                {t('input.propertyType')}
                <InfoIcon tooltipKey="governmentProgram" />
              </Label>
              <RadioGroup
                value={values.propertyType ?? 'apartment'}
                onValueChange={(v) => updateValue('propertyType', v as 'apartment' | 'house')}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="apartment" id="type-apartment" />
                  <Label htmlFor="type-apartment" className="cursor-pointer">
                    <div className="font-medium text-sm">{t('input.apartment')}</div>
                    <p className="text-xs text-muted-foreground">{t('input.apartmentLimit')}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="house" id="type-house" />
                  <Label htmlFor="type-house" className="cursor-pointer">
                    <div className="font-medium text-sm">{t('input.house')}</div>
                    <p className="text-xs text-muted-foreground">{t('input.houseLimit')}</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Вік нерухомості */}
            <div>
              <Label className="text-sm font-medium">{t('input.propertyAge')}</Label>
              <RadioGroup
                value={values.propertyAge ?? 'secondary'}
                onValueChange={(v) => updateValue('propertyAge', v as 'new' | 'secondary')}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="new" id="age-new" />
                  <Label htmlFor="age-new" className="cursor-pointer">
                    <div className="font-medium text-sm">{t('input.propertyNew')}</div>
                    <p className="text-xs text-muted-foreground">{t('input.propertyNewDesc')}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="secondary" id="age-secondary" />
                  <Label htmlFor="age-secondary" className="cursor-pointer">
                    <div className="font-medium text-sm">{t('input.propertySecondary')}</div>
                    <p className="text-xs text-muted-foreground">{t('input.propertySecondaryDesc')}</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Склад сім'ї */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {t('input.familySize')}
                <InfoIcon tooltipKey="familySize" />
              </Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  value={values.familySize ?? 1}
                  onChange={(e) => updateValue('familySize', Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-20"
                  min={1}
                  max={10}
                />
                <span className="text-sm text-muted-foreground">{t('input.persons')}</span>
                {areaLimits && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    max {areaLimits.maxArea.toFixed(1)} м²
                  </Badge>
                )}
              </div>
              {areaLimits && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('input.areaLimitInfo', {
                    base: String(areaLimits.baseMaxArea.toFixed(1)),
                    max: String(areaLimits.maxArea.toFixed(1)),
                    overage: String(areaLimits.allowedOverpercent)
                  })}
                </p>
              )}
            </div>

            {/* Молодь (до 25 років) */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
              <div>
                <Label className="font-medium text-sm">{t('input.isYouth')}</Label>
                <p className="text-xs text-muted-foreground">{t('input.isYouthDesc')}</p>
              </div>
              <Switch
                checked={values.isYouth ?? false}
                onCheckedChange={(checked) => {
                  updateValue('isYouth', checked);
                  if (checked && downPaymentPercent < 10) {
                    updateValue('downPayment', 10);
                  }
                }}
              />
            </div>

            {/* Блок попереджень / умов */}
            {eligibility.warnings.length > 0 && (
              <div className="space-y-2">
                {eligibility.warnings.map((warning, i) => (
                  <Alert key={i} className="py-2 border-destructive/30 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-xs text-destructive/90 ml-1">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Інформаційний блок */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Info className="h-3.5 w-3.5" />
                {t('input.yeoselyaUpdated')}
              </div>
              <p className="text-xs text-muted-foreground">{t('input.yeoselyaNote1')}</p>
              <p className="text-xs text-muted-foreground">{t('input.yeoselyaNote2')}</p>
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

      {/* Додаткові витрати */}
      <AdditionalCosts values={values} onChange={onChange} />
    </div>
  );
}