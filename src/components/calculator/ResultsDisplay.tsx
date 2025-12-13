import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator, Percent, FileDown } from "lucide-react";
import type { MortgageResult, MortgageInput, AmortizationRow } from "@/lib/mortgage-calculations";
import { formatCurrency, formatPercent, calculateDownPaymentAmount } from "@/lib/mortgage-calculations";
import { exportToPDF } from "@/lib/pdf-export";
import { useLanguage } from "@/lib/i18n";

interface ResultsDisplayProps {
  result: MortgageResult;
  isGovernmentProgram: boolean;
  input: MortgageInput;
  schedule: AmortizationRow[];
}

export function ResultsDisplay({ result, isGovernmentProgram, input, schedule }: ResultsDisplayProps) {
  const { t, language } = useLanguage();
  
  const handleExportPDF = () => {
    const downPaymentAmount = calculateDownPaymentAmount(
      input.propertyValue,
      input.downPayment,
      input.downPaymentType
    );
    
    exportToPDF({
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
    });
  };

  return (
    <div className="space-y-4">
      {/* Головний результат */}
      <Card className="bg-primary text-primary-foreground transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-primary-foreground/80 text-sm mb-1">{t('results.monthlyPayment')}</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              {formatCurrency(result.monthlyPayment)}
            </p>
            {isGovernmentProgram && result.savingsVsCommercial > 0 && (
              <Badge className="mt-3 bg-success text-success-foreground">
                <TrendingDown className="h-3 w-3 mr-1" />
                {t('results.savingsYeoselya')}: {formatCurrency(result.savingsVsCommercial)}
              </Badge>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExportPDF}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {t('results.exportPDF')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Деталі */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-default">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Сума кредиту</p>
                <p className="text-lg font-semibold">{formatCurrency(result.loanAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-default">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 transition-colors duration-300">
                <TrendingUp className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Переплата</p>
                <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-default">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent transition-colors duration-300">
                <Wallet className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Загальна сума</p>
                <p className="text-lg font-semibold">{formatCurrency(result.totalPayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-default">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary/20 transition-colors duration-300">
                <Percent className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ефективна ставка</p>
                <p className="text-lg font-semibold">{formatPercent(result.effectiveRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Комісії */}
      {(result.oneTimeCommissionAmount > 0 || result.totalMonthlyCommissions > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Комісії
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.oneTimeCommissionAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Одноразова комісія:</span>
                <span className="font-medium">{formatCurrency(result.oneTimeCommissionAmount)}</span>
              </div>
            )}
            {result.totalMonthlyCommissions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Щомісячні комісії (всього):</span>
                <span className="font-medium">{formatCurrency(result.totalMonthlyCommissions)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
