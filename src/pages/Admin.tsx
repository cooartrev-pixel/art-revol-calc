import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calculator, LogOut, Search, ArrowLeft, Filter, RefreshCw, Download, FileJson } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { BankTariffsCrud } from '@/components/admin/BankTariffsCrud';

interface ConsultationRequest {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  loan_amount: number | null;
  property_value: number | null;
  loan_term: number | null;
  interest_rate: number | null;
  is_yeoselya: boolean | null;
  selected_bank: string | null;
  message: string | null;
}

export default function Admin() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');

  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast({
          title: 'Доступ заборонено',
          description: 'У вас немає прав адміністратора',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Помилка завантаження',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchRequests();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.phone.includes(term) ||
          (r.email && r.email.toLowerCase().includes(term))
      );
    }

    if (filterBank !== 'all') {
      filtered = filtered.filter((r) => r.selected_bank === filterBank);
    }

    if (filterProgram !== 'all') {
      filtered = filtered.filter((r) =>
        filterProgram === 'yeoselya' ? r.is_yeoselya : !r.is_yeoselya
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, filterBank, filterProgram]);

  const uniqueBanks = [...new Set(requests.map((r) => r.selected_bank).filter(Boolean))];

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(value);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const exportToCSV = () => {
    const headers = ['Дата', 'Ім\'я', 'Телефон', 'Email', 'Програма', 'Банк', 'Сума кредиту', 'Вартість нерухомості', 'Термін (років)', 'Ставка (%)', 'Повідомлення'];
    const rows = filteredRequests.map(r => [
      format(new Date(r.created_at), 'dd.MM.yyyy HH:mm'),
      r.name,
      r.phone,
      r.email || '',
      r.is_yeoselya ? 'єОселя' : 'Комерційна',
      r.selected_bank || '',
      r.loan_amount?.toString() || '',
      r.property_value?.toString() || '',
      r.loan_term?.toString() || '',
      r.interest_rate?.toString() || '',
      r.message || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zajavky_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'CSV експортовано успішно' });
  };

  const exportToJSON = () => {
    const data = filteredRequests.map(r => ({
      date: r.created_at,
      name: r.name,
      phone: r.phone,
      email: r.email,
      program: r.is_yeoselya ? 'єОселя' : 'Комерційна',
      bank: r.selected_bank,
      loan_amount: r.loan_amount,
      property_value: r.property_value,
      loan_term_years: r.loan_term,
      interest_rate: r.interest_rate,
      message: r.message
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zajavky_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'JSON експортовано успішно' });
  };

  if (authLoading || (user && !isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">До калькулятора</span>
            </Link>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Панель адміністратора</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Вийти
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фільтри та пошук
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук за ім'ям, телефоном або email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBank} onValueChange={setFilterBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі банки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі банки</SelectItem>
                  {uniqueBanks.map((bank) => (
                    <SelectItem key={bank} value={bank!}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі програми" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі програми</SelectItem>
                  <SelectItem value="yeoselya">єОселя</SelectItem>
                  <SelectItem value="commercial">Комерційна</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>
              Заявки на консультацію ({filteredRequests.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredRequests.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToJSON} disabled={filteredRequests.length === 0}>
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Оновити
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Завантаження заявок...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {requests.length === 0 ? 'Заявок поки немає' : 'Заявок за заданими критеріями не знайдено'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Ім'я</TableHead>
                      <TableHead>Контакти</TableHead>
                      <TableHead>Програма</TableHead>
                      <TableHead>Банк</TableHead>
                      <TableHead className="text-right">Сума кредиту</TableHead>
                      <TableHead className="text-right">Вартість</TableHead>
                      <TableHead>Термін</TableHead>
                      <TableHead>Ставка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: uk })}
                        </TableCell>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{request.phone}</div>
                            {request.email && (
                              <div className="text-muted-foreground">{request.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.is_yeoselya ? 'default' : 'secondary'}>
                            {request.is_yeoselya ? 'єОселя' : 'Комерційна'}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.selected_bank || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(request.loan_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(request.property_value)}</TableCell>
                        <TableCell>{request.loan_term ? `${request.loan_term} р.` : '-'}</TableCell>
                        <TableCell>{request.interest_rate ? `${request.interest_rate}%` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
