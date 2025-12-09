import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator, Percent } from "lucide-react";
import type { MortgageResult } from "@/lib/mortgage-calculations";
import { formatCurrency, formatPercent } from "@/lib/mortgage-calculations";

interface ResultsDisplayProps {
  result: MortgageResult;
  isGovernmentProgram: boolean;
}

export function ResultsDisplay({ result, isGovernmentProgram }: ResultsDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Головний результат */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-primary-foreground/80 text-sm mb-1">Щомісячний платіж</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              {formatCurrency(result.monthlyPayment)}
            </p>
            {isGovernmentProgram && result.savingsVsCommercial > 0 && (
              <Badge className="mt-3 bg-success text-success-foreground">
                <TrendingDown className="h-3 w-3 mr-1" />
                Економія vs комерційний: {formatCurrency(result.savingsVsCommercial)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Деталі */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Сума кредиту</p>
                <p className="text-lg font-semibold">{formatCurrency(result.loanAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingUp className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Переплата</p>
                <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Wallet className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Загальна сума</p>
                <p className="text-lg font-semibold">{formatCurrency(result.totalPayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
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
