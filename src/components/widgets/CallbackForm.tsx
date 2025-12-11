import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const callbackSchema = z.object({
  name: z.string().trim().min(2, "Ім'я має містити мінімум 2 символи").max(100),
  phone: z.string().trim().min(10, "Введіть коректний номер телефону").max(20),
  message: z.string().trim().max(500).optional(),
});

type CallbackFormData = z.infer<typeof callbackSchema>;

interface CallbackFormProps {
  onSuccess?: () => void;
}

export const CallbackForm = ({ onSuccess }: CallbackFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CallbackFormData>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: CallbackFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("consultation_requests").insert({
        name: data.name,
        phone: data.phone,
        message: data.message || "Запит на зворотний дзвінок",
      });

      if (error) throw error;

      // Send notifications
      await supabase.functions.invoke("notify-consultation", {
        body: {
          name: data.name,
          phone: data.phone,
          message: data.message || "Запит на зворотний дзвінок",
        },
      });

      toast({
        title: "Заявку відправлено!",
        description: "Ми зв'яжемося з вами найближчим часом",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося відправити заявку. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ім'я *</FormLabel>
              <FormControl>
                <Input placeholder="Ваше ім'я" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон *</FormLabel>
              <FormControl>
                <Input placeholder="+380 XX XXX XX XX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Повідомлення</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Опишіть ваше питання (необов'язково)"
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Надіслати заявку
        </Button>
      </form>
    </Form>
  );
};
