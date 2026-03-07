import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, DollarSign, RefreshCw, Building, Landmark } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { useCurrencyRates, type RateSource } from "@/hooks/useCurrencyRates";
import { useLanguage } from "@/lib/i18n";

const Settings = () => {
  const { t } = useLanguage();
  const { 
    usd, eur, nbuUsd, nbuEur, universalbankUsd, universalbankEur,
    rateSource, setRateSource, 
    syncing, fetchRates, date 
  } = useCurrencyRates();

  const fmtRate = (rate: number | null) => rate ? rate.toFixed(2) : '—';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* Джерело курсу */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              {t('settings.rateSource')}
            </CardTitle>
            <CardDescription>{t('settings.rateSourceDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={rateSource}
              onValueChange={(v) => setRateSource(v as RateSource)}
              className="space-y-3"
            >
              <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${rateSource === 'nbu' ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}>
                <RadioGroupItem value="nbu" id="source-nbu" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="source-nbu" className="font-medium cursor-pointer flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    {t('settings.nbu')}
                    <Badge variant="secondary" className="text-[10px]">{t('settings.official')}</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{t('settings.nbuDesc')}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold">{fmtRate(nbuUsd)} ₴/$</span>
                    <span className="text-sm font-mono text-muted-foreground">{fmtRate(nbuEur)} ₴/€</span>
                  </div>
                </div>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${rateSource === 'universalbank' ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}>
                <RadioGroupItem value="universalbank" id="source-ub" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="source-ub" className="font-medium cursor-pointer flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t('settings.universalbank')}
                    <Badge variant="outline" className="text-[10px]">{t('settings.commercial')}</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{t('settings.universalbankDesc')}</p>
                  <div className="mt-2 flex items-center gap-3">
                    {universalbankUsd ? (
                      <span className="text-sm font-mono font-semibold">{fmtRate(universalbankUsd)} ₴/$</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">{t('settings.noData')}</span>
                    )}
                    {universalbankEur ? (
                      <span className="text-sm font-mono text-muted-foreground">{fmtRate(universalbankEur)} ₴/€</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </RadioGroup>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {date && <span>{t('settings.lastUpdate')}: {date}</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRates(false)}
                disabled={syncing}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {t('settings.syncNow')}
              </Button>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>{t('settings.activeRate')}:</strong>{' '}
                {rateSource === 'nbu' ? t('settings.nbu') : t('settings.universalbank')} — {fmtRate(usd)} ₴/$
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{t('settings.rateNote')}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
