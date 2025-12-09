import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BarChart3, Table, Bot } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { CalculatorInputs } from "@/components/calculator/CalculatorInputs";
import { ResultsDisplay } from "@/components/calculator/ResultsDisplay";
import { PaymentChart } from "@/components/calculator/PaymentChart";
import { AmortizationTable } from "@/components/calculator/AmortizationTable";
import { AIAssistant } from "@/components/calculator/AIAssistant";
import { 
  calculateMortgage, 
  generateAmortizationSchedule,
  type MortgageInput 
} from "@/lib/mortgage-calculations";

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
  const [input, setInput] = useState<MortgageInput>(defaultInput);

  const result = useMemo(() => calculateMortgage(input), [input]);
  const schedule = useMemo(() => generateAmortizationSchedule(input), [input]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
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
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-8">
              <CalculatorInputs values={input} onChange={setInput} />
            </div>
          </div>

          {/* Права колонка - Результати */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Основні результати */}
            <ResultsDisplay 
              result={result} 
              isGovernmentProgram={input.isGovernmentProgram} 
            />

            {/* Табы з деталями */}
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Графіки</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span className="hidden sm:inline">Таблиця</span>
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Помічник</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="mt-6">
                <PaymentChart 
                  result={result} 
                  schedule={schedule}
                  isGovernmentProgram={input.isGovernmentProgram}
                />
              </TabsContent>

              <TabsContent value="table" className="mt-6">
                <AmortizationTable schedule={schedule} />
              </TabsContent>

              <TabsContent value="assistant" className="mt-6">
                <AIAssistant input={input} result={result} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
          <p className="mt-2">
            Калькулятор надає орієнтовні розрахунки. Точні умови кредитування уточнюйте у банку.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
