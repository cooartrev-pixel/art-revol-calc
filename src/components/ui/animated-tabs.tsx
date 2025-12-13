import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const AnimatedTabs = TabsPrimitive.Root;

interface AnimatedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  activeIndex?: number;
  tabCount?: number;
}

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  AnimatedTabsListProps
>(({ className, children, ...props }, ref) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [tabWidths, setTabWidths] = React.useState<number[]>([]);
  const tabsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (tabsRef.current) {
      const tabs = tabsRef.current.querySelectorAll('[role="tab"]');
      const widths = Array.from(tabs).map((tab) => (tab as HTMLElement).offsetWidth);
      setTabWidths(widths);
    }
  }, [children]);

  const handleTabChange = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const indicatorLeft = React.useMemo(() => {
    return tabWidths.slice(0, activeIndex).reduce((acc, width) => acc + width, 0);
  }, [activeIndex, tabWidths]);

  const indicatorWidth = tabWidths[activeIndex] || 0;

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-12 md:h-14 items-center justify-center rounded-lg bg-muted p-1.5 text-muted-foreground shadow-md border border-border/50",
        className,
      )}
      {...props}
    >
      <div ref={tabsRef} className="relative flex w-full">
        {/* Animated indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${indicatorLeft}px`,
            width: `${indicatorWidth}px`,
          }}
        />
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ onSelect?: () => void }>, {
              onSelect: () => handleTabChange(index),
            });
          }
          return child;
        })}
      </div>
    </TabsPrimitive.List>
  );
});
AnimatedTabsList.displayName = "AnimatedTabsList";

interface AnimatedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  onSelect?: () => void;
}

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimatedTabsTriggerProps
>(({ className, onSelect, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect?.();
    onClick?.(e);
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      onClick={handleClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium ring-offset-background transition-all duration-200",
        "data-[state=active]:text-primary data-[state=active]:font-semibold",
        "data-[state=inactive]:text-muted-foreground hover:text-foreground/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
AnimatedTabsTrigger.displayName = "AnimatedTabsTrigger";

const AnimatedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[state=active]:animate-fade-in",
      className,
    )}
    {...props}
  />
));
AnimatedTabsContent.displayName = "AnimatedTabsContent";

export { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent };
