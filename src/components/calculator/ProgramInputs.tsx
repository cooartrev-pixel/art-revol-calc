import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Percent, Calendar, Building2, HelpCircle } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { calculateDownPaymentAmount, formatCurrency } from "@/lib/mortgage-calculations";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { CurrencyAmount } from "./CurrencyAmount";
import type { GovernmentProgram } from "@/lib/programs-data";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ProgramInputsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
  program: GovernmentProgram;
}

export function ProgramInputs({ values, onChange, program }: ProgramInputsProps) {
  const { usd: usdRate, eur: eurRate } = useCurrencyRates();
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

  const isSubsidyProgram = program.rates.standard === 0;
  const hasPrivilegedRate = program.rates.privileged !== undefined;

  // Max values based on program
  const maxPropertyValue = program.requirements.maxPropertyValue || 10000000;
  const maxLoanAmount = program.requirements.maxLoanAmount || 5000000;

  // Tooltips content
  const tooltips = {
    propertyValue: {
      title: 'Вартість нерухомості',
      description: `Повна ринкова вартість квартири, будинку або іншої нерухомості, яку ви плануєте придбати. Для програми "${program.name}" існують обмеження: максимальна вартість — ${formatCurrency(maxPropertyValue)}, максимальна сума кредиту — ${formatCurrency(maxLoanAmount)}. Вартість визначається на основі оцінки незалежного експерта.`
    },
    downPayment: {
      title: 'Перший внесок',
      description: `Сума власних коштів, яку ви сплачуєте одразу при оформленні кредиту. Для програми "${program.name}" мінімальний внесок — ${program.requirements.minDownPayment}%, максимальний — ${program.requirements.maxDownPayment}%. Чим більший перший внесок — тим менша сума кредиту та щомісячний платіж.`
    },
    loanTerm: {
      title: 'Термін кредитування',
      description: `Період часу, протягом якого ви будете погашати кредит. Для програми "${program.name}" термін від ${program.requirements.minTerm} до ${program.requirements.maxTerm} років. Довший термін = менший щомісячний платіж, але більша загальна переплата.`
    },
    rateCategory: {
      title: 'Категорія ставки',
      description: hasPrivilegedRate 
        ? `Програма "${program.name}" пропонує пільгову ставку ${program.rates.privileged}% для пріоритетних категорій (військовослужбовці, педагоги, медики, науковці) та стандартну ставку ${program.rates.standard}% для інших категорій.`
        : `Програма "${program.name}" пропонує єдину ставку ${program.rates.standard}% річних.`
    },
    paymentType: {
      title: 'Тип платежу',
      description: 'Ануїтетний платіж — однакова сума щомісяця весь термін. Зручний для планування бюджету, але загальна переплата більша. Класичний (диференційований) — спочатку платіж більший, потім зменшується. Переплата менша, але перші роки навантаження на бюджет вище.'
    },
    commissions: {
      title: 'Банківські комісії',
      description: 'Додаткові платежі банку за обслуговування кредиту. Одноразова комісія (1-2%) — сплачується при видачі кредиту. Щомісячна комісія (0.01-0.1%) — стягується з залишку боргу кожного місяця. Комісії суттєво впливають на ефективну ставку!'
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
      {/* Property Value */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-primary" />
            Вартість об'єкта
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
              max={maxPropertyValue}
            />
            <span className="text-muted-foreground whitespace-nowrap">грн</span>
          </div>
          {values.propertyValue > 0 && (
            <div className="text-xs text-muted-foreground">
              <CurrencyAmount amount={values.propertyValue} usdRate={usdRate} eurRate={eurRate} showMain={false} size="md" />
            </div>
          )}
          <Slider
            value={[values.propertyValue]}
            onValueChange={([value]) => updateValue('propertyValue', value)}
            min={100000}
            max={maxPropertyValue}
            step={50000}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>100 тис</span>
            <span>{(maxPropertyValue / 1000000).toFixed(1)} млн</span>
          </div>
          {program.requirements.maxPropertyValue && (
            <p className="text-xs text-muted-foreground">
              Максимум за програмою: {formatCurrency(program.requirements.maxPropertyValue)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Down Payment - only show if program requires it */}
      {program.requirements.minDownPayment > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-primary" />
              Перший внесок
              <InfoIcon tooltipKey="downPayment" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs 
              value={values.downPaymentType} 
              onValueChange={(v) => updateValue('downPaymentType', v as 'amount' | 'percent')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="percent">Відсоток</TabsTrigger>
                <TabsTrigger value="amount">Сума</TabsTrigger>
              </TabsList>
              <TabsContent value="percent" className="mt-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={values.downPayment || ''}
                    onChange={(e) => updateValue('downPayment', Number(e.target.value))}
                    className="text-lg font-medium"
                    placeholder="0"
                    min={program.requirements.minDownPayment}
                    max={program.requirements.maxDownPayment}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <Slider
                  value={[values.downPayment]}
                  onValueChange={([value]) => updateValue('downPayment', value)}
                  min={program.requirements.minDownPayment}
                  max={program.requirements.maxDownPayment}
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
                  <span className="text-muted-foreground whitespace-nowrap">грн</span>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Перший внесок:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(calculateDownPaymentAmount(values.propertyValue, values.downPayment, values.downPaymentType))}
                  <CurrencyAmount amount={calculateDownPaymentAmount(values.propertyValue, values.downPayment, values.downPaymentType)} usdRate={usdRate} eurRate={eurRate} showMain={false} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сума кредиту:</span>
                <span className="font-semibold">
                  {formatCurrency(Math.max(0, loanAmount))}
                  <CurrencyAmount amount={Math.max(0, loanAmount)} usdRate={usdRate} eurRate={eurRate} showMain={false} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Внесок:</span>
                <span className="font-medium">{downPaymentPercent.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Term - only for credit programs */}
      {!isSubsidyProgram && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Термін кредиту
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
                min={program.requirements.minTerm}
                max={program.requirements.maxTerm}
              />
              <span className="text-muted-foreground">років</span>
            </div>
            <Slider
              value={[values.loanTermYears]}
              onValueChange={([value]) => updateValue('loanTermYears', value)}
              min={program.requirements.minTerm}
              max={program.requirements.maxTerm}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{program.requirements.minTerm} р.</span>
              <span>{program.requirements.maxTerm} років</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Selection - for programs with multiple rates */}
      {hasPrivilegedRate && !isSubsidyProgram && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-primary" />
              Категорія ставки
              <InfoIcon tooltipKey="rateCategory" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <RadioGroup
                value={String(values.governmentRate)}
                onValueChange={(v) => updateValue('governmentRate', Number(v) as 3 | 7)}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={String(program.rates.privileged)} id="rate-priv" className="mt-0.5" />
                  <div>
                    <Label htmlFor="rate-priv" className="font-medium cursor-pointer flex items-center gap-2">
                      {program.rates.privileged}% річних
                      <Badge variant="secondary" className="bg-success text-success-foreground">Пільгова</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Для пріоритетних категорій
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={String(program.rates.standard)} id="rate-std" className="mt-0.5" />
                  <div>
                    <Label htmlFor="rate-std" className="font-medium cursor-pointer flex items-center gap-2">
                      {program.rates.standard}% річних
                      <Badge variant="outline">Стандартна</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Для інших категорій
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Type - for credit programs */}
      {!isSubsidyProgram && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              Тип платежу
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
                  <div className="font-medium">Ануїтетний</div>
                  <p className="text-xs text-muted-foreground">Рівні платежі</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="classic" id="classic" />
                <Label htmlFor="classic" className="cursor-pointer">
                  <div className="font-medium">Класичний</div>
                  <p className="text-xs text-muted-foreground">Спадні платежі</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Bank Commissions - for credit programs */}
      {!isSubsidyProgram && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Комісії банку
              <InfoIcon tooltipKey="commissions" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Одноразова комісія</Label>
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
              <Label className="text-sm text-muted-foreground">Щомісячна комісія</Label>
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
      )}
    </div>
  );
}
