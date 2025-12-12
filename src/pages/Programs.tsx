import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, ExternalLink, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { TelegramWidget } from "@/components/widgets/TelegramWidget";
import { CallbackWidget } from "@/components/widgets/CallbackWidget";
import { programs } from "@/lib/programs-data";

const Programs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Державні Програми Підтримки Житла
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Оберіть програму для розрахунку вигідних умов кредитування та отримайте 
            консультацію від нашого ШІ-помічника
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {programs.map((program, index) => (
            <Card 
              key={program.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-4xl">{program.icon}</span>
                  <Badge variant="outline" className="text-xs">
                    {program.rates.standard === 0 
                      ? 'Безоплатно' 
                      : `від ${program.rates.privileged || program.rates.standard}%`
                    }
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">{program.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {program.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Benefits */}
                <div className="space-y-2">
                  {program.benefits.slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Eligibility Preview */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">Хто може скористатись:</p>
                  <p className="text-sm line-clamp-2">
                    {program.eligibility.slice(0, 2).join(', ')}
                    {program.eligibility.length > 2 && '...'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link to={`/calculator/${program.id}`}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Калькулятор
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a 
                      href={program.officialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Офіційний сайт"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
              
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Quick Access to Main Calculator */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Універсальний Калькулятор</h2>
                <p className="text-muted-foreground">
                  Розрахуйте іпотеку за будь-якою програмою або комерційними умовами
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/calculator/yeoselya">
                  Відкрити калькулятор
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
          <p className="mt-2">
            Калькулятори надають орієнтовні розрахунки. Точні умови уточнюйте в офіційних джерелах.
          </p>
        </footer>
      </main>

      {/* Floating Widgets */}
      <TelegramWidget botUsername="reviipotek_bot" />
      <CallbackWidget />
    </div>
  );
};

export default Programs;
