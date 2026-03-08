import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileDown, Sun, Moon, BarChart3, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface PDFExportDialogProps {
  onExport: (options: { theme: 'light' | 'dark'; includeCharts: boolean; chartElements?: HTMLElement[] }) => Promise<void>;
  chartsContainerRef?: React.RefObject<HTMLDivElement>;
}

export function PDFExportDialog({ onExport, chartsContainerRef }: PDFExportDialogProps) {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      let chartElements: HTMLElement[] = [];
      if (includeCharts && chartsContainerRef?.current) {
        const cards = chartsContainerRef.current.querySelectorAll('.recharts-responsive-container');
        chartElements = Array.from(cards).map(el => el.parentElement!).filter(Boolean);
      }
      await onExport({ theme, includeCharts, chartElements });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [theme, includeCharts, onExport, chartsContainerRef]);

  const isUk = language === 'uk';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          {isUk ? 'Експорт у PDF' : 'Export PDF'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isUk ? 'Налаштування PDF звіту' : 'PDF Report Settings'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Theme selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {isUk ? 'Стиль оформлення' : 'Report Style'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Sun className={`h-6 w-6 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{isUk ? 'Світла' : 'Light'}</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Moon className={`h-6 w-6 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{isUk ? 'Темна' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* Charts toggle */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="include-charts" className="text-sm cursor-pointer">
                {isUk ? 'Додати графіки' : 'Include charts'}
              </Label>
            </div>
            <Switch
              id="include-charts"
              checked={includeCharts}
              onCheckedChange={setIncludeCharts}
            />
          </div>

          {/* Export button */}
          <Button 
            onClick={handleExport} 
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUk ? 'Формування...' : 'Generating...'}
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                {isUk ? 'Завантажити PDF' : 'Download PDF'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
