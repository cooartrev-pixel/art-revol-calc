import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBankTariffsAdmin, useUpdateBankTariff, type BankTariff } from '@/hooks/useBankTariffs';
import { RefreshCw, Pencil, Building2 } from 'lucide-react';

export function BankTariffsCrud() {
  const { data: tariffs, isLoading, refetch } = useBankTariffsAdmin();
  const updateMutation = useUpdateBankTariff();
  const { toast } = useToast();
  const [editing, setEditing] = useState<BankTariff | null>(null);
  const [form, setForm] = useState<Partial<BankTariff>>({});

  const openEdit = (tariff: BankTariff) => {
    setEditing(tariff);
    setForm({ ...tariff });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        updates: {
          issuance_commission_pct: Number(form.issuance_commission_pct),
          account_opening_fee: Number(form.account_opening_fee),
          transfer_fee: Number(form.transfer_fee),
          property_insurance_pct: Number(form.property_insurance_pct),
          war_risk_insurance_pct: Number(form.war_risk_insurance_pct),
          appraisal_avg_cost: Number(form.appraisal_avg_cost),
          max_loan_amount: Number(form.max_loan_amount),
          min_down_payment_pct: Number(form.min_down_payment_pct),
          min_down_payment_new_build_pct: Number(form.min_down_payment_new_build_pct),
          max_term_years: Number(form.max_term_years),
          processing_time: form.processing_time,
          is_active: form.is_active,
        },
      });
      toast({ title: 'Тариф оновлено успішно' });
      setEditing(null);
    } catch (err: any) {
      toast({ title: 'Помилка', description: err.message, variant: 'destructive' });
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(v);

  const field = (label: string, key: keyof BankTariff, opts?: { step?: number; suffix?: string }) => (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="number"
          value={(form[key] as number) ?? ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          step={opts?.step ?? 1}
          className="h-9"
        />
        {opts?.suffix && <span className="text-sm text-muted-foreground">{opts.suffix}</span>}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Банківські тарифи ({tariffs?.length ?? 0})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Оновити
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Банк</TableHead>
                  <TableHead>Комісія видачі</TableHead>
                  <TableHead>Відкриття рах.</TableHead>
                  <TableHead>Страхування</TableHead>
                  <TableHead>Воєнні ризики</TableHead>
                  <TableHead>Оцінка</TableHead>
                  <TableHead>Макс. сума</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.bank_name}</TableCell>
                    <TableCell>{t.issuance_commission_pct}%</TableCell>
                    <TableCell>{fmt(t.account_opening_fee)} ₴</TableCell>
                    <TableCell>{t.property_insurance_pct}%</TableCell>
                    <TableCell>{t.war_risk_insurance_pct}%</TableCell>
                    <TableCell>{fmt(t.appraisal_avg_cost)} ₴</TableCell>
                    <TableCell>{fmt(t.max_loan_amount)} ₴</TableCell>
                    <TableCell>
                      <Badge variant={t.is_active ? 'default' : 'secondary'}>
                        {t.is_active ? 'Активний' : 'Вимкнено'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редагування: {editing?.bank_name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {field('Комісія видачі', 'issuance_commission_pct', { step: 0.01, suffix: '%' })}
              {field('Відкриття рахунку', 'account_opening_fee', { suffix: '₴' })}
              {field('Переказ', 'transfer_fee', { suffix: '₴' })}
              {field('Страхування майна', 'property_insurance_pct', { step: 0.01, suffix: '%' })}
              {field('Воєнні ризики', 'war_risk_insurance_pct', { step: 0.01, suffix: '%' })}
              {field('Оцінка', 'appraisal_avg_cost', { suffix: '₴' })}
              {field('Макс. сума кредиту', 'max_loan_amount', { suffix: '₴' })}
              {field('Мін. внесок (вторинка)', 'min_down_payment_pct', { step: 1, suffix: '%' })}
              {field('Мін. внесок (новобуд.)', 'min_down_payment_new_build_pct', { step: 1, suffix: '%' })}
              {field('Макс. термін', 'max_term_years', { suffix: 'років' })}
              <div>
                <Label className="text-xs text-muted-foreground">Термін розгляду</Label>
                <Input
                  value={form.processing_time ?? ''}
                  onChange={(e) => setForm({ ...form, processing_time: e.target.value })}
                  className="h-9 mt-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs text-muted-foreground">Активний</Label>
                <Switch
                  checked={form.is_active ?? true}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Скасувати</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Збереження...' : 'Зберегти'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
