import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TelegramWidgetProps {
  botUsername: string;
}

export const TelegramWidget = ({ botUsername }: TelegramWidgetProps) => {
  const handleClick = () => {
    window.open(`https://t.me/${botUsername}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-[#0088cc] hover:bg-[#0077b5] text-white animate-pulse hover:animate-none"
      aria-label="Написати в Telegram"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};
