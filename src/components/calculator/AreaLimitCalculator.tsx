import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Ruler,
  Users,
  Home,
  Building2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getYeoselyaAreaLimits, getYeoselyaMaxPropertyValue, YEOSELYA_PRICE_PER_SQM, formatCurrency, type YeoselyaRegion } from "@/lib/mortgage-calculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AreaResult {
  baseMaxArea: number;
  maxArea: number;
  allowedOverpercent: number;
  propertyType: "apartment" | "house";
  propertyAge: "new" | "secondary";
  familySize: number;
}

function getRecommendations(result: AreaResult): string[] {
  const { maxArea, propertyType, familySize } = result;
  const recs: string[] = [];

  if (propertyType === "apartment") {
    if (maxArea <= 57.75) {
      recs.push("1-кімнатна квартира (35–55 м²)");
      recs.push("Студія (25–45 м²)");
    }
    if (maxArea > 57.75 && maxArea <= 80) {
      recs.push("1-кімнатна квартира (40–55 м²)");
      recs.push("2-кімнатна квартира (55–75 м²)");
    }
    if (maxArea > 80 && maxArea <= 100) {
      recs.push("2-кімнатна квартира (55–75 м²)");
      recs.push("3-кімнатна квартира (75–95 м²)");
    }
    if (maxArea > 100) {
      recs.push("3-кімнатна квартира (75–95 м²)");
      recs.push("4-кімнатна квартира (90–115 м²)");
    }
  } else {
    if (maxArea <= 68.75) {
      recs.push("Невеликий будинок (50–65 м²)");
    }
    if (maxArea > 68.75 && maxArea <= 95) {
      recs.push("Будинок 2-3 кімнати (65–90 м²)");
    }
    if (maxArea > 95) {
      recs.push("Будинок 3-4 кімнати (90–125 м²)");
    }
    recs.push("Таунхаус відповідного метражу");
  }

  return recs;
}

function getAreaBreakdown(familySize: number, propertyType: "apartment" | "house") {
  const base = propertyType === "house" ? 62.5 : 52.5;
  const maxCap = propertyType === "house" ? 125.5 : 115.5;
  const perExtra = 21;
  const extraMembers = Math.max(0, familySize - 2);

  const parts: { label: string; area: number }[] = [];
  parts.push({ label: familySize <= 2 ? `Базова норма (1-2 особи)` : `Базова норма (перші 2 особи)`, area: base });

  if (extraMembers > 0) {
    for (let i = 0; i < extraMembers; i++) {
      const memberNum = i + 3;
      parts.push({ label: `${memberNum}-й член сім'ї`, area: perExtra });
    }
  }

  const rawTotal = base + extraMembers * perExtra;
  const cappedTotal = Math.min(rawTotal, maxCap);
  const isCapped = rawTotal > maxCap;

  return { parts, rawTotal, cappedTotal, isCapped, maxCap };
}

export function AreaLimitCalculator() {
  const [familySize, setFamilySize] = useState(1);
  const [propertyType, setPropertyType] = useState<"apartment" | "house">("apartment");
  const [propertyAge, setPropertyAge] = useState<"new" | "secondary">("secondary");
  const [userArea, setUserArea] = useState<number | "">("");
  const [copied, setCopied] = useState(false);
  const [region, setRegion] = useState<YeoselyaRegion>('kyiv');

  const result = useMemo(() => {
    const limits = getYeoselyaAreaLimits(familySize, propertyType, propertyAge);
    return { ...limits, propertyType, propertyAge, familySize } as AreaResult;
  }, [familySize, propertyType, propertyAge]);

  const breakdown = useMemo(
    () => getAreaBreakdown(familySize, propertyType),
    [familySize, propertyType]
  );

  const recommendations = useMemo(() => getRecommendations(result), [result]);

  const areaCheck = useMemo(() => {
    if (userArea === "" || userArea <= 0) return null;
    const fits = userArea <= result.maxArea;
    const fitsBase = userArea <= result.baseMaxArea;
    return { fits, fitsBase, area: userArea };
  }, [userArea, result]);

  const areaPercent = useMemo(() => {
    if (userArea === "" || userArea <= 0) return 0;
    return Math.min(100, (userArea / result.maxArea) * 100);
  }, [userArea, result.maxArea]);

  // Animated progress value
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const target = areaPercent;
    const start = animatedPercent;
    const duration = 600;
    let startTime: number | null = null;

    cancelAnimationFrame(animationRef.current);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercent(start + (target - start) * eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaPercent]);

  const getProgressColor = (percent: number) => {
    if (percent <= 70) return "bg-chart-2";
    if (percent <= 90) return "bg-chart-4";
    if (percent <= 100) return "bg-primary";
    return "bg-destructive";
  };

  const copyResults = useCallback(() => {
    const propTypeLabel = propertyType === "apartment" ? "Квартира" : "Будинок";
    const propAgeLabel = propertyAge === "new" ? "Новобудова (до 3 р.)" : "Вторинне житло";
    
    let text = `🏠 Калькулятор площі ЄОселя\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👥 Склад сім'ї: ${familySize} ${familySize === 1 ? "особа" : familySize < 5 ? "особи" : "осіб"}\n`;
    text += `🏢 Тип: ${propTypeLabel}\n`;
    text += `📅 Вік: ${propAgeLabel}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📐 Базовий ліміт: ${result.baseMaxArea.toFixed(2)} м²\n`;
    if (result.allowedOverpercent > 0) {
      text += `➕ Допуск +${result.allowedOverpercent}%\n`;
    }
    text += `✅ Максимальна площа: ${result.maxArea.toFixed(2)} м²\n`;
    const maxValue = getYeoselyaMaxPropertyValue(result.maxArea, region);
    const regionInfo = YEOSELYA_PRICE_PER_SQM[region];
    text += `💰 Гранична вартість: ${formatCurrency(maxValue)} (${regionInfo.label}, ${regionInfo.pricePerSqm} грн/м²)\n`;
    
    if (userArea && userArea > 0) {
      const fits = userArea <= result.maxArea;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `🔍 Перевірка: ${userArea} м² — ${fits ? "✅ Підходить" : `❌ Перевищує на ${(userArea - result.maxArea).toFixed(2)} м²`}\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 Рекомендації:\n`;
    recommendations.forEach(r => { text += `  • ${r}\n`; });
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Скопійовано в буфер обміну!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [familySize, propertyType, propertyAge, result, userArea, recommendations, region]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ruler className="h-5 w-5 text-primary" />
          Калькулятор максимальної площі ЄОселя
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyResults}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Скопійовано" : "Копіювати"}
            </Button>
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-sm animate-in fade-in-0 zoom-in-95 duration-200" side="bottom">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Як розраховується ліміт площі?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    За програмою ЄОселя ліміт площі залежить від кількості членів сім'ї, типу нерухомості
                    та її віку. Квартира: 52,5 м² (1-2 особи) + 21 м² за кожного наступного, макс. 115,5 м².
                    Будинок: 62,5 м² + 21 м², макс. 125,5 м². Для новобудов (до 3 років) допускається +10%.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Family size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              Склад сім'ї
            </Label>
            <Input
              type="number"
              value={familySize}
              onChange={(e) => setFamilySize(Math.max(1, Math.min(10, Number(e.target.value))))}
              min={1}
              max={10}
              className="text-center text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground text-center">
              {familySize === 1 ? "особа" : familySize < 5 ? "особи" : "осіб"}
            </p>
          </div>

          {/* Property type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Тип нерухомості
            </Label>
            <RadioGroup
              value={propertyType}
              onValueChange={(v) => setPropertyType(v as "apartment" | "house")}
              className="space-y-1.5"
            >
              <div className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="apartment" id="area-apt" />
                <Label htmlFor="area-apt" className="text-sm cursor-pointer">Квартира</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="house" id="area-house" />
                <Label htmlFor="area-house" className="text-sm cursor-pointer">Будинок</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Property age */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Home className="h-4 w-4 text-muted-foreground" />
              Вік нерухомості
            </Label>
            <RadioGroup
              value={propertyAge}
              onValueChange={(v) => setPropertyAge(v as "new" | "secondary")}
              className="space-y-1.5"
            >
              <div className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="new" id="area-new" />
                <Label htmlFor="area-new" className="text-sm cursor-pointer">Новобудова (до 3 р.)</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="secondary" id="area-sec" />
                <Label htmlFor="area-sec" className="text-sm cursor-pointer">Вторинне житло</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Region selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Регіон (гранична вартість м²)
          </Label>
          <Select value={region} onValueChange={(v) => setRegion(v as YeoselyaRegion)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(YEOSELYA_PRICE_PER_SQM).map(([key, { label, pricePerSqm }]) => (
                <SelectItem key={key} value={key}>
                  {label} — {pricePerSqm.toLocaleString('uk-UA')} грн/м²
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Result */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Максимально допустима площа:</span>
            <span className="text-2xl font-bold text-primary">{result.maxArea.toFixed(2)} м²</span>
          </div>

          {result.allowedOverpercent > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 text-primary" />
              <span>
                Базовий ліміт {result.baseMaxArea.toFixed(2)} м² + {result.allowedOverpercent}% допуск для новобудов
              </span>
            </div>
          )}

          {/* Max property value */}
          <div className="flex items-center justify-between pt-1 border-t border-primary/10">
            <span className="text-sm font-medium text-foreground">Гранична вартість нерухомості:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(getYeoselyaMaxPropertyValue(result.maxArea, region))}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>
              {result.maxArea.toFixed(2)} м² × {YEOSELYA_PRICE_PER_SQM[region].pricePerSqm.toLocaleString('uk-UA')} грн/м² ({YEOSELYA_PRICE_PER_SQM[region].label})
            </span>
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 pt-1">
            {breakdown.parts.map((part, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{part.label}</span>
                <span className="font-medium">+{part.area} м²</span>
              </div>
            ))}
            {breakdown.isCapped && (
              <div className="flex items-center justify-between text-sm text-destructive">
                <span>Обмежено максимумом</span>
                <span className="font-medium">{breakdown.maxCap} м²</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Базовий ліміт</span>
              <span>{result.baseMaxArea.toFixed(2)} м²</span>
            </div>
            {result.allowedOverpercent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Допуск +{result.allowedOverpercent}%</span>
                <span className="font-medium text-primary">= {result.maxArea.toFixed(2)} м²</span>
              </div>
            )}
          </div>
        </div>

        {/* Area check */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Перевірити площу об'єкта</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={userArea}
              onChange={(e) => setUserArea(e.target.value ? Number(e.target.value) : "")}
              placeholder="Введіть площу (м²)"
              className="max-w-[200px]"
              min={1}
            />
            <span className="text-sm text-muted-foreground">м²</span>
            {areaCheck && (
              areaCheck.fits ? (
                <Badge className="bg-success text-success-foreground gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Підходить
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Перевищує ліміт
                </Badge>
              )
            )}
          </div>

          {/* Progress bar */}
          {userArea !== "" && userArea > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0 м²</span>
                <span className="font-medium text-foreground">
                  {Math.round(animatedPercent)}% від ліміту
                </span>
                <span>{result.maxArea.toFixed(2)} м²</span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${getProgressColor(animatedPercent)}`}
                  style={{ width: `${Math.min(animatedPercent, 100)}%` }}
                />
                {animatedPercent > 100 && (
                  <div
                    className="absolute top-0 right-0 h-full bg-destructive/20 rounded-r-full animate-pulse"
                    style={{ width: `${Math.min((animatedPercent - 100) / animatedPercent * 100, 30)}%` }}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-2 inline-block" /> до 70%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-4 inline-block" /> 70-90%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> 90-100%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> понад ліміт</span>
              </div>
            </div>
          )}

          {areaCheck && !areaCheck.fits && (
            <Alert className="py-2 border-destructive/30 bg-destructive/5">
              <AlertDescription className="text-xs text-destructive/90">
                Площа {areaCheck.area} м² перевищує ліміт на {(areaCheck.area - result.maxArea).toFixed(2)} м².
                Необхідно обрати менший об'єкт — доплата не можлива.
              </AlertDescription>
            </Alert>
          )}
          {areaCheck && areaCheck.fits && !areaCheck.fitsBase && result.allowedOverpercent > 0 && (
            <Alert className="py-2 border-primary/30 bg-primary/5">
              <AlertDescription className="text-xs text-primary/80">
                Площа вписується завдяки 10% допуску для новобудов. Базовий ліміт — {result.baseMaxArea.toFixed(2)} м².
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Recommendations */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Що можна придбати
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-md text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {rec}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
