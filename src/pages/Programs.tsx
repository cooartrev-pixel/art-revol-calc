import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, ExternalLink, CheckCircle2, Scale } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { LegislativeUpdates } from "@/components/LegislativeUpdates";
import { InstructionGuide } from "@/components/InstructionGuide";
import { Glossary } from "@/components/Glossary";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { programs } from "@/lib/programs-data";

const Programs = () => {
  return (
    <div className="min-h-screen bg-background">
      <PWAInstallBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Державні Програми Підтримки Житла
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Оберіть програму для розрахунку вигідних умов кредитування
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {programs.map((program, index) => (
            <Card 
              key={program.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl leading-tight">{program.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Actions */}
                <div className="flex gap-2">
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

        {/* Instruction Guide Section */}
        <div className="mb-12 animate-fade-in">
          <InstructionGuide />
        </div>

        {/* Glossary Section */}
        <div className="mb-12 animate-fade-in">
          <Glossary />
        </div>

        {/* Legislative Updates Section */}
        <div className="mb-12 animate-fade-in">
          <LegislativeUpdates />
        </div>

        {/* Compare & Calculator CTAs */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
          <Card className="bg-gradient-to-r from-secondary/20 to-secondary/5 border-secondary/30">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Порівняти Програми</h2>
                  <p className="text-muted-foreground text-sm">
                    Порівняйте умови кількох програм одночасно
                  </p>
                </div>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/compare">
                    Порівняти
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Універсальний Калькулятор</h2>
                  <p className="text-muted-foreground text-sm">
                    Розрахуйте іпотеку за програмою ЄОселя
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
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground animate-fade-in">
          <p>© 2024 Revolution - Агентство нерухомості. Всі права захищені.</p>
          <p className="mt-2">
            Калькулятори надають орієнтовні розрахунки. Точні умови уточнюйте в офіційних джерелах.
          </p>
        </footer>
      </main>

    </div>
  );
};

export default Programs;
