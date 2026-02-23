import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Receipt, Landmark, Briefcase, Shield, Building, RotateCcw, Sparkles, HelpCircle } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdditionalCostsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
}

function CostTooltip({ tipKey }: { tipKey: string }) {
  const { t } = useLanguage();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors ml-1">
          <HelpCircle className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
        {t(tipKey)}
      </TooltipContent>
    </Tooltip>
  );
}

export function AdditionalCosts({ values, onChange }: AdditionalCostsProps) {
  const { t } = useLanguage();

  const updateValue = <K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) => {
    onChange({ ...values, [key]: value });
  };

  const fillDefaults = () => {
    onChange({
      ...values,
      pensionFundPercent: 1, pensionFundEnabled: true,
      dutyPercent: 1, dutyEnabled: true,
      incomeTaxPercent: 5, incomeTaxEnabled: true,
      militaryTaxPercent: 5, militaryTaxEnabled: true,
      notaryCost: 33000, notaryEnabled: true,
      appraisalCost: 8200, appraisalEnabled: true,
      insurancePercent: 0.25, insuranceEnabled: true,
      agencyCommissionPercent: 0, agencyCommissionEnabled: false,
    });
  };

  const clearAll = () => {
    onChange({
      ...values,
      pensionFundPercent: 0, pensionFundEnabled: false,
      dutyPercent: 0, dutyEnabled: false,
      incomeTaxPercent: 0, incomeTaxEnabled: false,
      militaryTaxPercent: 0, militaryTaxEnabled: false,
      notaryCost: 0, notaryEnabled: false,
      appraisalCost: 0, appraisalEnabled: false,
      insurancePercent: 0, insuranceEnabled: false,
      agencyCommissionPercent: 0, agencyCommissionEnabled: false,
    });
  };

  const isEnabled = (key: keyof MortgageInput) => values[key] !== false;

  const pensionFund = isEnabled('pensionFundEnabled') ? (values.propertyValue * (values.pensionFundPercent ?? 0)) / 100 : 0;
  const duty = isEnabled('dutyEnabled') ? (values.propertyValue * (values.dutyPercent ?? 0)) / 100 : 0;
  const incomeTax = isEnabled('incomeTaxEnabled') ? (values.propertyValue * (values.incomeTaxPercent ?? 0)) / 100 : 0;
  const militaryTax = isEnabled('militaryTaxEnabled') ? (values.propertyValue * (values.militaryTaxPercent ?? 0)) / 100 : 0;
  const notary = isEnabled('notaryEnabled') ? (values.notaryCost ?? 0) : 0;
  const appraisal = isEnabled('appraisalEnabled') ? (values.appraisalCost ?? 0) : 0;
  const insuranceAnnual = isEnabled('insuranceEnabled') ? (values.propertyValue * (values.insurancePercent ?? 0)) / 100 : 0;
  const insuranceTotal = insuranceAnnual * values.loanTermYears;
  const agencyCommission = isEnabled('agencyCommissionEnabled') ? (values.propertyValue * (values.agencyCommissionPercent ?? 0)) / 100 : 0;
  const total = pensionFund + duty + incomeTax + militaryTax + notary + appraisal + insuranceTotal + agencyCommission;

  const costField = (
    label: string,
    tipKey: string,
    enabledKey: keyof MortgageInput,
    valueKey: keyof MortgageInput,
    opts: { step: number; min: number; max?: number; placeholder: string; suffix: string; preview?: number }
  ) => {
    const enabled = isEnabled(enabledKey);
    return (
      <div className={!enabled ? 'opacity-50' : ''}>
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) => updateValue(enabledKey, !!checked as any)}
            className="h-3.5 w-3.5"
          />
          {label}
          <CostTooltip tipKey={tipKey} />
        </Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            value={(values[valueKey] as number) || ''}
            onChange={(e) => updateValue(valueKey, Number(e.target.value) as any)}
            step={opts.step}
            min={opts.min}
            max={opts.max}
            placeholder={opts.placeholder}
            className="h-9"
            disabled={!enabled}
          />
          <span className="text-muted-foreground text-sm">{opts.suffix}</span>
        </div>
        {opts.preview !== undefined && opts.preview > 0 && enabled && (
          <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(opts.preview)}</p>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-lg">
              <Receipt className="h-5 w-5 text-primary mr-2" />
              {t('costs.title')}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fillDefaults} className="text-xs gap-1 h-7">
                <Sparkles className="h-3 w-3" />
                {t('costs.fillDefaults')}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs gap-1 h-7">
                <RotateCcw className="h-3 w-3" />
                {t('costs.clearAll')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Державні збори */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" />
              {t('costs.stateCharges')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {costField(t('costs.pensionFund'), 'costs.pensionFundTip', 'pensionFundEnabled', 'pensionFundPercent', { step: 0.1, min: 0, max: 10, placeholder: '1', suffix: '%', preview: pensionFund })}
              {costField(t('costs.duty'), 'costs.dutyTip', 'dutyEnabled', 'dutyPercent', { step: 0.1, min: 0, max: 10, placeholder: '1', suffix: '%', preview: duty })}
              {costField(t('costs.incomeTax'), 'costs.incomeTaxTip', 'incomeTaxEnabled', 'incomeTaxPercent', { step: 0.1, min: 0, max: 30, placeholder: '5', suffix: '%', preview: incomeTax })}
              {costField(t('costs.militaryTax'), 'costs.militaryTaxTip', 'militaryTaxEnabled', 'militaryTaxPercent', { step: 0.1, min: 0, max: 10, placeholder: '5', suffix: '%', preview: militaryTax })}
            </div>
          </div>

          {/* Послуги */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              {t('costs.services')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {costField(t('costs.notary'), 'costs.notaryTip', 'notaryEnabled', 'notaryCost', { step: 1000, min: 0, placeholder: '33000', suffix: 'грн' })}
              {costField(t('costs.appraisal'), 'costs.appraisalTip', 'appraisalEnabled', 'appraisalCost', { step: 500, min: 0, placeholder: '8200', suffix: 'грн' })}
            </div>
          </div>

          {/* Страхування та агенція */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              {t('costs.bankInsurance')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className={!isEnabled('insuranceEnabled') ? 'opacity-50' : ''}>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Checkbox
                    checked={isEnabled('insuranceEnabled')}
                    onCheckedChange={(checked) => updateValue('insuranceEnabled', !!checked as any)}
                    className="h-3.5 w-3.5"
                  />
                  {t('costs.insurance')}
                  <CostTooltip tipKey="costs.insuranceTip" />
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={values.insurancePercent || ''}
                    onChange={(e) => updateValue('insurancePercent', Number(e.target.value))}
                    step={0.05}
                    min={0}
                    max={5}
                    placeholder="0.25"
                    className="h-9"
                    disabled={!isEnabled('insuranceEnabled')}
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
                {insuranceAnnual > 0 && isEnabled('insuranceEnabled') && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(insuranceAnnual)}{t('costs.perYear')} · {formatCurrency(insuranceTotal)} {t('costs.insuranceTotal').toLowerCase()}
                  </p>
                )}
              </div>
              <div className={!isEnabled('agencyCommissionEnabled') ? 'opacity-50' : ''}>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Checkbox
                    checked={isEnabled('agencyCommissionEnabled')}
                    onCheckedChange={(checked) => updateValue('agencyCommissionEnabled', !!checked as any)}
                    className="h-3.5 w-3.5"
                  />
                  <Building className="h-3 w-3" />
                  {t('costs.agencyCommission')}
                  <CostTooltip tipKey="costs.agencyTip" />
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={values.agencyCommissionPercent || ''}
                    onChange={(e) => updateValue('agencyCommissionPercent', Number(e.target.value))}
                    step={0.5}
                    min={0}
                    max={10}
                    placeholder="0"
                    className="h-9"
                    disabled={!isEnabled('agencyCommissionEnabled')}
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
                {agencyCommission > 0 && isEnabled('agencyCommissionEnabled') && (
                  <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(agencyCommission)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Підсумок */}
          {total > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('costs.totalAdditional')}:</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
