import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  FileText,
  Users,
  Banknote,
  Calendar
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { GovernmentProgram } from "@/lib/programs-data";
import type { MortgageInput, MortgageResult } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";

interface ProgramAIAssistantProps {
  program: GovernmentProgram;
  input: MortgageInput;
  result: MortgageResult;
}

interface Recommendation {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
}

export function ProgramAIAssistant({ program, input, result }: ProgramAIAssistantProps) {
  const isSubsidyProgram = program.rates.standard === 0;
  
  // Generate program-specific recommendations
  const recommendations: Recommendation[] = [];

  // Check property value limits
  if (program.requirements.maxPropertyValue && input.propertyValue > program.requirements.maxPropertyValue) {
    recommendations.push({
      type: 'warning',
      title: 'Перевищено ліміт вартості',
      description: `Максимальна вартість за програмою "${program.shortName}" становить ${formatCurrency(program.requirements.maxPropertyValue)}. Ваше значення перевищує цей ліміт.`,
    });
  }

  // Check loan amount limits
  if (program.requirements.maxLoanAmount && result.loanAmount > program.requirements.maxLoanAmount) {
    recommendations.push({
      type: 'warning',
      title: 'Перевищено ліміт кредиту',
      description: `Максимальна сума кредиту за програмою становить ${formatCurrency(program.requirements.maxLoanAmount)}. Збільште перший внесок для зменшення суми кредиту.`,
    });
  }

  // Check down payment
  if (input.downPaymentType === 'percent' && input.downPayment < program.requirements.minDownPayment) {
    recommendations.push({
      type: 'warning',
      title: 'Недостатній перший внесок',
      description: `Мінімальний перший внесок за програмою становить ${program.requirements.minDownPayment}%. Поточне значення: ${input.downPayment}%.`,
    });
  }

  // Check loan term
  if (input.loanTermYears > program.requirements.maxTerm) {
    recommendations.push({
      type: 'warning',
      title: 'Перевищено термін кредиту',
      description: `Максимальний термін кредиту за програмою становить ${program.requirements.maxTerm} років.`,
    });
  }

  // Success recommendations
  if (recommendations.filter(r => r.type === 'warning').length === 0) {
    recommendations.push({
      type: 'success',
      title: 'Параметри відповідають вимогам',
      description: `Ваші розрахункові параметри відповідають вимогам програми "${program.shortName}".`,
    });
  }

  // Add savings info for credit programs
  if (!isSubsidyProgram && result.savingsVsCommercial > 0) {
    recommendations.push({
      type: 'success',
      title: 'Економія за програмою',
      description: `Ви заощадите ${formatCurrency(result.savingsVsCommercial)} порівняно з комерційним кредитом під 18% річних.`,
    });
  }

  // General tips based on program
  if (program.id === 'yeoselya') {
    recommendations.push({
      type: 'tip',
      title: 'Перевірте право на пільгову ставку',
      description: 'Якщо ви є військовослужбовцем, медиком, педагогом або науковцем — ви маєте право на ставку 3% замість 7%.',
    });
  }

  if (program.id === 'postanova-280') {
    recommendations.push({
      type: 'info',
      title: 'Безоплатне житло',
      description: 'За цією програмою передбачено безоплатне надання житла або грошової компенсації без необхідності погашення.',
    });
  }

  if (program.id === 'evidnovlennya') {
    recommendations.push({
      type: 'info',
      title: 'Порядок отримання компенсації',
      description: 'Подайте заявку через Дія, дочекайтесь обстеження майна комісією, та отримайте виплату на банківську картку.',
    });
  }

  if (program.id === 'derzhmolozhytlo') {
    recommendations.push({
      type: 'tip',
      title: 'Вікові обмеження',
      description: 'Вік обох членів подружжя не повинен перевищувати 35 років на момент укладання кредитного договору.',
    });
  }

  const getIconForType = (type: Recommendation['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info': return <Info className="h-5 w-5 text-primary" />;
      case 'tip': return <Lightbulb className="h-5 w-5 text-accent-foreground" />;
    }
  };

  const getBadgeVariant = (type: Recommendation['type']) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'info': return 'secondary';
      case 'tip': return 'outline';
    }
  };

  const getBadgeText = (type: Recommendation['type']) => {
    switch (type) {
      case 'success': return 'Чудово';
      case 'warning': return 'Увага';
      case 'info': return 'Інформація';
      case 'tip': return 'Порада';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl">ШІ-консультант</span>
              <p className="text-sm font-normal text-muted-foreground">
                Рекомендації щодо програми "{program.shortName}"
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-card border"
              >
                {getIconForType(rec.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rec.title}</span>
                    <Badge variant={getBadgeVariant(rec.type)} className="text-xs">
                      {getBadgeText(rec.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Деталі програми
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="eligibility">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Хто може скористатись
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-6">
                  {program.eligibility.map((item, i) => (
                    <li key={i} className="list-disc text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="benefits">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Переваги програми
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {program.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Необхідні документи
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-6">
                  {program.documents.map((doc, i) => (
                    <li key={i} className="list-disc text-muted-foreground">{doc}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="requirements">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Фінансові умови
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Перший внесок</p>
                    <p className="font-semibold">
                      {program.requirements.minDownPayment === 0 
                        ? 'Не потрібен' 
                        : `від ${program.requirements.minDownPayment}%`
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Термін</p>
                    <p className="font-semibold">до {program.requirements.maxTerm} років</p>
                  </div>
                  {program.requirements.maxPropertyValue && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Макс. вартість</p>
                      <p className="font-semibold">{formatCurrency(program.requirements.maxPropertyValue)}</p>
                    </div>
                  )}
                  {program.requirements.maxLoanAmount && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Макс. кредит</p>
                      <p className="font-semibold">{formatCurrency(program.requirements.maxLoanAmount)}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Official Link */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-1">Офіційна інформація</h3>
              <p className="text-sm text-muted-foreground">
                Детальні умови та актуальна інформація на офіційному сайті
              </p>
            </div>
            <Button asChild>
              <a 
                href={program.officialUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Перейти на сайт
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
