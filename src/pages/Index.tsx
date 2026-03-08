import { useState, useMemo, useRef } from "react";
import { BarChart3, Table, Bot, Building2, MessageSquare } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { CalculatorInputs } from "@/components/calculator/CalculatorInputs";
import { AreaLimitCalculator } from "@/components/calculator/AreaLimitCalculator";
import { ResultsDisplay } from "@/components/calculator/ResultsDisplay";
import { PaymentChart } from "@/components/calculator/PaymentChart";
import { AmortizationTable } from "@/components/calculator/AmortizationTable";
import { AIAssistant } from "@/components/calculator/AIAssistant";
import { BankComparison } from "@/components/calculator/BankComparison";
import { ConsultationForm } from "@/components/calculator/ConsultationForm";
import { useLanguage } from "@/lib/i18n";
import { 
  AnimatedTabs, 
  AnimatedTabsList, 
  AnimatedTabsTrigger, 
  AnimatedTabsContent 
} from "@/components/ui/animated-tabs";
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
  familySize: 1,
  propertyType: 'apartment',
  propertyAge: 'secondary',
  isYouth: false,
  pensionFundPercent: 0, pensionFundEnabled: true,
  dutyPercent: 0, dutyEnabled: true,
  incomeTaxPercent: 0, incomeTaxEnabled: true,
  militaryTaxPercent: 0, militaryTaxEnabled: true,
  notaryCost: 0, notaryEnabled: true,
  appraisalCost: 0, appraisalEnabled: true,
  insurancePercent: 0, insuranceEnabled: true,
  agencyCommissionPercent: 0, agencyCommissionEnabled: false,
  region: 'kyiv',
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
            {t('header.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('header.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Ліва колонка - Введення */}
          <div className="lg:col-span-5 xl:col-span-4 animate-fade-in [animation-delay:100ms]">
            <div className="lg:sticky lg:top-8 space-y-6">
              <CalculatorInputs values={input} onChange={setInput} />
              {input.isGovernmentProgram && <AreaLimitCalculator />}
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
                chartsContainerRef={chartsRef}
              />
            </div>

            {/* Табы з деталями */}
            <AnimatedTabs defaultValue="charts" className="w-full animate-fade-in [animation-delay:300ms]">
              <AnimatedTabsList className="grid w-full grid-cols-5 sticky top-2 z-10">
                <AnimatedTabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.charts')}</span>
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="banks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.banks')}</span>
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="table" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Table className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.table')}</span>
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="assistant" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.assistant')}</span>
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="consultation" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{t('tabs.application')}</span>
                </AnimatedTabsTrigger>
              </AnimatedTabsList>

              <AnimatedTabsContent value="charts" className="mt-6">
                <PaymentChart 
                  result={result} 
                  schedule={schedule}
                  isGovernmentProgram={input.isGovernmentProgram}
                  loanTermYears={input.loanTermYears}
                  governmentRate={input.governmentRate}
                />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="banks" className="mt-6">
                <BankComparison 
                  loanAmount={loanAmount}
                  loanTermYears={input.loanTermYears}
                  isGovernmentProgram={input.isGovernmentProgram}
                  governmentRate={input.governmentRate}
                />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="table" className="mt-6">
                <AmortizationTable 
                  schedule={schedule}
                  isGovernmentProgram={input.isGovernmentProgram}
                  loanTermYears={input.loanTermYears}
                  governmentRate={input.governmentRate}
                />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="assistant" className="mt-6">
                <AIAssistant input={input} result={result} />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="consultation" className="mt-6">
                <ConsultationForm
                  propertyValue={input.propertyValue}
                  loanAmount={loanAmount}
                  loanTerm={input.loanTermYears}
                  interestRate={input.isGovernmentProgram ? input.governmentRate : input.interestRate}
                  isGovernmentProgram={input.isGovernmentProgram}
                />
              </AnimatedTabsContent>
            </AnimatedTabs>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in [animation-delay:400ms]">
          <p>{t('common.copyright')}</p>
          <p className="mt-2">
            {t('common.disclaimer')}
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