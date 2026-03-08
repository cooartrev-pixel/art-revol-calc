import { Building, Phone, Mail, Shield, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary rounded-lg">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Revolution</h1>
              <p className="text-sm text-muted-foreground">{t('header.agency')}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
              <Link to="/settings" aria-label={t('header.settings')} title={t('header.settings')}>
                <Settings className="h-4 w-4" />
                <span>{t('header.settings')}</span>
              </Link>
            </Button>


            {!loading && isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  {t('header.admin')}
                </Link>
              </Button>
            )}

            {!loading && !user && (
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
