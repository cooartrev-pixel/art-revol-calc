import { Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect, useRef } from "react";

export function FloatingSettingsButton() {
  const { t } = useLanguage();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Show when scrolling up or near top; hide when scrolling down
      setVisible(y < 80 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname === "/settings") return null;

  return (
    <Button
      variant="outline"
      size="icon"
      asChild
      className={`fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg border-2 md:hidden bg-card transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
      }`}
      aria-label={t("header.settings")}
    >
      <Link to="/settings">
        <Settings className="h-5 w-5" />
      </Link>
    </Button>
  );
}
