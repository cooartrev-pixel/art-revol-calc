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
import { useLanguage } from "@/lib/i18n";

interface CallbackFormProps {
  onSuccess?: () => void;
}

export const CallbackForm = ({ onSuccess }: CallbackFormProps) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const callbackSchema = z.object({
    name: z.string().trim().min(2, t('validation.nameMin')).max(100),
    phone: z.string().trim().min(10, t('validation.phoneInvalid')).max(20),
    message: z.string().trim().max(500).optional(),
  });

  type CallbackFormData = z.infer<typeof callbackSchema>;

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
        message: data.message || t('callback.defaultMessage'),
      });

      if (error) throw error;

      // Send notifications
      await supabase.functions.invoke("notify-consultation", {
        body: {
          name: data.name,
          phone: data.phone,
          message: data.message || t('callback.defaultMessage'),
        },
      });

      toast({
        title: t('callback.success'),
        description: t('callback.successDesc'),
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast({
        title: t('callback.error'),
        description: t('callback.errorDesc'),
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
              <FormLabel>{t('form.name')} {t('form.required')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.namePlaceholder')} {...field} />
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
              <FormLabel>{t('form.phone')} {t('form.required')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.phonePlaceholder')} {...field} />
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
              <FormLabel>{t('form.message')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('callback.messagePlaceholder')}
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
          {t('callback.submit')}
        </Button>
      </form>
    </Form>
  );
};