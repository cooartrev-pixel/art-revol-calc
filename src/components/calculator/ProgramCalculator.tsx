import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Table, Bot, Building2, MessageSquare, ArrowLeft, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { ProgramInputs } from "@/components/calculator/ProgramInputs";
import { ResultsDisplay } from "@/components/calculator/ResultsDisplay";
import { PaymentChart } from "@/components/calculator/PaymentChart";
import { AmortizationTable } from "@/components/calculator/AmortizationTable";
import { ProgramAIAssistant } from "@/components/calculator/ProgramAIAssistant";
import { BankComparison } from "@/components/calculator/BankComparison";
import { ConsultationForm } from "@/components/calculator/ConsultationForm";
import { TelegramWidget } from "@/components/widgets/TelegramWidget";
import { CallbackWidget } from "@/components/widgets/CallbackWidget";
import { 
  calculateMortgage, 
  generateAmortizationSchedule,
  calculateDownPaymentAmount,
  type MortgageInput 
} from "@/lib/mortgage-calculations";
import { getProgramById, type GovernmentProgram } from "@/lib/programs-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProgramCalculatorProps {
  program: GovernmentProgram;
}

const ProgramCalculatorContent = ({ program }: ProgramCalculatorProps) => {
  const getDefaultInput = (): MortgageInput => {
    const isSubsidyProgram = program.rates.standard === 0;
    const rate = program.rates.privileged || program.rates.standard;
    
    return {
      propertyValue: program.requirements.maxPropertyValue || 2000000,
      downPayment: program.requirements.minDownPayment || 20,
      downPaymentType: 'percent',
      loanTermYears: Math.min(20, program.requirements.maxTerm),
      interestRate: isSubsidyProgram ? 0 : rate,
      paymentType: 'annuity',
      isGovernmentProgram: true,
      governmentRate: (rate as 3 | 7) || 7,
      oneTimeCommission: 1,
      monthlyCommission: 0,
    };
  };

  const [input, setInput] = useState<MortgageInput>(getDefaultInput);

  const result = useMemo(() => calculateMortgage(input), [input]);
  const schedule = useMemo(() => generateAmortizationSchedule(input), [input]);
  
  const loanAmount = useMemo(() => {
    const downPaymentAmount = calculateDownPaymentAmount(
      input.propertyValue,
      input.downPayment,
      input.downPaymentType
    );
    return input.propertyValue - downPaymentAmount;
  }, [input.propertyValue, input.downPayment, input.downPaymentType]);

  const isSubsidyProgram = program.rates.standard === 0;

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

        {/* Program Header */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{program.icon}</span>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{program.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{program.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {isSubsidyProgram 
                    ? 'Безоплатно' 
                    : `${program.rates.privileged || program.rates.standard}%`
                  }
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href={program.officialUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Офіційний сайт
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Перший внесок</p>
                <p className="font-semibold">
                  {program.requirements.minDownPayment === 0 
                    ? 'Не потрібен' 
                    : `від ${program.requirements.minDownPayment}%`
                  }
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Термін</p>
                <p className="font-semibold">до {program.requirements.maxTerm} років</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Ставка</p>
                <p className="font-semibold">{program.rates.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculator */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-5 xl:col-span-4 animate-fade-in [animation-delay:100ms]">
            <div className="lg:sticky lg:top-8 space-y-6">
              <ProgramInputs 
                values={input} 
                onChange={setInput} 
                program={program}
              />
              
              {/* Eligibility Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-primary" />
                    Хто може скористатись
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.eligibility.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Main Results */}
            {!isSubsidyProgram && (
              <div className="animate-fade-in [animation-delay:200ms]">
                <ResultsDisplay 
                  result={result} 
                  isGovernmentProgram={true}
                  input={input}
                  schedule={schedule}
                />
              </div>
            )}

            {/* Subsidy Info for subsidy programs */}
            {isSubsidyProgram && (
              <Card className="bg-primary text-primary-foreground animate-fade-in [animation-delay:200ms]">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-primary-foreground/80 text-sm mb-1">Тип підтримки</p>
                    <p className="text-4xl font-bold mb-2">
                      {program.id === 'evidnovlennya' ? 'Компенсація' : 'Субсидія'}
                    </p>
                    <p className="text-primary-foreground/80">
                      {program.rates.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="assistant" className="w-full animate-fade-in [animation-delay:300ms]">
              <TabsList className="grid w-full grid-cols-5 sticky top-2 z-10">
                <TabsTrigger value="assistant" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">Помічник</span>
                </TabsTrigger>
                {!isSubsidyProgram && (
                  <>
                    <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-[10px] sm:text-xs md:text-sm">Графіки</span>
                    </TabsTrigger>
                    <TabsTrigger value="banks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-[10px] sm:text-xs md:text-sm">Банки</span>
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <Table className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-[10px] sm:text-xs md:text-sm">Таблиця</span>
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="consultation" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">Заявка</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assistant" className="mt-6 animate-fade-in">
                <ProgramAIAssistant program={program} input={input} result={result} />
              </TabsContent>

              {!isSubsidyProgram && (
                <>
                  <TabsContent value="charts" className="mt-6 animate-fade-in">
                    <PaymentChart 
                      result={result} 
                      schedule={schedule}
                      isGovernmentProgram={true}
                    />
                  </TabsContent>

                  <TabsContent value="banks" className="mt-6 animate-fade-in">
                    <BankComparison 
                      loanAmount={loanAmount}
                      loanTermYears={input.loanTermYears}
                      isGovernmentProgram={true}
                      governmentRate={input.governmentRate}
                    />
                  </TabsContent>

                  <TabsContent value="table" className="mt-6 animate-fade-in">
                    <AmortizationTable schedule={schedule} />
                  </TabsContent>
                </>
              )}

              <TabsContent value="consultation" className="mt-6 animate-fade-in">
                <ConsultationForm
                  propertyValue={input.propertyValue}
                  loanAmount={loanAmount}
                  loanTerm={input.loanTermYears}
                  interestRate={program.rates.privileged || program.rates.standard}
                  isGovernmentProgram={true}
                />
              </TabsContent>
            </Tabs>

            {/* FAQ Section */}
            <Card className="animate-fade-in [animation-delay:400ms]">
              <CardHeader>
                <CardTitle>Часті запитання</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {program.faq.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in [animation-delay:500ms]">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
          <p className="mt-2">
            Калькулятор надає орієнтовні розрахунки. Точні умови уточнюйте в офіційних джерелах.
          </p>
        </footer>
      </main>

      {/* Floating Widgets */}
      <TelegramWidget botUsername="reviipotek_bot" />
      <CallbackWidget />
    </div>
  );
};

export default ProgramCalculatorContent;
