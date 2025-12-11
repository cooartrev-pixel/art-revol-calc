import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Phone, User, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { banks } from "@/lib/banks-data";
import { formatCurrency } from "@/lib/mortgage-calculations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface ConsultationFormProps {
  propertyValue: number;
  loanAmount: number;
  loanTerm: number;
  interestRate: number;
  isGovernmentProgram: boolean;
}

const consultationSchema = z.object({
  name: z.string().trim().min(2, "Ім'я повинно містити мінімум 2 символи").max(100, "Ім'я занадто довге"),
  phone: z.string().trim().min(10, "Введіть коректний номер телефону").max(20, "Номер телефону занадто довгий"),
  email: z.string().trim().email("Некоректна email адреса").max(255, "Email занадто довгий").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Повідомлення занадто довге").optional(),
});

export function ConsultationForm({
  propertyValue,
  loanAmount,
  loanTerm,
  interestRate,
  isGovernmentProgram,
}: ConsultationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    selectedBank: "",
    includeCalculation: true,
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationResult = consultationSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      message: formData.message,
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("consultation_requests").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        property_value: formData.includeCalculation ? propertyValue : null,
        loan_amount: formData.includeCalculation ? loanAmount : null,
        loan_term: formData.includeCalculation ? loanTerm : null,
        interest_rate: formData.includeCalculation ? interestRate : null,
        selected_bank: formData.selectedBank || null,
        is_yeoselya: isGovernmentProgram,
        message: formData.message.trim() || null,
      });

      if (error) throw error;

      // Send notifications (non-blocking)
      supabase.functions.invoke("notify-consultation", {
        body: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          propertyValue: formData.includeCalculation ? propertyValue : undefined,
          loanAmount: formData.includeCalculation ? loanAmount : undefined,
          loanTerm: formData.includeCalculation ? loanTerm : undefined,
          interestRate: formData.includeCalculation ? interestRate : undefined,
          isYeoselya: isGovernmentProgram,
          selectedBank: formData.selectedBank || undefined,
          message: formData.message.trim() || undefined,
        },
      }).catch((notifyError) => {
        console.error("Notification error:", notifyError);
      });

      setIsSubmitted(true);
      toast({
        title: "Заявку надіслано!",
        description: "Наш агент зв'яжеться з вами найближчим часом.",
      });
    } catch (error) {
      console.error("Error submitting consultation request");
      toast({
        title: "Помилка",
        description: "Не вдалося надіслати заявку. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Дякуємо за заявку!</h3>
            <p className="text-muted-foreground mb-4">
              Наш агент зв'яжеться з вами найближчим часом для консультації.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  selectedBank: "",
                  includeCalculation: true,
                  message: "",
                });
              }}
            >
              Надіслати ще одну заявку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Заявка на консультацію
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Залиште заявку і наш агент зв'яжеться з вами для детальної консультації
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Ім'я *
              </Label>
              <Input
                id="name"
                placeholder="Ваше ім'я"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Телефон *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+380 XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                maxLength={20}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (необов'язково)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={255}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Обраний банк (необов'язково)</Label>
            <Select
              value={formData.selectedBank}
              onValueChange={(value) => setFormData({ ...formData, selectedBank: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Виберіть банк" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не визначився</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="includeCalculation" className="font-medium">
                Додати дані розрахунку
              </Label>
              <p className="text-sm text-muted-foreground">
                {formData.includeCalculation
                  ? `${formatCurrency(loanAmount)} на ${loanTerm} років під ${interestRate}%`
                  : "Дані розрахунку не будуть додані"}
              </p>
            </div>
            <Switch
              id="includeCalculation"
              checked={formData.includeCalculation}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, includeCalculation: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Додаткове повідомлення</Label>
            <Textarea
              id="message"
              placeholder="Опишіть ваші побажання або питання..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              maxLength={1000}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Надсилання...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Надіслати заявку
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
