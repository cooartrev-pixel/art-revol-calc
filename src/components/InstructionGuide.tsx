import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Calculator, Search, FileText, MessageCircle, Download, Scale } from "lucide-react";

interface InstructionStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips?: string[];
}

const instructionSteps: InstructionStep[] = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "1. Ознайомтесь з програмами",
    description: "На головній сторінці ви побачите перелік усіх державних програм підтримки житла: ЄОселя, Постанова №280, Постанова №719, єВідновлення та Держмолодьжитло. Кожна картка містить короткий опис, ставку та основні переваги програми.",
    tips: [
      "Натисніть на іконку 🔗 щоб перейти на офіційний сайт програми",
      "Перегляньте хто може скористатись кожною програмою"
    ]
  },
  {
    icon: <Calculator className="h-8 w-8" />,
    title: "2. Оберіть калькулятор програми",
    description: "Натисніть кнопку \"Калькулятор\" на картці обраної програми. Ви перейдете на сторінку розрахунку з усіма параметрами саме для цієї програми.",
    tips: [
      "Кожна програма має свої унікальні обмеження та вимоги",
      "Калькулятор автоматично застосує правильні ставки"
    ]
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "3. Введіть параметри кредиту",
    description: "Заповніть форму з параметрами: вартість нерухомості, перший внесок, термін кредиту. Система автоматично розрахує суму кредиту, щомісячний платіж та загальну переплату.",
    tips: [
      "Використовуйте повзунки для швидкого налаштування значень",
      "Оберіть вашу категорію (пільгова/стандартна) для правильної ставки",
      "Враховуйте банківські комісії для точнішого розрахунку"
    ]
  },
  {
    icon: <Scale className="h-8 w-8" />,
    title: "4. Порівняйте банки-учасники",
    description: "Перейдіть на вкладку \"Банки\" щоб побачити умови всіх банків-учасників програми. Порівняйте максимальні суми кредиту, мінімальний внесок та терміни розгляду заявки.",
    tips: [
      "Зверніть увагу на ліміти банків — деякі мають обмеження по сумі",
      "Можна подати заявку до 5 банків одночасно через Дію"
    ]
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "5. Перегляньте графік платежів",
    description: "На вкладці \"Таблиця\" ви знайдете детальний графік амортизації з розбивкою по місяцях: тіло кредиту, відсотки та залишок боргу.",
    tips: [
      "Експортуйте таблицю в CSV для аналізу",
      "Перегляньте як змінюється співвідношення тіла та відсотків"
    ]
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "6. Отримайте консультацію від ШІ",
    description: "Вкладка \"Помічник\" містить ШІ-асистента, який відповість на ваші запитання про обрану програму: вимоги, документи, процес оформлення.",
    tips: [
      "Запитайте про необхідні документи",
      "Уточніть особливості для вашої категорії",
      "Дізнайтесь про терміни розгляду заявки"
    ]
  },
  {
    icon: <Download className="h-8 w-8" />,
    title: "7. Збережіть або надішліть заявку",
    description: "Експортуйте розрахунок у PDF для збереження або подальшого використання. На вкладці \"Заявка\" залиште свої контакти для консультації з нашим агентом.",
    tips: [
      "PDF містить всі параметри та порівняння банків",
      "Наш агент зв'яжеться з вами для допомоги в оформленні"
    ]
  },
  {
    icon: <Scale className="h-8 w-8" />,
    title: "8. Порівняйте кілька програм",
    description: "Скористайтесь функцією \"Порівняти програми\" на головній сторінці, щоб побачити усі програми поряд та обрати найвигіднішу для вашої ситуації.",
    tips: [
      "Оберіть 2-3 програми для детального порівняння",
      "Порівнюються ставки, внесок, терміни та обмеження"
    ]
  }
];

export function InstructionGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % instructionSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + instructionSteps.length) % instructionSteps.length);
  };

  const step = instructionSteps[currentStep];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Інструкція користування
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Згорнути' : 'Розгорнути все'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isExpanded ? (
          // Step-by-step view with pagination
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 text-primary">
              {step.icon}
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

            {step.tips && step.tips.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">💡 Поради:</p>
                {step.tips.map((tip, index) => (
                  <p key={index} className="text-xs text-muted-foreground">• {tip}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {instructionSteps.length}
              </span>
              
              <Button variant="outline" size="sm" onClick={nextStep}>
                Далі
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 pt-2">
              {instructionSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-primary w-4' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Expanded view - all steps
          <div className="space-y-6">
            {instructionSteps.map((s, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="text-primary shrink-0">{s.icon}</div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  {s.tips && (
                    <div className="bg-muted/50 rounded-lg p-2 mt-2">
                      {s.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
