import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator, Percent, FileDown, HelpCircle, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { MortgageResult, MortgageInput, AmortizationRow } from "@/lib/mortgage-calculations";
import { formatCurrency, formatPercent, calculateDownPaymentAmount } from "@/lib/mortgage-calculations";
import type { PDFExportOptions } from "@/lib/pdf-export";
import { useLanguage } from "@/lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { CurrencyAmount } from "./CurrencyAmount";
import { PDFExportDialog } from "./PDFExportDialog";

interface ResultsDisplayProps {
  result: MortgageResult;
  isGovernmentProgram: boolean;
  input: MortgageInput;
  schedule: AmortizationRow[];
  chartsContainerRef?: React.RefObject<HTMLDivElement>;
}

export function ResultsDisplay({ result, isGovernmentProgram, input, schedule, chartsContainerRef }: ResultsDisplayProps) {
  const { t, language } = useLanguage();
  const { usd: usdRate, eur: eurRate } = useCurrencyRates();
  
  const handleExportPDF = async (options: PDFExportOptions) => {
    const { exportToPDF } = await import("@/lib/pdf-export");

    const downPaymentAmount = calculateDownPaymentAmount(
      input.propertyValue,
      input.downPayment,
      input.downPaymentType
    );
    
    const rateSourceLabel = (() => {
      try {
        const src = localStorage.getItem('currency_rate_source') || 'nbu';
        return src === 'universalbank' ? 'Універсалбанк (продаж)' : 'НБУ';
      } catch { return 'НБУ'; }
    })();
    
    await exportToPDF({
      propertyValue: input.propertyValue,
      downPayment: downPaymentAmount,
      loanAmount: result.loanAmount,
      loanTermYears: input.loanTermYears,
      interestRate: isGovernmentProgram ? input.governmentRate : input.interestRate,
      paymentType: input.paymentType,
      isGovernmentProgram,
      governmentRate: input.governmentRate,
      result,
      schedule,
      language,
      options,
      currencyRates: { usd: usdRate, eur: eurRate, source: rateSourceLabel },
    });
  };

  // Tooltips content
  const tooltips = {
    monthlyPayment: {
      title: language === 'uk' ? 'Щомісячний платіж' : 'Monthly Payment',
      description: language === 'uk' 
        ? 'Це сума, яку ви будете сплачувати банку щомісяця протягом всього терміну кредитування. Платіж включає частину основного боргу та відсотки за користування кредитом. При ануїтетному платежі ця сума залишається незмінною весь термін.'
        : 'This is the amount you will pay to the bank every month during the entire loan term. The payment includes a portion of the principal and interest on the loan. With an annuity payment, this amount remains the same throughout the term.'
    },
    loanAmount: {
      title: language === 'uk' ? 'Сума кредиту' : 'Loan Amount',
      description: language === 'uk'
        ? 'Це різниця між вартістю нерухомості та вашим першим внеском. Саме цю суму ви берете в борг у банку. Чим більший перший внесок — тим менша сума кредиту і менші відсотки за весь термін.'
        : 'This is the difference between the property value and your down payment. This is the amount you borrow from the bank. The larger the down payment, the smaller the loan amount and less interest over the entire term.'
    },
    totalInterest: {
      title: language === 'uk' ? 'Переплата за відсотками' : 'Total Interest',
      description: language === 'uk'
        ? 'Це загальна сума відсотків, яку ви сплатите банку за весь термін кредиту. Переплата залежить від процентної ставки, терміну кредиту та суми боргу. При державних програмах (3% або 7%) переплата значно менша ніж при комерційних ставках (15-20%).'
        : 'This is the total interest you will pay to the bank over the entire loan term. Overpayment depends on the interest rate, loan term, and debt amount. With government programs (3% or 7%), overpayment is significantly less than with commercial rates (15-20%).'
    },
    totalPayment: {
      title: language === 'uk' ? 'Загальна сума виплат' : 'Total Payment',
      description: language === 'uk'
        ? 'Це повна сума, яку ви виплатите банку за весь термін кредиту: сума кредиту + переплата за відсотками + всі комісії. Порівнюйте цей показник при виборі між різними банками та програмами.'
        : 'This is the total amount you will pay to the bank over the entire loan term: loan amount + interest overpayment + all commissions. Compare this indicator when choosing between different banks and programs.'
    },
    effectiveRate: {
      title: language === 'uk' ? 'Ефективна ставка' : 'Effective Rate',
      description: language === 'uk'
        ? 'Реальна річна процентна ставка з урахуванням всіх комісій та витрат. Вона завжди вища за номінальну ставку, оскільки включає одноразові та щомісячні комісії банку. Використовуйте ефективну ставку для порівняння кредитних пропозицій.'
        : 'The actual annual interest rate including all commissions and fees. It is always higher than the nominal rate as it includes one-time and monthly bank commissions. Use the effective rate to compare loan offers.'
    },
    savings: {
      title: language === 'uk' ? 'Економія за ЄОселя' : 'YeOselya Savings',
      description: language === 'uk'
        ? 'Це різниця між щомісячним платежем за комерційною ставкою (18%) та за програмою ЄОселя. Показує скільки ви заощаджуєте щомісяця завдяки пільговій державній програмі. За весь термін кредиту економія може сягати сотень тисяч гривень!'
        : 'This is the difference between the monthly payment at a commercial rate (18%) and the YeOselya program. Shows how much you save monthly thanks to the preferential government program. Over the entire loan term, savings can reach hundreds of thousands of hryvnias!'
    },
    oneTimeCommission: {
      title: language === 'uk' ? 'Одноразова комісія' : 'One-time Commission',
      description: language === 'uk'
        ? 'Комісія, яку банк стягує один раз при видачі кредиту. Зазвичай становить 1-2% від суми кредиту. Сплачується на початку і не впливає на щомісячні платежі, але збільшує загальну вартість кредиту.'
        : 'A commission the bank charges once when issuing the loan. Usually 1-2% of the loan amount. Paid at the beginning and does not affect monthly payments but increases the total cost of the loan.'
    },
    monthlyCommission: {
      title: language === 'uk' ? 'Щомісячні комісії' : 'Monthly Commissions',
      description: language === 'uk'
        ? 'Загальна сума щомісячних комісій за весь термін кредиту. Щомісячна комісія — це відсоток від залишку боргу, який банк стягує додатково до основного платежу. Значно підвищує ефективну ставку.'
        : 'The total monthly commissions for the entire loan term. Monthly commission is a percentage of the remaining debt that the bank charges in addition to the main payment. Significantly increases the effective rate.'
    }
  };

  const InfoTooltip = ({ content }: { content: { title: string; description: string } }) => (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="ml-1 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm" side="top">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">{content.title}</h4>
          <p className="text-muted-foreground leading-relaxed">{content.description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Головний результат */}
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Card className="bg-primary text-primary-foreground transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 cursor-help">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-primary-foreground/80 text-sm mb-1 flex items-center justify-center gap-1">
                    {t('results.monthlyPayment')}
                    <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight break-all">
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                  <p className="text-primary-foreground/60 text-sm mt-1">
                    ≈ ${Math.round(result.monthlyPayment / usdRate).toLocaleString('uk-UA')} · €{Math.round(result.monthlyPayment / eurRate).toLocaleString('uk-UA')}
                  </p>
                  {isGovernmentProgram && result.savingsVsCommercial > 0 && (
                    <Badge className="mt-3 bg-success text-success-foreground">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {t('results.savingsYeoselya')}: {formatCurrency(result.savingsVsCommercial)}
                    </Badge>
                  )}
                  {isGovernmentProgram && input.loanTermYears > 10 && (
                    <div className="mt-2 text-xs text-primary-foreground/70">
                      {input.governmentRate === 3
                        ? language === 'uk' ? '3% → 6% після 10 року' : '3% → 6% after year 10'
                        : language === 'uk' ? '7% → 10% після 10 року' : '7% → 10% after year 10'}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <PDFExportDialog 
                    onExport={handleExportPDF}
                    chartsContainerRef={chartsContainerRef}
                  />
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 text-sm" side="bottom">
            <div className="space-y-2">
              <h4 className="font-semibold">{tooltips.monthlyPayment.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{tooltips.monthlyPayment.description}</p>
              {isGovernmentProgram && result.savingsVsCommercial > 0 && (
                <div className="pt-2 border-t">
                  <h4 className="font-semibold text-success">{tooltips.savings.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{tooltips.savings.description}</p>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Деталі */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-help">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                      <Calculator className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {t('results.loanAmount')}
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-all">{formatCurrency(result.loanAmount)}</p>
                      <CurrencyAmount amount={result.loanAmount} usdRate={usdRate} eurRate={eurRate} showMain={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 text-sm" side="top">
              <div className="space-y-2">
                <h4 className="font-semibold">{tooltips.loanAmount.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{tooltips.loanAmount.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-help">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10 transition-colors duration-300">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {t('results.overpayment')}
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-all">{formatCurrency(result.totalInterest)}</p>
                      <CurrencyAmount amount={result.totalInterest} usdRate={usdRate} eurRate={eurRate} showMain={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 text-sm" side="top">
              <div className="space-y-2">
                <h4 className="font-semibold">{tooltips.totalInterest.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{tooltips.totalInterest.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-help">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent transition-colors duration-300">
                      <Wallet className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {t('results.totalSum')}
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-all">{formatCurrency(result.totalPayment)}</p>
                      <CurrencyAmount amount={result.totalPayment} usdRate={usdRate} eurRate={eurRate} showMain={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 text-sm" side="top">
              <div className="space-y-2">
                <h4 className="font-semibold">{tooltips.totalPayment.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{tooltips.totalPayment.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-help">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20 transition-colors duration-300">
                      <Percent className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {t('results.effectiveRate')}
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </p>
                      <p className="text-base sm:text-lg font-semibold">{formatPercent(result.effectiveRate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 text-sm" side="top">
              <div className="space-y-2">
                <h4 className="font-semibold">{tooltips.effectiveRate.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{tooltips.effectiveRate.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Комісії */}
        {(result.oneTimeCommissionAmount > 0 || result.totalMonthlyCommissions > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                {t('results.commissions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.oneTimeCommissionAmount > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {t('results.oneTimeCommission')}:
                    <InfoTooltip content={tooltips.oneTimeCommission} />
                  </span>
                  <CurrencyAmount amount={result.oneTimeCommissionAmount} usdRate={usdRate} eurRate={eurRate} />
                </div>
              )}
              {result.totalMonthlyCommissions > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {t('results.monthlyCommissions')}:
                    <InfoTooltip content={tooltips.monthlyCommission} />
                  </span>
                  <CurrencyAmount amount={result.totalMonthlyCommissions} usdRate={usdRate} eurRate={eurRate} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Додаткові витрати */}
        <AdditionalCostsBreakdown result={result} input={input} usdRate={usdRate} eurRate={eurRate} />
      </div>
    </TooltipProvider>
  );
}

function AdditionalCostsBreakdown({ result, input, usdRate, eurRate }: { result: MortgageResult; input: MortgageInput; usdRate: number; eurRate: number }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const costs = result.additionalCosts;
  
  if (costs.totalAdditional <= 0) return null;

  const items = [
    { label: t('costs.pensionFund'), value: costs.pensionFund, percent: input.pensionFundPercent },
    { label: t('costs.duty'), value: costs.duty, percent: input.dutyPercent },
    { label: t('costs.incomeTax'), value: costs.incomeTax, percent: input.incomeTaxPercent },
    { label: t('costs.militaryTax'), value: costs.militaryTax, percent: input.militaryTaxPercent },
    { label: t('costs.notary'), value: costs.notary },
    { label: t('costs.appraisal'), value: costs.appraisal },
    { label: t('costs.insuranceTotal'), value: costs.insuranceTotal, sub: costs.insuranceAnnual > 0 ? `${formatCurrency(costs.insuranceAnnual)}${t('costs.perYear')}` : undefined },
    { label: t('costs.agencyCommission'), value: costs.agencyCommission, percent: input.agencyCommissionPercent },
  ].filter(i => i.value > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle 
          className="text-base flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {t('costs.title')}
            <Badge variant="secondary" className="text-xs">{formatCurrency(costs.totalAdditional)}</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.label}
                {item.percent ? ` (${item.percent}%)` : ''}
              </span>
              <div className="text-right">
                <CurrencyAmount amount={item.value} usdRate={usdRate} eurRate={eurRate} />
                {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t flex justify-between text-sm font-semibold">
            <span>{t('costs.grandTotal')}:</span>
            <CurrencyAmount amount={result.grandTotal} usdRate={usdRate} eurRate={eurRate} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
