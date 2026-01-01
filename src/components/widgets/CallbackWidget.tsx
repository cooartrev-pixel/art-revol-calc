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
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
          aria-label={t('callback.title')}
        >
          <Phone className="h-6 w-6" />
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