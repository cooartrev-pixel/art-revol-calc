import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, ArrowLeft, Share, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const texts = {
    uk: {
      title: "Встановити додаток",
      description: "Встановіть калькулятор на ваш пристрій для швидкого доступу",
      installed: "Додаток встановлено!",
      installedDesc: "Ви можете знайти його на головному екрані вашого пристрою",
      installBtn: "Встановити додаток",
      backBtn: "Назад до калькулятора",
      features: [
        "Швидкий доступ з головного екрану",
        "Працює офлайн",
        "Не потребує оновлень",
        "Займає мінімум місця"
      ],
      iosTitle: "Інструкція для iPhone/iPad",
      iosSteps: [
        "Натисніть кнопку «Поділитися»",
        "Виберіть «На Початковий екран»",
        "Натисніть «Додати»"
      ],
      androidTitle: "Встановіть на Android",
      chromeHint: "Натисніть кнопку нижче або відкрийте меню браузера (⋮) та виберіть «Встановити додаток»"
    },
    en: {
      title: "Install App",
      description: "Install the calculator on your device for quick access",
      installed: "App installed!",
      installedDesc: "You can find it on your home screen",
      installBtn: "Install App",
      backBtn: "Back to Calculator",
      features: [
        "Quick access from home screen",
        "Works offline",
        "No updates required",
        "Minimal storage space"
      ],
      iosTitle: "Instructions for iPhone/iPad",
      iosSteps: [
        "Tap the Share button",
        "Select 'Add to Home Screen'",
        "Tap 'Add'"
      ],
      androidTitle: "Install on Android",
      chromeHint: "Tap the button below or open browser menu (⋮) and select 'Install app'"
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            {isInstalled ? (
              <Check className="w-10 h-10 text-success" />
            ) : (
              <Smartphone className="w-10 h-10 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isInstalled ? t.installed : t.title}
          </CardTitle>
          <CardDescription>
            {isInstalled ? t.installedDesc : t.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isInstalled && (
            <>
              {/* Features list */}
              <ul className="space-y-2">
                {t.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* iOS Instructions */}
              {isIOS && (
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    {t.iosTitle}
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {t.iosSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Android / Chrome Install Button */}
              {!isIOS && (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <MoreVertical className="w-4 h-4" />
                      {t.androidTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t.chromeHint}</p>
                  </div>

                  {deferredPrompt && (
                    <Button onClick={handleInstallClick} className="w-full" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      {t.installBtn}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backBtn}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPWA;
