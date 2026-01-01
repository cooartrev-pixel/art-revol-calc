import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const AnimatedTabs = TabsPrimitive.Root;

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const updateIndicator = React.useCallback(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-state="active"]') as HTMLElement;
      if (activeTab) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        setIndicatorStyle({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
        });
      }
    }
  }, []);

  React.useEffect(() => {
    updateIndicator();
    
    // Create observer to watch for data-state changes
    const observer = new MutationObserver(updateIndicator);
    if (tabsRef.current) {
      observer.observe(tabsRef.current, { 
        attributes: true, 
        subtree: true, 
        attributeFilter: ['data-state'] 
      });
    }
    
    // Update on resize
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator, children]);

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
        {/* Animated underline indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        {/* Animated background indicator */}
        <div
          className="absolute top-0 bottom-0 bg-background rounded-md shadow-sm transition-all duration-300 ease-out -z-10"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        {children}
      </div>
    </TabsPrimitive.List>
  );
});
AnimatedTabsList.displayName = "AnimatedTabsList";

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
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