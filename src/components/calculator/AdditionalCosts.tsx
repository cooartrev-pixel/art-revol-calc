import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Landmark, Briefcase, Shield, Building, RotateCcw, Sparkles } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";

interface AdditionalCostsProps {
  values: MortgageInput;
  onChange: (values: MortgageInput) => void;
}

export function AdditionalCosts({ values, onChange }: AdditionalCostsProps) {
  const { t } = useLanguage();

  const updateValue = <K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) => {
    onChange({ ...values, [key]: value });
  };

  const fillDefaults = () => {
    onChange({
      ...values,
      pensionFundPercent: 1,
      dutyPercent: 1,
      incomeTaxPercent: 5,
      militaryTaxPercent: 5,
      notaryCost: 33000,
      appraisalCost: 8200,
      insurancePercent: 0.25,
      agencyCommissionPercent: 0,
    });
  };

  const clearAll = () => {
    onChange({
      ...values,
      pensionFundPercent: 0,
      dutyPercent: 0,
      incomeTaxPercent: 0,
      militaryTaxPercent: 0,
      notaryCost: 0,
      appraisalCost: 0,
      insurancePercent: 0,
      agencyCommissionPercent: 0,
    });
  };

  // Quick calculation for preview
  const pensionFund = (values.propertyValue * (values.pensionFundPercent ?? 0)) / 100;
  const duty = (values.propertyValue * (values.dutyPercent ?? 0)) / 100;
  const incomeTax = (values.propertyValue * (values.incomeTaxPercent ?? 0)) / 100;
  const militaryTax = (values.propertyValue * (values.militaryTaxPercent ?? 0)) / 100;
  const notary = values.notaryCost ?? 0;
  const appraisal = values.appraisalCost ?? 0;
  const insuranceAnnual = (values.propertyValue * (values.insurancePercent ?? 0)) / 100;
  const insuranceTotal = insuranceAnnual * values.loanTermYears;
  const agencyCommission = (values.propertyValue * (values.agencyCommissionPercent ?? 0)) / 100;
  const total = pensionFund + duty + incomeTax + militaryTax + notary + appraisal + insuranceTotal + agencyCommission;

  return (
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
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.pensionFund')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.pensionFundPercent || ''}
                  onChange={(e) => updateValue('pensionFundPercent', Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={10}
                  placeholder="1"
                  className="h-9"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {pensionFund > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(pensionFund)}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.duty')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.dutyPercent || ''}
                  onChange={(e) => updateValue('dutyPercent', Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={10}
                  placeholder="1"
                  className="h-9"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {duty > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(duty)}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.incomeTax')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.incomeTaxPercent || ''}
                  onChange={(e) => updateValue('incomeTaxPercent', Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={30}
                  placeholder="5"
                  className="h-9"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {incomeTax > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(incomeTax)}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.militaryTax')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.militaryTaxPercent || ''}
                  onChange={(e) => updateValue('militaryTaxPercent', Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={10}
                  placeholder="5"
                  className="h-9"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {militaryTax > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(militaryTax)}</p>}
            </div>
          </div>
        </div>

        {/* Послуги */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            {t('costs.services')}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.notary')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.notaryCost || ''}
                  onChange={(e) => updateValue('notaryCost', Number(e.target.value))}
                  step={1000}
                  min={0}
                  placeholder="33000"
                  className="h-9"
                />
                <span className="text-muted-foreground text-xs whitespace-nowrap">грн</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.appraisal')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={values.appraisalCost || ''}
                  onChange={(e) => updateValue('appraisalCost', Number(e.target.value))}
                  step={500}
                  min={0}
                  placeholder="8200"
                  className="h-9"
                />
                <span className="text-muted-foreground text-xs whitespace-nowrap">грн</span>
              </div>
            </div>
          </div>
        </div>

        {/* Страхування та агенція */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            {t('costs.bankInsurance')}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t('costs.insurance')}</Label>
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
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {insuranceAnnual > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(insuranceAnnual)}{t('costs.perYear')} · {formatCurrency(insuranceTotal)} {t('costs.insuranceTotal').toLowerCase()}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                {t('costs.agencyCommission')}
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
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
              {agencyCommission > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(agencyCommission)}</p>}
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
  );
}
