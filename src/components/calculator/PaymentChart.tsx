import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { MortgageResult, AmortizationRow } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { HelpCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface PaymentChartProps {
  result: MortgageResult;
  schedule: AmortizationRow[];
  isGovernmentProgram: boolean;
  loanTermYears?: number;
  governmentRate?: number;
}

const COLORS = {
  principal: 'hsl(var(--primary))',
  interest: 'hsl(var(--destructive))',
  commission: 'hsl(var(--muted))',
  government: 'hsl(var(--government))',
  commercial: 'hsl(var(--secondary))',
};

export function PaymentChart({ result, schedule, isGovernmentProgram, loanTermYears, governmentRate }: PaymentChartProps) {
  // Дані для кругової діаграми
  const pieData = [
    { name: 'Тіло кредиту', value: result.loanAmount, fill: COLORS.principal },
    { name: 'Відсотки', value: result.totalInterest, fill: COLORS.interest },
  ];
  
  if (result.oneTimeCommissionAmount + result.totalMonthlyCommissions > 0) {
    pieData.push({
      name: 'Комісії',
      value: result.oneTimeCommissionAmount + result.totalMonthlyCommissions,
      fill: COLORS.commission,
    });
  }

  // Дані для графіка порівняння (кожен 12-й місяць для річного огляду)
  const totalYears = Math.ceil(schedule.length / 12);
  const phaseChangeYear = isGovernmentProgram && (loanTermYears ?? 0) > 10 ? 10 : null;
  const rate2 = governmentRate === 3 ? 6 : 10;

  const yearlyData = schedule.filter((_, idx) => idx % 12 === 11 || idx === schedule.length - 1)
    .map((row, idx) => ({
      year: `${idx + 1} рік`,
      yearNum: idx + 1,
      principal: row.principalPayment * 12,
      interest: row.interestPayment * 12,
    }))
    .slice(0, Math.min(totalYears, 20));

  const phaseChangeLabel = phaseChangeYear ? `${phaseChangeYear} рік` : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Кругова діаграма */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Структура виплат
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help transition-colors hover:text-primary" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="right">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Кругова діаграма виплат</h4>
                  <p className="text-sm text-muted-foreground">
                    Показує, з чого складається загальна сума виплат за кредитом: тіло кредиту (основний борг), відсотки (переплата банку) та комісії. Чим більша частка відсотків — тим дорожче обходиться кредит.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Графік розподілу по роках */}
      {yearlyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Розподіл платежів по роках
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="right">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Річний розподіл платежів</h4>
                    <p className="text-sm text-muted-foreground">
                      Стовпчикова діаграма показує, як змінюється структура платежу з роками. На початку більша частина йде на відсотки, а з часом зростає частка погашення основного боргу. Це типово для ануїтетного платежу.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="year" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="principal" 
                    name="Тіло кредиту" 
                    fill={COLORS.principal}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="interest" 
                    name="Відсотки" 
                    fill={COLORS.interest}
                    radius={[4, 4, 0, 0]}
                  />
                  {phaseChangeLabel && (
                    <ReferenceLine
                      x={phaseChangeLabel}
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      label={{
                        value: `Ставка → ${rate2}%`,
                        position: 'top',
                        fill: 'hsl(var(--destructive))',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Порівняння з комерційним кредитом */}
      {isGovernmentProgram && result.savingsVsCommercial > 0 && (
        <Card className="border-government">
          <CardHeader>
            <CardTitle className="text-lg text-government flex items-center gap-2">
              Економія за програмою "ЄОселя"
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help transition-colors hover:text-primary" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="right">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Порівняння з комерційним кредитом</h4>
                    <p className="text-sm text-muted-foreground">
                      Порівнює загальну вартість кредиту за програмою ЄОселя (3% або 7%) з комерційним кредитом (18%). Різниця — це ваша реальна економія завдяки державній підтримці.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Комерційний кредит (18%)</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(result.totalPayment + result.savingsVsCommercial)}
                </p>
              </div>
              <div className="text-center p-4 bg-government/10 rounded-lg border border-government/20">
                <p className="text-sm text-muted-foreground mb-1">Програма "ЄОселя"</p>
                <p className="text-xl font-semibold text-government">
                  {formatCurrency(result.totalPayment)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-success/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Ваша економія</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(result.savingsVsCommercial)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
