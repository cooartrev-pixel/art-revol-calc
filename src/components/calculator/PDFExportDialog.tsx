import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileDown, Sun, Moon, BarChart3, Loader2, FileText, Minimize2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { PDFPageFormat, PDFDensity } from "@/lib/pdf-export";

interface PDFExportDialogProps {
  onExport: (options: { theme: 'light' | 'dark'; includeCharts: boolean; chartElements?: HTMLElement[]; pageFormat?: PDFPageFormat; density?: PDFDensity }) => Promise<void>;
  chartsContainerRef?: React.RefObject<HTMLDivElement>;
}

export function PDFExportDialog({ onExport, chartsContainerRef }: PDFExportDialogProps) {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [pageFormat, setPageFormat] = useState<PDFPageFormat>('a4');
  const [density, setDensity] = useState<PDFDensity>('standard');
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
      await onExport({ theme, includeCharts, chartElements, pageFormat, density });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [theme, includeCharts, onExport, chartsContainerRef, pageFormat, density]);

  const isUk = language === 'uk';

  const OptionButton = ({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

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
        <div className="space-y-4 py-3">
          {/* Theme selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isUk ? 'Стиль оформлення' : 'Report Style'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionButton
                selected={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={<Sun className={`h-5 w-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label={isUk ? 'Світла' : 'Light'}
              />
              <OptionButton
                selected={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={<Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label={isUk ? 'Темна' : 'Dark'}
              />
            </div>
          </div>

          {/* Page format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isUk ? 'Формат сторінки' : 'Page Format'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionButton
                selected={pageFormat === 'a4'}
                onClick={() => setPageFormat('a4')}
                icon={<FileText className={`h-5 w-5 ${pageFormat === 'a4' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label="A4 (210×297)"
              />
              <OptionButton
                selected={pageFormat === 'letter'}
                onClick={() => setPageFormat('letter')}
                icon={<FileText className={`h-5 w-5 ${pageFormat === 'letter' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label="Letter (216×279)"
              />
            </div>
          </div>

          {/* Density */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isUk ? 'Щільність' : 'Density'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionButton
                selected={density === 'standard'}
                onClick={() => setDensity('standard')}
                icon={<FileText className={`h-5 w-5 ${density === 'standard' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label={isUk ? 'Стандарт' : 'Standard'}
              />
              <OptionButton
                selected={density === 'compact'}
                onClick={() => setDensity('compact')}
                icon={<Minimize2 className={`h-5 w-5 ${density === 'compact' ? 'text-primary' : 'text-muted-foreground'}`} />}
                label={isUk ? 'Компакт' : 'Compact'}
              />
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
