import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type BankTariff = Tables<'bank_tariffs'>;

export function useBankTariffs() {
  return useQuery({
    queryKey: ['bank-tariffs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_tariffs')
        .select('*')
        .eq('is_active', true)
        .order('bank_name');
      if (error) throw error;
      return data as BankTariff[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBankTariffsAdmin() {
  return useQuery({
    queryKey: ['bank-tariffs-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_tariffs')
        .select('*')
        .order('bank_name');
      if (error) throw error;
      return data as BankTariff[];
    },
  });
}

export function useUpdateBankTariff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'bank_tariffs'> }) => {
      const { data, error } = await supabase
        .from('bank_tariffs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-tariffs'] });
      queryClient.invalidateQueries({ queryKey: ['bank-tariffs-admin'] });
    },
  });
}
