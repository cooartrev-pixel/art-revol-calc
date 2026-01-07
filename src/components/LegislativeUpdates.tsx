import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Newspaper, Building2, Landmark, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface LegislativeUpdate {
  id: string;
  title: string;
  content: string;
  source_name: string;
  source_url: string | null;
  category: string;
  published_at: string;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  legislation: { 
    label: 'Законодавство', 
    icon: <Landmark className="h-3 w-3" />, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  },
  banking: { 
    label: 'Банківська сфера', 
    icon: <Building2 className="h-3 w-3" />, 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
  finance: { 
    label: 'Фінанси', 
    icon: <Newspaper className="h-3 w-3" />, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
  },
  general: { 
    label: 'Загальне', 
    icon: <Newspaper className="h-3 w-3" />, 
    color: 'bg-muted text-muted-foreground' 
  },
};

// Official source links
const officialSources = [
  { name: 'Верховна Рада України', url: 'https://www.rada.gov.ua/news' },
  { name: 'НБУ', url: 'https://bank.gov.ua/ua/news' },
  { name: 'Мінфін', url: 'https://mof.gov.ua/uk/news' },
];

export function LegislativeUpdates() {
  const { isAdmin, session } = useAuth();
  const [updates, setUpdates] = useState<LegislativeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setError(null);
      let query = supabase
        .from('legislative_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setUpdates(data || []);
      
      // Set last updated date from the most recent created_at
      if (data && data.length > 0) {
        const mostRecentCreated = data.reduce((latest, update) => {
          const updateDate = new Date(update.created_at);
          return updateDate > latest ? updateDate : latest;
        }, new Date(data[0].created_at));
        setLastUpdated(mostRecentCreated.toISOString());
      }
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError('Не вдалося завантажити новини');
    } finally {
      setLoading(false);
    }
  };

  const refreshFromSources = async () => {
    setRefreshing(true);
    try {
      // Admin users can trigger a full refresh from RSS sources
      if (isAdmin && session?.access_token) {
        const { error } = await supabase.functions.invoke('fetch-legislative-updates', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        if (error) throw error;
      }
      // All users can refresh the display from database
      await fetchUpdates();
    } catch (err) {
      console.error('Error refreshing updates:', err);
      setError('Не вдалося оновити новини');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [selectedCategory]);

  const categories = Object.entries(categoryConfig);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5 text-primary" />
            Зміни у законодавстві
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshFromSources}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Оновити
          </Button>
        </div>
        
        {/* Last updated date */}
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            <span>Останнє оновлення: {format(new Date(lastUpdated), 'd MMMM yyyy, HH:mm', { locale: uk })}</span>
          </div>
        )}
        
        {/* Official source links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2">
          <span className="text-muted-foreground">Офіційні джерела:</span>
          {officialSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {source.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge 
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Всі
          </Badge>
          {categories.map(([key, { label, icon }]) => (
            <Badge 
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setSelectedCategory(key)}
            >
              {icon}
              {label}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Новин поки немає</p>
            <p className="text-sm">Натисніть "Оновити" для завантаження актуальних новин</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {updates.map((update) => {
                const config = categoryConfig[update.category] || categoryConfig.general;
                return (
                  <div 
                    key={update.id} 
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`${config.color} flex items-center gap-1`}>
                        {config.icon}
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(update.published_at), 'd MMM yyyy', { locale: uk })}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                      {update.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {update.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Джерело: {update.source_name}
                      </span>
                      {update.source_url && (
                        <a 
                          href={update.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Детальніше
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}