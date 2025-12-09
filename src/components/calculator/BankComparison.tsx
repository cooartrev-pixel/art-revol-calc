import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Building2, Clock, Percent, ArrowUpDown, Check, Star, Info } from "lucide-react";
import { banks, formatMoney, OFFICIAL_YEOSELYA_URL, type BankInfo } from "@/lib/banks-data";
import type { MortgageResult } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BankComparisonProps {
  loanAmount: number;
  loanTermYears: number;
  isGovernmentProgram: boolean;
  governmentRate: 3 | 7;
}

type SortKey = 'name' | 'rate' | 'maxLoanAmount' | 'processingTime';

export function BankComparison({ 
  loanAmount, 
  loanTermYears, 
  isGovernmentProgram, 
  governmentRate 
}: BankComparisonProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedBanks = [...banks].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'uk');
        break;
      case 'rate':
        const rateA = isGovernmentProgram 
          ? (governmentRate === 3 ? a.rates.privileged : a.rates.standard)
          : a.rates.standard;
        const rateB = isGovernmentProgram 
          ? (governmentRate === 3 ? b.rates.privileged : b.rates.standard)
          : b.rates.standard;
        comparison = rateA - rateB;
        break;
      case 'maxLoanAmount':
        comparison = a.maxLoanAmount - b.maxLoanAmount;
        break;
      case 'processingTime':
        const timeA = parseInt(a.processingTime);
        const timeB = parseInt(b.processingTime);
        comparison = timeA - timeB;
        break;
    }
    return sortAsc ? comparison : -comparison;
  });

  // Розрахунок щомісячного платежу для кожного банку
  const calculateMonthlyPayment = (bank: BankInfo): number => {
    const rate = isGovernmentProgram 
      ? (governmentRate === 3 ? bank.rates.privileged : bank.rates.standard)
      : bank.rates.standard;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    
    if (monthlyRate === 0) return loanAmount / totalMonths;
    
    return loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  };

  const SortButton = ({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(sortKeyValue)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Офіційне посилання */}
      <Card className="border-government bg-government/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-government/20">
                <Info className="h-5 w-5 text-government" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Офіційна інформація про програму "ЄОселя"</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Актуальні умови, вимоги та перелік банків-учасників
                </p>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-government hover:bg-government/90 text-government-foreground shrink-0"
            >
              <a href={OFFICIAL_YEOSELYA_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Офіційний сайт ЄОселя
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Інформація про програму */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Percent className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Пільгова ставка</p>
                <p className="text-xl font-bold text-success">3%</p>
                <p className="text-xs text-muted-foreground">для пріоритетних категорій</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government/10">
                <Percent className="h-4 w-4 text-government" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Стандартна ставка</p>
                <p className="text-xl font-bold text-government">7%</p>
                <p className="text-xs text-muted-foreground">для інших категорій</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Банків-учасників</p>
                <p className="text-xl font-bold">{banks.length}</p>
                <p className="text-xs text-muted-foreground">станом на 2025 рік</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблиця банків */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Порівняння банків-учасників програми "ЄОселя"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Таблиця</TabsTrigger>
              <TabsTrigger value="cards">Картки</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">
                          <SortButton label="Банк" sortKeyValue="name" />
                        </TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Ставка" sortKeyValue="rate" />
                        </TableHead>
                        <TableHead className="text-right">Щомісячний платіж*</TableHead>
                        <TableHead className="text-right">
                          <SortButton label="Макс. сума" sortKeyValue="maxLoanAmount" />
                        </TableHead>
                        <TableHead className="text-center">Внесок</TableHead>
                        <TableHead className="text-center">Термін</TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Розгляд" sortKeyValue="processingTime" />
                        </TableHead>
                        <TableHead className="text-center">Сайт</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedBanks.map((bank) => {
                        const rate = isGovernmentProgram 
                          ? (governmentRate === 3 ? bank.rates.privileged : bank.rates.standard)
                          : bank.rates.standard;
                        const monthlyPayment = calculateMonthlyPayment(bank);
                        const isEligible = loanAmount <= bank.maxLoanAmount;

                        return (
                          <TableRow key={bank.id} className={!isEligible ? 'opacity-60' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{bank.logo}</span>
                                <div>
                                  <p className="font-medium">{bank.name}</p>
                                  {!isEligible && (
                                    <Badge variant="destructive" className="text-xs mt-1">
                                      Перевищено ліміт
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={rate === 3 ? "default" : "secondary"} 
                                className={rate === 3 ? "bg-success text-success-foreground" : ""}>
                                {rate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {isEligible ? formatCurrency(monthlyPayment) : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMoney(bank.maxLoanAmount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {bank.minDownPayment}% - {bank.maxDownPayment}%
                            </TableCell>
                            <TableCell className="text-center">
                              {bank.minTerm} - {bank.maxTerm} років
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{bank.processingTime}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" asChild>
                                    <a href={bank.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Перейти на сайт банку</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-4">
                * Розрахунок для суми кредиту {formatCurrency(loanAmount)} на {loanTermYears} років за ставкою {governmentRate}%
              </p>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBanks.map((bank) => {
                  const rate = isGovernmentProgram 
                    ? (governmentRate === 3 ? bank.rates.privileged : bank.rates.standard)
                    : bank.rates.standard;
                  const monthlyPayment = calculateMonthlyPayment(bank);
                  const isEligible = loanAmount <= bank.maxLoanAmount;

                  return (
                    <Card key={bank.id} className={!isEligible ? 'opacity-60' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{bank.logo}</span>
                            <span className="font-semibold">{bank.name}</span>
                          </div>
                          <Badge variant={rate === 3 ? "default" : "secondary"} 
                            className={rate === 3 ? "bg-success text-success-foreground" : ""}>
                            {rate}%
                          </Badge>
                        </div>
                        
                        {isEligible && (
                          <div className="p-3 bg-muted/30 rounded-lg mb-3">
                            <p className="text-xs text-muted-foreground">Щомісячний платіж</p>
                            <p className="text-lg font-bold">{formatCurrency(monthlyPayment)}</p>
                          </div>
                        )}

                        {!isEligible && (
                          <div className="p-3 bg-destructive/10 rounded-lg mb-3">
                            <p className="text-sm text-destructive font-medium">
                              Сума кредиту перевищує ліміт банку
                            </p>
                          </div>
                        )}

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Макс. сума:</span>
                            <span>{formatMoney(bank.maxLoanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Внесок:</span>
                            <span>{bank.minDownPayment}% - {bank.maxDownPayment}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Термін:</span>
                            <span>до {bank.maxTerm} років</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Розгляд:</span>
                            <span>{bank.processingTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {bank.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <Button variant="outline" className="w-full mt-4" asChild>
                          <a href={bank.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Сайт банку
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Додаткова інформація */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Важлива інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p>Ви можете подати заявку одночасно до 5 банків через додаток "Дія"</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p>Після 10 років ставка змінюється: з 3% до 6% або з 7% до 10%</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p>Для молоді до 25 років мінімальний внесок знижено до 10%</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p>Для першого внеску можна використати сертифікат "єВідновлення"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
