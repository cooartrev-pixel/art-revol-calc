import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Download, FileSpreadsheet, HelpCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { AmortizationRow } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  isGovernmentProgram?: boolean;
  loanTermYears?: number;
  governmentRate?: number;
}

export function AmortizationTable({ schedule, isGovernmentProgram, loanTermYears, governmentRate }: AmortizationTableProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedRows = isExpanded ? schedule : schedule.slice(0, 12);

  const phaseChangeMonth = isGovernmentProgram && (loanTermYears ?? 0) > 10 ? 120 : null;
  const rate2 = governmentRate === 3 ? 6 : 10;

  const exportToCSV = () => {
    const headers = [
      t('schedule.csvMonth'),
      t('schedule.csvOpeningBalance'),
      t('schedule.csvPrincipal'),
      t('schedule.csvInterest'),
      t('schedule.csvPayment'),
      t('schedule.csvClosingBalance')
    ];
    const csvContent = [
      headers.join(';'),
      ...schedule.map(row => [
        row.month,
        row.openingBalance.toFixed(2),
        row.principalPayment.toFixed(2),
        row.interestPayment.toFixed(2),
        row.totalPayment.toFixed(2),
        row.closingBalance.toFixed(2),
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'amortization_schedule.csv';
    link.click();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t('schedule.title')}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="self-start sm:self-auto">
          <Download className="h-4 w-4 mr-2" />
          {t('schedule.export')}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isExpanded ? "h-[500px]" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">{t('schedule.month')}</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t('schedule.openingBalance')}
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Залишок на початок</h4>
                          <p className="text-sm text-muted-foreground">Сума основного боргу, яка залишається на початку кожного місяця. Саме на цю суму нараховуються відсотки.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t('schedule.principal')}
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Тіло кредиту</h4>
                          <p className="text-sm text-muted-foreground">Частина щомісячного платежу, яка йде на погашення основного боргу. З часом ця частка зростає при ануїтетному платежі.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t('schedule.interest')}
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Відсотки</h4>
                          <p className="text-sm text-muted-foreground">Частина платежу, яка йде банку як плата за користування кредитом. Розраховується від залишку боргу. З часом ця частка зменшується.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t('schedule.payment')}
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Загальний платіж</h4>
                          <p className="text-sm text-muted-foreground">Повна сума щомісячного платежу: тіло кредиту + відсотки. При ануїтетному платежі ця сума однакова щомісяця.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t('schedule.closingBalance')}
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Залишок на кінець</h4>
                          <p className="text-sm text-muted-foreground">Сума боргу, яка залишається після сплати щомісячного платежу. Зменшується щомісяця до повного погашення кредиту.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.map((row) => {
                const isPhaseTransition = phaseChangeMonth && row.month === phaseChangeMonth + 1;
                const isPhase2 = phaseChangeMonth && row.month > phaseChangeMonth;
                return (
                  <>
                    {isPhaseTransition && (
                      <TableRow key={`phase-${row.month}`} className="border-0">
                        <TableCell colSpan={6} className="py-1.5 px-0">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-md">
                            <div className="w-1 h-4 bg-destructive rounded-full" />
                            <span className="text-xs font-semibold text-destructive">
                              Зміна ставки: {governmentRate}% → {rate2}% (з {phaseChangeMonth + 1}-го місяця)
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow key={row.month} className={isPhase2 ? "bg-destructive/[0.03]" : ""}>
                      <TableCell className="font-medium">
                        {row.month}
                        {isPhaseTransition && (
                          <Badge variant="destructive" className="ml-1.5 text-[10px] px-1 py-0">
                            Фаза 2
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(row.openingBalance)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-primary">
                        {formatCurrency(row.principalPayment)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-destructive">
                        {formatCurrency(row.interestPayment)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(row.totalPayment)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(row.closingBalance)}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {schedule.length > 12 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  {t('schedule.collapse')}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  {t('schedule.showAll', { months: schedule.length })}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}