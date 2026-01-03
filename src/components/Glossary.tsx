import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookText, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'basic' | 'program' | 'financial' | 'legal';
  related?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  // Basic terms
  {
    term: "Іпотека",
    definition: "Вид застави нерухомого майна для забезпечення виконання зобов'язань. При іпотечному кредитуванні нерухомість, що купується, залишається у власності позичальника, але перебуває в заставі у банку до повного погашення кредиту.",
    category: "basic",
    related: ["Застава", "Кредит", "Нерухомість"]
  },
  {
    term: "Перший внесок (аванс)",
    definition: "Частина вартості нерухомості, яку покупець сплачує власними коштами при оформленні іпотечного кредиту. Зазвичай становить від 10% до 30% вартості об'єкта залежно від програми та категорії позичальника.",
    category: "basic",
    related: ["LTV", "Вартість нерухомості"]
  },
  {
    term: "Тіло кредиту (основна сума)",
    definition: "Сума коштів, яку позичальник фактично отримав від банку без урахування відсотків. Це різниця між вартістю нерухомості та першим внеском. Погашається поступово протягом терміну кредитування.",
    category: "basic",
    related: ["Відсотки", "Сума кредиту"]
  },
  {
    term: "Відсоткова ставка",
    definition: "Плата за користування кредитом, що виражається у відсотках річних від залишку заборгованості. Може бути фіксованою (незмінною) або плаваючою (прив'язаною до індексу). Державні програми пропонують пільгові ставки від 3%.",
    category: "basic",
    related: ["ЄАПР", "Переплата"]
  },
  {
    term: "Ануїтетний платіж",
    definition: "Тип погашення кредиту рівними щомісячними платежами протягом усього терміну. Спочатку більша частина платежу йде на погашення відсотків, а з часом — на тіло кредиту. Зручний для планування бюджету.",
    category: "financial",
    related: ["Класичний платіж", "Графік платежів"]
  },
  {
    term: "Класичний (диференційований) платіж",
    definition: "Тип погашення, при якому тіло кредиту погашається рівними частинами, а відсотки нараховуються на залишок. Платежі зменшуються з часом. Загальна переплата менша, ніж при ануїтеті, але початкові платежі вищі.",
    category: "financial",
    related: ["Ануїтетний платіж", "Переплата"]
  },
  {
    term: "Переплата (загальні відсотки)",
    definition: "Загальна сума відсотків, сплачених за весь період кредитування. Залежить від суми кредиту, ставки, терміну та типу платежу. При класичному платежі переплата менша, ніж при ануїтетному.",
    category: "financial",
    related: ["Відсоткова ставка", "Термін кредиту"]
  },
  {
    term: "ЄАПР (Ефективна річна процентна ставка)",
    definition: "Реальна вартість кредиту з урахуванням усіх комісій та платежів. Включає не тільки відсоткову ставку, але й одноразові та щомісячні комісії банку. Дозволяє порівнювати реальну вартість кредитів у різних банках.",
    category: "financial",
    related: ["Відсоткова ставка", "Комісія"]
  },
  {
    term: "LTV (Loan-to-Value)",
    definition: "Співвідношення суми кредиту до вартості нерухомості у відсотках. Наприклад, якщо нерухомість коштує 2 млн грн, а кредит 1.6 млн грн, LTV = 80%. Чим нижче LTV, тим менші ризики для банку і кращі умови для позичальника.",
    category: "financial",
    related: ["Перший внесок", "Сума кредиту"]
  },
  {
    term: "Графік амортизації",
    definition: "Детальна таблиця, що показує розподіл кожного платежу на погашення тіла кредиту та відсотків, а також залишок заборгованості після кожного платежу. Дозволяє бачити динаміку погашення боргу.",
    category: "financial",
    related: ["Ануїтетний платіж", "Класичний платіж"]
  },
  {
    term: "Комісія банку",
    definition: "Додаткові платежі банку за обслуговування кредиту. Бувають одноразові (за видачу кредиту, оцінку нерухомості) та щомісячні (за обслуговування рахунку). Впливають на ефективну ставку кредиту.",
    category: "financial",
    related: ["ЄАПР", "Відсоткова ставка"]
  },
  // Program terms
  {
    term: "ЄОселя",
    definition: "Державна програма доступного іпотечного кредитування для громадян України. Пропонує пільгові ставки 3% для пріоритетних категорій (військові, медики, педагоги) та 7% для стандартних категорій. Максимальний термін до 20 років.",
    category: "program",
    related: ["Пільгова ставка", "Пріоритетна категорія"]
  },
  {
    term: "Постанова №280",
    definition: "Урядова програма компенсації відсоткових ставок для ВПО, ветеранів та постраждалих внаслідок бойових дій. Держава компенсує частину відсоткової ставки, зменшуючи фінансове навантаження на позичальника.",
    category: "program",
    related: ["ВПО", "Компенсація"]
  },
  {
    term: "Постанова №719",
    definition: "Програма пільгового кредитування молоді та молодих сімей. Надає пільгові умови для громадян віком до 35 років на придбання першого власного житла. Мінімальний внесок може бути знижений до 10%.",
    category: "program",
    related: ["Молода сім'я", "Перший внесок"]
  },
  {
    term: "єВідновлення",
    definition: "Сертифікатна програма для постраждалих від руйнувань внаслідок бойових дій. Надає сертифікат на відновлення або придбання житла без необхідності сплати відсотків. Розмір сертифікату залежить від ступеня пошкодження.",
    category: "program",
    related: ["Сертифікат", "Компенсація"]
  },
  {
    term: "Держмолодьжитло",
    definition: "Програма часткової компенсації вартості житла для молоді. Держава покриває частину вартості нерухомості для молодих громадян та сімей. Розмір компенсації залежить від регіону та наявності дітей.",
    category: "program",
    related: ["Молода сім'я", "Субсидія"]
  },
  {
    term: "Пріоритетна категорія",
    definition: "Групи громадян, які мають право на найнижчу пільгову ставку 3% за програмою ЄОселя: військовослужбовці, педагоги, медичні працівники, науковці, працівники культури та соціальні працівники.",
    category: "program",
    related: ["ЄОселя", "Пільгова ставка"]
  },
  {
    term: "ВПО (Внутрішньо переміщена особа)",
    definition: "Громадянин України, змушений покинути місце проживання внаслідок збройного конфлікту, окупації або надзвичайних ситуацій. ВПО мають право на пільгові умови кредитування за кількома державними програмами.",
    category: "legal",
    related: ["Постанова №280", "Пільгова ставка"]
  },
  {
    term: "Сертифікат на житло",
    definition: "Державний документ, що засвідчує право громадянина на отримання компенсації для придбання або будівництва житла. Використовується в програмах єВідновлення та Держмолодьжитло.",
    category: "legal",
    related: ["єВідновлення", "Компенсація"]
  },
  // Legal terms
  {
    term: "Застава",
    definition: "Спосіб забезпечення виконання зобов'язань, при якому кредитор має право у разі невиконання боржником забезпеченого заставою зобов'язання отримати задоволення за рахунок заставленого майна.",
    category: "legal",
    related: ["Іпотека", "Нерухомість"]
  },
  {
    term: "Нотаріальне посвідчення",
    definition: "Обов'язкова процедура для іпотечного договору, яка підтверджує законність угоди. Нотаріус перевіряє документи, підтверджує особу сторін та вносить інформацію до Державного реєстру.",
    category: "legal",
    related: ["Іпотечний договір", "Реєстрація"]
  },
  {
    term: "Оцінка нерухомості",
    definition: "Визначення ринкової вартості об'єкта незалежним оцінювачем. Обов'язкова процедура при іпотечному кредитуванні. Банк надає кредит на основі оціночної вартості, яка може відрізнятися від ціни продажу.",
    category: "legal",
    related: ["Вартість нерухомості", "LTV"]
  },
  {
    term: "Страхування майна",
    definition: "Обов'язкова умова іпотечного кредиту. Об'єкт нерухомості страхується від пошкодження або знищення. Вартість страховки зазвичай становить 0.1-0.3% від вартості нерухомості на рік.",
    category: "legal",
    related: ["Іпотека", "Комісія"]
  },
  {
    term: "Дострокове погашення",
    definition: "Право позичальника погасити кредит або його частину раніше встановленого терміну. За законом України банки не мають права стягувати штрафи за дострокове погашення іпотечних кредитів.",
    category: "legal",
    related: ["Графік платежів", "Переплата"]
  }
];

const categoryLabels: Record<string, string> = {
  basic: 'Базові',
  program: 'Програми',
  financial: 'Фінансові',
  legal: 'Юридичні'
};

const categoryColors: Record<string, string> = {
  basic: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  program: 'bg-green-500/10 text-green-600 border-green-500/20',
  financial: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  legal: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
};

export function Glossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedTerms = isExpanded ? filteredTerms : filteredTerms.slice(0, 6);

  return (
    <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookText className="h-5 w-5 text-secondary-foreground" />
          Глосарій термінів
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук терміну..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Всі
            </Badge>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Badge
                key={key}
                variant="outline"
                className={`cursor-pointer ${selectedCategory === key ? categoryColors[key] : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div className="space-y-3">
          {displayedTerms.map((term, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-start justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{term.term}</span>
                      <Badge variant="outline" className={`text-xs ${categoryColors[term.category]}`}>
                        {categoryLabels[term.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {term.definition}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform [[data-state=open]>&]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 py-2 text-sm text-muted-foreground border-l-2 border-primary/20 ml-3 mt-2">
                  <p>{term.definition}</p>
                  {term.related && term.related.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-medium">Пов'язані:</span>
                      {term.related.map((r, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Show more/less */}
        {filteredTerms.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-1 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Показати всі {filteredTerms.length} термінів
              </>
            )}
          </button>
        )}

        {filteredTerms.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Термінів не знайдено
          </p>
        )}
      </CardContent>
    </Card>
  );
}
