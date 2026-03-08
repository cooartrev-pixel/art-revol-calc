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
      className="fixed bottom-[104px] right-4 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-[#0088cc] hover:bg-[#0077b5] text-white animate-pulse hover:animate-none"
      aria-label="Написати в Telegram"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  );
};
