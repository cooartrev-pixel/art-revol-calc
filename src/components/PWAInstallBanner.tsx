import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-banner-dismissed";

export const PWAInstallBanner = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Check global prompt
    const globalPrompt = (window as any).__pwaInstallPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setVisible(true);
    }

    const onReady = () => {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
      setVisible(true);
    };
    window.addEventListener("pwa-prompt-ready", onReady);

    // On iOS show link-based banner
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setVisible(true);
    }

    return () => window.removeEventListener("pwa-prompt-ready", onReady);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    (window as any).__pwaInstallPrompt = null;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  if (!visible) return null;

  const text = language === "uk"
    ? { cta: "Встановити", hint: "Додайте на головний екран для швидкого доступу" }
    : { cta: "Install", hint: "Add to home screen for quick access" };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-slide-up">
      <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{text.hint}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {deferredPrompt ? (
            <Button size="sm" onClick={handleInstall}>
              {text.cta}
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link to="/install">{text.cta}</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
