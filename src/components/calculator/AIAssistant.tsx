import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bot, AlertTriangle, CheckCircle2, Info, Building2, Users, MapPin, FileText, ExternalLink } from "lucide-react";
import type { MortgageInput, MortgageResult } from "@/lib/mortgage-calculations";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { OFFICIAL_YEOSELYA_URL } from "@/lib/banks-data";

interface AIAssistantProps {
  input: MortgageInput;
  result: MortgageResult;
}

const KYIV_LIMIT = 2500000;
const REGIONAL_LIMIT = 1800000;
const AREA_PER_PERSON = 52.5;

export function AIAssistant({ input, result }: AIAssistantProps) {
  const recommendations: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    content: string;
    icon: React.ElementType;
  }> = [];

  // Аналіз програми ЄОселя
  if (input.isGovernmentProgram) {
    if (input.governmentRate === 3) {
      recommendations.push({
        type: 'success',
        title: 'Пільгова ставка 3%',
        content: 'Ви обрали пільгову ставку для пріоритетних категорій. Переконайтесь, що ви належите до однієї з категорій: військовослужбовці ЗСУ, педагогічні працівники, медичні працівники, науковці.',
        icon: CheckCircle2,
      });
    } else {
      recommendations.push({
        type: 'info',
        title: 'Стандартна ставка 7%',
        content: 'Ви обрали стандартну ставку програми "ЄОселя". Ця ставка доступна для ветеранів, внутрішньо переміщених осіб та громадян, які не мають власного житла площею більше 52,5 м².',
        icon: Info,
      });
    }

    // Перевірка ліміту вартості
    if (input.propertyValue > KYIV_LIMIT) {
      recommendations.push({
        type: 'warning',
        title: 'Увага! Обмеження за вартістю',
        content: `Вартість вашого об'єкта (${formatCurrency(input.propertyValue)}) може перевищувати ліміти програми "ЄОселя" для Києва (${formatCurrency(KYIV_LIMIT)}) або інших регіонів (${formatCurrency(REGIONAL_LIMIT)}). Рекомендуємо уточнити актуальні ліміти у банку-учаснику.`,
        icon: AlertTriangle,
      });
    }

    // Перший внесок
    const downPaymentPercent = input.downPaymentType === 'percent' 
      ? input.downPayment 
      : (input.downPayment / input.propertyValue) * 100;
    
    if (downPaymentPercent < 20) {
      recommendations.push({
        type: 'warning',
        title: 'Мінімальний внесок',
        content: 'За програмою "ЄОселя" рекомендований мінімальний перший внесок становить 20% від вартості житла. Ваш внесок нижчий за цю межу.',
        icon: AlertTriangle,
      });
    }
  }

  // Загальні рекомендації
  if (result.totalInterest > result.loanAmount * 0.5) {
    recommendations.push({
      type: 'info',
      title: 'Значна переплата',
      content: `Загальна переплата за кредитом становить ${formatCurrency(result.totalInterest)}, що перевищує 50% від суми кредиту. Розгляньте можливість збільшення першого внеску або скорочення терміну кредитування.`,
      icon: Info,
    });
  }

  if (input.loanTermYears > 20) {
    recommendations.push({
      type: 'info',
      title: 'Тривалий термін кредитування',
      content: 'Термін кредитування понад 20 років суттєво збільшує загальну переплату. Якщо є можливість, розгляньте коротший термін для економії на відсотках.',
      icon: Info,
    });
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-destructive';
      default: return 'text-government';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI-Помічник з іпотечних питань
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Рекомендації */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30 border">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${getIconColor(rec.type)}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{rec.title}</span>
                      <Badge variant={getBadgeVariant(rec.type)} className="text-xs">
                        {rec.type === 'success' ? 'Добре' : rec.type === 'warning' ? 'Увага' : 'Інфо'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="eligibility">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Хто може отримати кредит за "ЄОселя"?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p><strong>Ставка 3%:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Військовослужбовці ЗСУ</li>
                <li>Педагогічні працівники</li>
                <li>Медичні працівники</li>
                <li>Науковці</li>
              </ul>
              <p className="mt-2"><strong>Ставка 7%:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Ветерани війни</li>
                <li>Внутрішньо переміщені особи (ВПО)</li>
                <li>Громадяни без власного житла більше 52,5 м²</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limits">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Обмеження за вартістю та площею
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p><strong>Нормована площа:</strong></p>
              <p>52,5 м² на одну особу + 21 м² на кожного наступного члена сім'ї.</p>
              <p className="mt-2"><strong>Гранична вартість (орієнтовно):</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Київ: до 2,5 млн грн</li>
                <li>Обласні центри: до 1,8 млн грн</li>
                <li>Інші регіони: індивідуально</li>
              </ul>
              <p className="mt-2 text-sm italic">
                * Ліміти можуть змінюватися, уточнюйте у банку-учаснику.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="banks">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Банки-учасники програми
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <p>Банки-учасники програми "ЄОселя" (станом на 2025 рік):</p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                <li>Ощадбанк</li>
                <li>ПриватБанк</li>
                <li>Укргазбанк</li>
                <li>Глобус Банк</li>
                <li>Скай Банк</li>
                <li>Сенс Банк</li>
                <li>Банк Кредит Дніпро</li>
                <li>ТАСКОМБАНК</li>
                <li>BISBANK</li>
                <li>РАДАБАНК</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3" 
                asChild
              >
                <a href={OFFICIAL_YEOSELYA_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Офіційний сайт програми
                </a>
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Додаткові витрати
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>Врахуйте додаткові витрати при оформленні іпотеки:</p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                <li>Страхування життя: 0,3% - 1% річних</li>
                <li>Страхування майна: 0,1% - 0,3% річних</li>
                <li>Оцінка майна: 1 500 - 3 000 грн</li>
                <li>Нотаріальні послуги: 0,5% - 1%</li>
                <li>Державна реєстрація: ~1 500 грн</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
