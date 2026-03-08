import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CallbackForm } from "./CallbackForm";
import { useLanguage } from "@/lib/i18n";

export const CallbackWidget = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
          aria-label={t('callback.title')}
        >
          <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('callback.title')}</DialogTitle>
          <DialogDescription>
            {t('callback.description')}
          </DialogDescription>
        </DialogHeader>
        <CallbackForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};