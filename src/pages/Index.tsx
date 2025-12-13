import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Table, Bot, Building2, MessageSquare } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { CalculatorInputs } from "@/components/calculator/CalculatorInputs";
import { ResultsDisplay } from "@/components/calculator/ResultsDisplay";
import { PaymentChart } from "@/components/calculator/PaymentChart";
import { AmortizationTable } from "@/components/calculator/AmortizationTable";
import { AIAssistant } from "@/components/calculator/AIAssistant";
import { BankComparison } from "@/components/calculator/BankComparison";
import { ConsultationForm } from "@/components/calculator/ConsultationForm";
import { useLanguage } from "@/lib/i18n";
import { 
  calculateMortgage, 
  generateAmortizationSchedule,
  calculateDownPaymentAmount,
  type MortgageInput 
} from "@/lib/mortgage-calculations";
import { TelegramWidget } from "@/components/widgets/TelegramWidget";
import { CallbackWidget } from "@/components/widgets/CallbackWidget";

const defaultInput: MortgageInput = {
  propertyValue: 2000000,
  downPayment: 20,
  downPaymentType: 'percent',
  loanTermYears: 20,
  interestRate: 18,
  paymentType: 'annuity',
  isGovernmentProgram: false,
  governmentRate: 7,
  oneTimeCommission: 1,
  monthlyCommission: 0,
};

const Index = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState<MortgageInput>(defaultInput);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Іпотечний Калькулятор
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Розрахуйте вигідні умови кредитування, включаючи державну програму "ЄОселя" 
            зі ставками від 3% річних
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Ліва колонка - Введення */}
          <div className="lg:col-span-5 xl:col-span-4 animate-fade-in [animation-delay:100ms]">
            <div className="lg:sticky lg:top-8">
              <CalculatorInputs values={input} onChange={setInput} />
            </div>
          </div>

          {/* Права колонка - Результати */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Основні результати */}
            <div className="animate-fade-in [animation-delay:200ms]">
              <ResultsDisplay 
                result={result} 
                isGovernmentProgram={input.isGovernmentProgram}
                input={input}
                schedule={schedule}
              />
            </div>

            {/* Табы з деталями */}
            <Tabs defaultValue="charts" className="w-full animate-fade-in [animation-delay:300ms]">
              <TabsList className="grid w-full grid-cols-5 sticky top-2 z-10">
                <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.charts')}</span>
                </TabsTrigger>
                <TabsTrigger value="banks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.banks')}</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Table className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.table')}</span>
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.assistant')}</span>
                </TabsTrigger>
                <TabsTrigger value="consultation" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.application')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="mt-6 animate-fade-in">
                <PaymentChart 
                  result={result} 
                  schedule={schedule}
                  isGovernmentProgram={input.isGovernmentProgram}
                />
              </TabsContent>

              <TabsContent value="banks" className="mt-6 animate-fade-in">
                <BankComparison 
                  loanAmount={loanAmount}
                  loanTermYears={input.loanTermYears}
                  isGovernmentProgram={input.isGovernmentProgram}
                  governmentRate={input.governmentRate}
                />
              </TabsContent>

              <TabsContent value="table" className="mt-6 animate-fade-in">
                <AmortizationTable schedule={schedule} />
              </TabsContent>

              <TabsContent value="assistant" className="mt-6 animate-fade-in">
                <AIAssistant input={input} result={result} />
              </TabsContent>

              <TabsContent value="consultation" className="mt-6 animate-fade-in">
                <ConsultationForm
                  propertyValue={input.propertyValue}
                  loanAmount={loanAmount}
                  loanTerm={input.loanTermYears}
                  interestRate={input.isGovernmentProgram ? input.governmentRate : input.interestRate}
                  isGovernmentProgram={input.isGovernmentProgram}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in [animation-delay:400ms]">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
          <p className="mt-2">
            Калькулятор надає орієнтовні розрахунки. Точні умови кредитування уточнюйте у банку.
          </p>
        </footer>
      </main>

      {/* Floating Widgets */}
      <TelegramWidget botUsername="reviipotek_bot" />
      <CallbackWidget />
    </div>
  );
};

export default Index;
