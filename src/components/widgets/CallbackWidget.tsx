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

export const CallbackWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Замовити зворотний дзвінок"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Зворотний зв'язок</DialogTitle>
          <DialogDescription>
            Залиште ваші контактні дані і ми зв'яжемося з вами найближчим часом
          </DialogDescription>
        </DialogHeader>
        <CallbackForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
