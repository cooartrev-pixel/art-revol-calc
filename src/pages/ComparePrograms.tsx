import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Calculator,
  ExternalLink,
  Scale,
  Percent,
  Calendar,
  Banknote,
  Users,
  HelpCircle
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Header } from "@/components/calculator/Header";
import { TelegramWidget } from "@/components/widgets/TelegramWidget";
import { CallbackWidget } from "@/components/widgets/CallbackWidget";
import { programs, type GovernmentProgram } from "@/lib/programs-data";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ComparePrograms = () => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['yeoselya', 'postanova-280']);

  const toggleProgram = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const selectedProgramsData = programs.filter(p => selectedPrograms.includes(p.id));

  const comparisonRows: {
    label: string;
    icon: React.ReactNode;
    tooltip: { title: string; description: string };
    getValue: (p: GovernmentProgram) => React.ReactNode;
  }[] = [
    {
      label: 'Ставка',
      icon: <Percent className="h-4 w-4" />,
      tooltip: {
        title: 'Відсоткова ставка',
        description: 'Річний відсоток, який нараховується на залишок кредиту. Пільгова ставка доступна для ветеранів, ВПО, медиків та інших пріоритетних категорій. Стандартна — для всіх інших учасників програми.'
      },
      getValue: (p) => (
        <div>
          {p.rates.standard === 0 ? (
            <Badge className="bg-success text-success-foreground">Безоплатно</Badge>
          ) : (
            <>
              {p.rates.privileged && (
                <div className="mb-1">
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {p.rates.privileged}% пільгова
                  </Badge>
                </div>
              )}
              <Badge variant="outline">{p.rates.standard}% стандарт</Badge>
            </>
          )}
        </div>
      ),
    },
    {
      label: 'Перший внесок',
      icon: <Banknote className="h-4 w-4" />,
      tooltip: {
        title: 'Перший внесок (аванс)',
        description: 'Сума, яку ви сплачуєте одразу з власних коштів при купівлі житла. Решту покриває кредит. Чим більший внесок — тим менша сума кредиту та менші щомісячні платежі.'
      },
      getValue: (p) => (
        p.requirements.minDownPayment === 0 
          ? <span className="text-success font-medium">Не потрібен</span>
          : <span>від {p.requirements.minDownPayment}%</span>
      ),
    },
    {
      label: 'Термін',
      icon: <Calendar className="h-4 w-4" />,
      tooltip: {
        title: 'Термін кредитування',
        description: 'Період, протягом якого ви повертаєте кредит. Довший термін означає менший щомісячний платіж, але більшу загальну переплату за весь період кредиту.'
      },
      getValue: (p) => (
        <span>{p.requirements.minTerm} — {p.requirements.maxTerm} років</span>
      ),
    },
    {
      label: 'Макс. вартість',
      icon: <Banknote className="h-4 w-4" />,
      tooltip: {
        title: 'Максимальна вартість житла',
        description: 'Верхня межа вартості нерухомості, яку можна придбати за цією програмою. Якщо житло дорожче — програма не застосовується.'
      },
      getValue: (p) => (
        p.requirements.maxPropertyValue 
          ? formatCurrency(p.requirements.maxPropertyValue)
          : <span className="text-muted-foreground">Не обмежено</span>
      ),
    },
    {
      label: 'Макс. кредит',
      icon: <Banknote className="h-4 w-4" />,
      tooltip: {
        title: 'Максимальна сума кредиту',
        description: 'Найбільша сума, яку можна отримати в кредит за цією програмою. Фактична сума залежить від вартості житла та розміру першого внеску.'
      },
      getValue: (p) => (
        p.requirements.maxLoanAmount 
          ? formatCurrency(p.requirements.maxLoanAmount)
          : <span className="text-muted-foreground">Індивідуально</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 animate-fade-in">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              До каталогу програм
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Порівняння Програм
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Оберіть програми для порівняння та знайдіть найкращий варіант для вас
          </p>
        </div>

        {/* Program Selection */}
        <Card className="mb-8 animate-fade-in [animation-delay:100ms]">
          <CardHeader>
            <CardTitle className="text-lg">Оберіть програми для порівняння</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {programs.map((program) => (
                <label
                  key={program.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedPrograms.includes(program.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <Checkbox
                    checked={selectedPrograms.includes(program.id)}
                    onCheckedChange={() => toggleProgram(program.id)}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{program.icon}</span>
                    <span className="text-sm font-medium truncate">{program.shortName}</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedProgramsData.length > 0 ? (
          <Card className="animate-fade-in [animation-delay:200ms]">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[600px]">
                  {/* Header Row */}
                  <div className="grid border-b" style={{ gridTemplateColumns: `200px repeat(${selectedProgramsData.length}, 1fr)` }}>
                    <div className="p-4 font-medium text-muted-foreground bg-muted/30">
                      Параметр
                    </div>
                    {selectedProgramsData.map((program) => (
                      <div key={program.id} className="p-4 text-center border-l">
                        <div className="text-3xl mb-2">{program.icon}</div>
                        <h3 className="font-semibold text-sm mb-1">{program.shortName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {program.rates.standard === 0 
                            ? 'Субсидія' 
                            : `від ${program.rates.privileged || program.rates.standard}%`
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Rows */}
                  {comparisonRows.map((row, i) => (
                    <div 
                      key={i}
                      className="grid border-b last:border-b-0"
                      style={{ gridTemplateColumns: `200px repeat(${selectedProgramsData.length}, 1fr)` }}
                    >
                      <div className="p-4 bg-muted/30 flex items-center gap-2">
                        {row.icon}
                        <span className="font-medium text-sm">{row.label}</span>
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 animate-in fade-in-0 zoom-in-95 duration-200" side="right">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">{row.tooltip.title}</h4>
                              <p className="text-sm text-muted-foreground">{row.tooltip.description}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      {selectedProgramsData.map((program) => (
                        <div key={program.id} className="p-4 text-center border-l flex items-center justify-center">
                          {row.getValue(program)}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Eligibility Row */}
                  <div 
                    className="grid border-b"
                    style={{ gridTemplateColumns: `200px repeat(${selectedProgramsData.length}, 1fr)` }}
                  >
                    <div className="p-4 bg-muted/30 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">Хто може</span>
                    </div>
                    {selectedProgramsData.map((program) => (
                      <div key={program.id} className="p-4 border-l text-left">
                        <ul className="space-y-1">
                          {program.eligibility.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                          {program.eligibility.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-4">
                              +{program.eligibility.length - 3} ще...
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Benefits Row */}
                  <div 
                    className="grid border-b"
                    style={{ gridTemplateColumns: `200px repeat(${selectedProgramsData.length}, 1fr)` }}
                  >
                    <div className="p-4 bg-muted/30 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium text-sm">Переваги</span>
                    </div>
                    {selectedProgramsData.map((program) => (
                      <div key={program.id} className="p-4 border-l text-left">
                        <ul className="space-y-1">
                          {program.benefits.slice(0, 3).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Actions Row */}
                  <div 
                    className="grid"
                    style={{ gridTemplateColumns: `200px repeat(${selectedProgramsData.length}, 1fr)` }}
                  >
                    <div className="p-4 bg-muted/30 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="font-medium text-sm">Дії</span>
                    </div>
                    {selectedProgramsData.map((program) => (
                      <div key={program.id} className="p-4 border-l flex flex-col gap-2 items-center">
                        <Button size="sm" asChild className="w-full max-w-[140px]">
                          <Link to={`/calculator/${program.id}`}>
                            <Calculator className="h-4 w-4 mr-1" />
                            Калькулятор
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="w-full max-w-[140px]">
                          <a href={program.officialUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Сайт
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-in [animation-delay:200ms]">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Програми не обрано</h3>
              <p className="text-muted-foreground">
                Оберіть принаймні одну програму для порівняння
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Summary */}
        {selectedProgramsData.length >= 2 && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-transparent border-primary/20 animate-fade-in [animation-delay:300ms]">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Швидкий висновок
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Найнижча ставка</p>
                  <p className="font-semibold">
                    {selectedProgramsData
                      .filter(p => p.rates.standard > 0)
                      .sort((a, b) => (a.rates.privileged || a.rates.standard) - (b.rates.privileged || b.rates.standard))[0]?.shortName 
                      || selectedProgramsData.find(p => p.rates.standard === 0)?.shortName
                    }
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Без першого внеску</p>
                  <p className="font-semibold">
                    {selectedProgramsData.filter(p => p.requirements.minDownPayment === 0).map(p => p.shortName).join(', ') || 'Немає'}
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Найдовший термін</p>
                  <p className="font-semibold">
                    {selectedProgramsData.sort((a, b) => b.requirements.maxTerm - a.requirements.maxTerm)[0]?.shortName} 
                    {' '}({selectedProgramsData.sort((a, b) => b.requirements.maxTerm - a.requirements.maxTerm)[0]?.requirements.maxTerm} р.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
        </footer>
      </main>

      {/* Floating Widgets */}
      <TelegramWidget botUsername="reviipotek_bot" />
      <CallbackWidget />
    </div>
  );
};

export default ComparePrograms;
