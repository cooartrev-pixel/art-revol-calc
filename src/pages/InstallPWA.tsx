import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, ArrowLeft, Share, MoreVertical, Monitor, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "samsung" | "firefox" | "desktop-chrome" | "desktop-other";

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Firefox/.test(ua) && /Android/.test(ua)) return "firefox";
  if (/Android/.test(ua)) return "android";
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) return "desktop-chrome";
  return "desktop-other";
}

const InstallPWA = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [device] = useState<DeviceType>(detectDevice);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Pick up globally captured prompt
    const globalPrompt = (window as any).__pwaInstallPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
    }

    const onPromptReady = () => {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
    };

    window.addEventListener("pwa-prompt-ready", onPromptReady);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    (window as any).__pwaInstallPrompt = null;
  }, [deferredPrompt]);

  const texts = {
    uk: {
      title: "Встановити додаток",
      description: "Встановіть калькулятор на ваш пристрій для швидкого доступу",
      installed: "Додаток встановлено! ✅",
      installedDesc: "Ви можете знайти його на головному екрані вашого пристрою",
      installBtn: "Встановити додаток",
      backBtn: "Назад до калькулятора",
      features: [
        "Швидкий доступ з головного екрану",
        "Працює офлайн",
        "Автоматичні оновлення",
        "Займає мінімум місця"
      ],
      iosTitle: "Інструкція для iPhone / iPad",
      iosSteps: [
        "Відкрийте сайт у Safari (не в Chrome чи іншому браузері)",
        "Натисніть кнопку «Поділитися» (□↑) внизу екрану",
        "Прокрутіть вниз і виберіть «На Початковий екран»",
        "Натисніть «Додати» у верхньому правому куті"
      ],
      androidTitle: "Встановлення на Android",
      androidSteps: [
        "Натисніть кнопку «Встановити» нижче",
        "Або відкрийте меню браузера (⋮) → «Встановити додаток»",
        "Підтвердіть встановлення"
      ],
      samsungTitle: "Samsung Internet",
      samsungSteps: [
        "Натисніть меню (☰) внизу екрану",
        "Виберіть «Додати сторінку на» → «Головний екран»",
        "Підтвердіть додавання"
      ],
      firefoxTitle: "Firefox на Android",
      firefoxSteps: [
        "Натисніть меню (⋮) у правому верхньому куті",
        "Виберіть «Встановити»",
        "Підтвердіть встановлення"
      ],
      desktopTitle: "Встановлення на комп'ютер",
      desktopChromeSteps: [
        "Натисніть кнопку «Встановити» нижче",
        "Або натисніть іконку ⊕ в адресному рядку",
        "Підтвердіть встановлення"
      ],
      desktopOtherSteps: [
        "Відкрийте сайт у Google Chrome",
        "Натисніть іконку ⊕ в адресному рядку",
        "Або відкрийте меню (⋮) → «Встановити додаток»"
      ],
      noPromptHint: "Якщо кнопка «Встановити» не з'являється — скористайтесь інструкцією вище"
    },
    en: {
      title: "Install App",
      description: "Install the calculator on your device for quick access",
      installed: "App installed! ✅",
      installedDesc: "You can find it on your home screen",
      installBtn: "Install App",
      backBtn: "Back to Calculator",
      features: [
        "Quick access from home screen",
        "Works offline",
        "Automatic updates",
        "Minimal storage space"
      ],
      iosTitle: "Instructions for iPhone / iPad",
      iosSteps: [
        "Open the site in Safari (not Chrome or other browser)",
        "Tap the Share button (□↑) at the bottom",
        "Scroll down and select 'Add to Home Screen'",
        "Tap 'Add' in the top right corner"
      ],
      androidTitle: "Install on Android",
      androidSteps: [
        "Tap the 'Install' button below",
        "Or open browser menu (⋮) → 'Install app'",
        "Confirm installation"
      ],
      samsungTitle: "Samsung Internet",
      samsungSteps: [
        "Tap menu (☰) at the bottom",
        "Select 'Add page to' → 'Home screen'",
        "Confirm adding"
      ],
      firefoxTitle: "Firefox on Android",
      firefoxSteps: [
        "Tap menu (⋮) in the top right",
        "Select 'Install'",
        "Confirm installation"
      ],
      desktopTitle: "Install on Computer",
      desktopChromeSteps: [
        "Tap the 'Install' button below",
        "Or click the ⊕ icon in the address bar",
        "Confirm installation"
      ],
      desktopOtherSteps: [
        "Open the site in Google Chrome",
        "Click the ⊕ icon in the address bar",
        "Or open menu (⋮) → 'Install app'"
      ],
      noPromptHint: "If the 'Install' button doesn't appear, follow the instructions above"
    }
  };

  const t = texts[language];

  const renderSteps = (title: string, steps: string[], icon: React.ReactNode) => (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ol className="space-y-2 text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const renderDeviceInstructions = () => {
    switch (device) {
      case "ios":
        return renderSteps(t.iosTitle, t.iosSteps, <Share className="w-4 h-4" />);
      case "samsung":
        return renderSteps(t.samsungTitle, t.samsungSteps, <Globe className="w-4 h-4" />);
      case "firefox":
        return renderSteps(t.firefoxTitle, t.firefoxSteps, <Globe className="w-4 h-4" />);
      case "android":
        return renderSteps(t.androidTitle, t.androidSteps, <MoreVertical className="w-4 h-4" />);
      case "desktop-chrome":
        return renderSteps(t.desktopTitle, t.desktopChromeSteps, <Monitor className="w-4 h-4" />);
      case "desktop-other":
        return renderSteps(t.desktopTitle, t.desktopOtherSteps, <Monitor className="w-4 h-4" />);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            {isInstalled ? (
              <Check className="w-10 h-10 text-primary" />
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
              <ul className="space-y-2">
                {t.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {renderDeviceInstructions()}

              {deferredPrompt && (
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  {t.installBtn}
                </Button>
              )}

              {!deferredPrompt && device !== "ios" && (
                <p className="text-xs text-center text-muted-foreground">
                  {t.noPromptHint}
                </p>
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
