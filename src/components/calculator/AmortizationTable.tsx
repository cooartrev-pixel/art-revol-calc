import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Download, FileSpreadsheet } from "lucide-react";
import type { AmortizationRow } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedRows = isExpanded ? schedule : schedule.slice(0, 12);

  const exportToCSV = () => {
    const headers = ['Місяць', 'Початковий залишок', 'Тіло кредиту', 'Відсотки', 'Загальний платіж', 'Кінцевий залишок'];
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Таблиця амортизації
        </CardTitle>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Експорт
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isExpanded ? "h-[500px]" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">№</TableHead>
                <TableHead className="text-right">Поч. залишок</TableHead>
                <TableHead className="text-right">Тіло</TableHead>
                <TableHead className="text-right">Відсотки</TableHead>
                <TableHead className="text-right">Платіж</TableHead>
                <TableHead className="text-right">Кін. залишок</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
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
              ))}
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
                  Згорнути таблицю
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Показати всі {schedule.length} місяців
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
