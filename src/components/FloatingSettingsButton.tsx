import { Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export function FloatingSettingsButton() {
  const { t } = useLanguage();
  const location = useLocation();

  // Hide on settings page itself
  if (location.pathname === "/settings") return null;

  return (
    <Button
      variant="outline"
      size="icon"
      asChild
      className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg border-2 md:hidden bg-card"
      aria-label={t("header.settings")}
    >
      <Link to="/settings">
        <Settings className="h-5 w-5" />
      </Link>
    </Button>
  );
}
