import { Building, Phone, Mail, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Revolution</h1>
              <p className="text-sm text-muted-foreground">{t('header.agency')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a 
              href="tel:+380991234567" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              +380 99 123 45 67
            </a>
            <a 
              href="mailto:info@revolution.ua" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@revolution.ua
            </a>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  {t('header.admin')}
                </Link>
              </Button>
            )}
            {!user && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t('header.login')}</Link>
              </Button>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
