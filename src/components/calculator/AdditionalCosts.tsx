import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Receipt, Landmark, Briefcase, Shield, Building, RotateCcw, Sparkles, HelpCircle, DollarSign, RefreshCw } from "lucide-react";
import type { MortgageInput } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { CurrencyAmount } from "./CurrencyAmount";
import { toast } from "@/hooks/use-toast";
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

const DEFAULT_USD_RATE = 41.5;

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

function CurrencyToggle({ currency, onToggle }: { currency: 'UAH' | 'USD'; onToggle: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="h-7 px-2 text-xs gap-1 shrink-0"
    >
      <DollarSign className="h-3 w-3" />
      {currency}
    </Button>
  );
}

export function AdditionalCosts({ values, onChange }: AdditionalCostsProps) {
  const { t } = useLanguage();
  const { usd: sharedUsdRate, eur: eurRate, date: lastSyncDate, syncing, fetchRates } = useCurrencyRates();
  const [usdRate, setUsdRate] = useState(sharedUsdRate);
  const [notaryCurrency, setNotaryCurrency] = useState<'UAH' | 'USD'>('USD');
  const [appraisalCurrency, setAppraisalCurrency] = useState<'UAH' | 'USD'>('USD');
  const [notaryUsd, setNotaryUsd] = useState(800);
  const [appraisalUsd, setAppraisalUsd] = useState(200);

  const updateValue = <K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) => {
    onChange({ ...values, [key]: value });
  };

  // Sync local rate when shared rate updates
  useEffect(() => {
    setUsdRate(sharedUsdRate);
    const updates: Partial<MortgageInput> = {};
    if (notaryCurrency === 'USD') updates.notaryCost = Math.round(notaryUsd * sharedUsdRate);
    if (appraisalCurrency === 'USD') updates.appraisalCost = Math.round(appraisalUsd * sharedUsdRate);
    if (Object.keys(updates).length > 0) {
      onChange({ ...values, ...updates });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedUsdRate]);

  const handleNotaryUsdChange = useCallback((usd: number) => {
    setNotaryUsd(usd);
    onChange({ ...values, notaryCost: Math.round(usd * usdRate) });
  }, [values, onChange, usdRate]);

  const handleAppraisalUsdChange = useCallback((usd: number) => {
    setAppraisalUsd(usd);
    onChange({ ...values, appraisalCost: Math.round(usd * usdRate) });
  }, [values, onChange, usdRate]);

  const handleRateChange = useCallback((rate: number) => {
    setUsdRate(rate);
    const updates: Partial<MortgageInput> = {};
    if (notaryCurrency === 'USD') updates.notaryCost = Math.round(notaryUsd * rate);
    if (appraisalCurrency === 'USD') updates.appraisalCost = Math.round(appraisalUsd * rate);
    if (Object.keys(updates).length > 0) {
      onChange({ ...values, ...updates });
    }
  }, [values, onChange, notaryCurrency, appraisalCurrency, notaryUsd, appraisalUsd]);

  const toggleNotaryCurrency = () => {
    if (notaryCurrency === 'UAH') {
      setNotaryCurrency('USD');
      const usd = Math.round((values.notaryCost ?? 0) / usdRate);
      setNotaryUsd(usd);
    } else {
      setNotaryCurrency('UAH');
    }
  };

  const toggleAppraisalCurrency = () => {
    if (appraisalCurrency === 'UAH') {
      setAppraisalCurrency('USD');
      const usd = Math.round((values.appraisalCost ?? 0) / usdRate);
      setAppraisalUsd(usd);
    } else {
      setAppraisalCurrency('UAH');
    }
  };

  const fillDefaults = () => {
    setNotaryCurrency('USD');
    setAppraisalCurrency('USD');
    setNotaryUsd(800);
    setAppraisalUsd(200);
    onChange({
      ...values,
      pensionFundPercent: 1, pensionFundEnabled: !values.isFirstTimeBuyer,
      dutyPercent: 1, dutyEnabled: true,
      incomeTaxPercent: 5, incomeTaxEnabled: true,
      militaryTaxPercent: 5, militaryTaxEnabled: true,
      notaryCost: Math.round(800 * usdRate), notaryEnabled: true,
      appraisalCost: Math.round(200 * usdRate), appraisalEnabled: true,
      insurancePercent: values.warRiskInsurance ? 1.25 : 0.25, insuranceEnabled: true,
      agencyCommissionPercent: 5, agencyCommissionEnabled: true,
    });
  };

  const clearAll = () => {
    setNotaryUsd(0);
    setAppraisalUsd(0);
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
      isFirstTimeBuyer: false,
      warRiskInsurance: false,
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

  const currencyCostField = (
    label: string,
    tipKey: string,
    enabledKey: keyof MortgageInput,
    uahKey: keyof MortgageInput,
    currency: 'UAH' | 'USD',
    usdValue: number,
    onUsdChange: (v: number) => void,
    onToggle: () => void,
    opts: { placeholderUsd: string; placeholderUah: string }
  ) => {
    const enabled = isEnabled(enabledKey);
    const isUsd = currency === 'USD';
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
        <div className="flex items-center gap-1.5 mt-1">
          <Input
            type="number"
            value={isUsd ? (usdValue || '') : ((values[uahKey] as number) || '')}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (isUsd) {
                onUsdChange(v);
              } else {
                updateValue(uahKey, v as any);
              }
            }}
            step={isUsd ? 50 : 1000}
            min={0}
            placeholder={isUsd ? opts.placeholderUsd : opts.placeholderUah}
            className="h-9"
            disabled={!enabled}
          />
          <CurrencyToggle currency={currency} onToggle={onToggle} />
        </div>
        {enabled && (values[uahKey] as number) > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {isUsd && <span>{formatCurrency(values[uahKey] as number)} · </span>}
            {!isUsd && usdValue > 0 && <span>~${usdValue} · </span>}
            {formatCurrency(values[uahKey] as number)}
          </p>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
          {/* Курс НБУ */}
          <div className="p-2 bg-muted/30 rounded-lg border space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('costs.nbuRate')}:</Label>
              <Input
                type="number"
                value={usdRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                step={0.01}
                min={1}
                className="h-7 w-24 text-sm"
              />
              <span className="text-xs text-muted-foreground">₴/$</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchRates(false)}
                disabled={syncing}
                className="h-7 px-2 text-xs gap-1 shrink-0 ml-auto"
              >
                <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                {t('costs.syncRates')}
              </Button>
            </div>
            {lastSyncDate && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {t('costs.lastSync')}: {lastSyncDate} · {t('costs.autoSync')}
              </p>
            )}
          </div>

          {/* Toggle: Перший покупець */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
            <div>
              <Label className="font-medium text-sm">🏠 Перший покупець</Label>
              <p className="text-xs text-muted-foreground">Пенсійний фонд = 0% для першого придбання</p>
            </div>
            <Switch
              checked={values.isFirstTimeBuyer ?? false}
              onCheckedChange={(checked) => {
                onChange({
                  ...values,
                  isFirstTimeBuyer: checked,
                  pensionFundEnabled: !checked,
                  pensionFundPercent: checked ? 0 : (values.pensionFundPercent || 1),
                });
              }}
            />
          </div>

          {/* Державні збори */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" />
              {t('costs.stateCharges')}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={values.isFirstTimeBuyer ? 'opacity-40 pointer-events-none' : ''}>
                {costField(t('costs.pensionFund'), 'costs.pensionFundTip', 'pensionFundEnabled', 'pensionFundPercent', { step: 0.1, min: 0, max: 10, placeholder: '1', suffix: '%', preview: pensionFund })}
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currencyCostField(
                t('costs.notary'), 'costs.notaryTip', 'notaryEnabled', 'notaryCost',
                notaryCurrency, notaryUsd, handleNotaryUsdChange, toggleNotaryCurrency,
                { placeholderUsd: '800', placeholderUah: '33000' }
              )}
              {currencyCostField(
                t('costs.appraisal'), 'costs.appraisalTip', 'appraisalEnabled', 'appraisalCost',
                appraisalCurrency, appraisalUsd, handleAppraisalUsdChange, toggleAppraisalCurrency,
                { placeholderUsd: '200', placeholderUah: '8200' }
              )}
            </div>
          </div>

          {/* Страхування та агенція */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              {t('costs.bankInsurance')}
            </Label>

            {/* Toggle: Воєнні ризики */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <Label className="font-medium text-sm">⚠️ Воєнні ризики</Label>
                <p className="text-xs text-muted-foreground">Страхування зростає з 0.25% до 1.25%</p>
              </div>
              <Switch
                checked={values.warRiskInsurance ?? false}
                onCheckedChange={(checked) => {
                  onChange({
                    ...values,
                    warRiskInsurance: checked,
                    insurancePercent: checked ? 1.25 : 0.25,
                  });
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={!isEnabled('insuranceEnabled') ? 'opacity-50' : ''}>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Checkbox
                    checked={isEnabled('insuranceEnabled')}
                    onCheckedChange={(checked) => updateValue('insuranceEnabled', !!checked as any)}
                    className="h-3.5 w-3.5"
                  />
                  {t('costs.insurance')}
                  {values.warRiskInsurance && <Badge variant="destructive" className="text-[10px] px-1 py-0 ml-1">war</Badge>}
                  <CostTooltip tipKey="costs.insuranceTip" />
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={values.insurancePercent || ''}
                    onChange={(e) => updateValue('insurancePercent', Number(e.target.value))}
                    step={0.05}
                    min={0}
                    max={2}
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
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">{t('costs.totalAdditional')}:</span>
                <CurrencyAmount amount={total} usdRate={usdRate} eurRate={eurRate} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
