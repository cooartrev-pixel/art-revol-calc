import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Percent, Calendar, Building2, Flag } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { calculateDownPaymentAmount, formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";

interface CalculatorInputsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
}

export function CalculatorInputs({ values, onChange }: CalculatorInputsProps) {
  const { t } = useLanguage();
  
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

  return (
    <div className="space-y-6">
      {/* Вартість об'єкта */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-primary" />
            {t('input.propertyValue')}
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="h-5 w-5 text-primary" />
            {t('input.downPayment')}
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {t('input.loanTerm')}
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
            <div className="flex items-center gap-2 text-lg">
              <Flag className="h-5 w-5 text-government" />
              {t('input.yeoselia')}
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-primary" />
              {t('input.annualRate')}
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
          <CardTitle className="text-lg">{t('input.paymentType')}</CardTitle>
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {t('input.bankCommissions')}
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