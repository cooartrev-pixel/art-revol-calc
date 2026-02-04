import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Building2, Clock, Percent, ArrowUpDown, Check, Info } from "lucide-react";
import { banks, formatMoney, OFFICIAL_YEOSELYA_URL, type BankInfo } from "@/lib/banks-data";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";
import { BankLogo } from "./BankLogo";

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
                          <div className="flex items-center justify-center gap-1">
                            <SortButton label="Ставка" sortKeyValue="rate" />
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Відсоткова ставка</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Річна відсоткова ставка за кредитом. За програмою ЄОселя: 3% для пріоритетних категорій (ветерани, ВПО, медики) або 7% для інших. Після 10 років ставка збільшується на 3%.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span>Щомісячний платіж*</span>
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Щомісячний платіж</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Сума, яку ви будете сплачувати щомісяця. Включає частину основного боргу та відсотки. Розрахований для ануїтетного типу погашення.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <SortButton label="Макс. сума" sortKeyValue="maxLoanAmount" />
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Максимальна сума кредиту</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Найбільша сума, яку банк готовий надати в кредит за програмою ЄОселя. Ліміти можуть відрізнятися залежно від типу житла та регіону.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>Внесок</span>
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Перший внесок</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Частка вартості житла, яку ви сплачуєте одразу з власних коштів. За програмою ЄОселя мінімум 20%, для молоді до 25 років — від 10%.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>Термін</span>
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Термін кредитування</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Період, протягом якого ви повертаєте кредит. За програмою ЄОселя доступний термін до 20 років. Чим довший термін — менший щомісячний платіж, але більша загальна переплата.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <SortButton label="Розгляд" sortKeyValue="processingTime" />
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Час розгляду заявки</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Орієнтовний час, який банк витрачає на розгляд вашої заявки. Фактичний термін може відрізнятися залежно від повноти документів.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
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
                              <div className="flex items-center gap-3">
                                <BankLogo bankId={bank.id} className="w-10 h-10" clickable />
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
                          <div className="flex items-center gap-3">
                            <BankLogo bankId={bank.id} className="w-10 h-10" clickable />
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
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Макс. сума:</span>
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="top">
                                  <p className="text-sm text-muted-foreground">
                                    Максимальний розмір кредиту, який банк надає за програмою ЄОселя
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <span>{formatMoney(bank.maxLoanAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Внесок:</span>
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="top">
                                  <p className="text-sm text-muted-foreground">
                                    Діапазон можливого першого внеску від вартості житла
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <span>{bank.minDownPayment}% - {bank.maxDownPayment}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Термін:</span>
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="top">
                                  <p className="text-sm text-muted-foreground">
                                    Максимальний термін кредитування в цьому банку
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <span>до {bank.maxTerm} років</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Розгляд:</span>
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="top">
                                  <p className="text-sm text-muted-foreground">
                                    Орієнтовний час розгляду вашої заявки банком
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
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
