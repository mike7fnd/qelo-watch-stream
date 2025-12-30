
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const listRef = React.useRef<HTMLDivElement>(null);
  const localRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  React.useEffect(() => {
    const currentRef = localRef.current ?? listRef.current;
    if (!currentRef) return;

    const setIndicator = () => {
      const trigger = currentRef.querySelector(`[data-state="active"]`) as HTMLElement | null;
      if (trigger) {
          const { offsetLeft, clientWidth } = trigger;
          setIndicatorStyle({ left: offsetLeft, width: clientWidth });
      }
    };

    setIndicator(); // Set initial position

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
                setIndicator();
                break;
            }
        }
    });

    Array.from(currentRef.children).forEach(child => {
        if (child.getAttribute('role') === 'tab') {
            observer.observe(child, { attributes: true, attributeFilter: ['data-state'] });
        }
    });

    return () => observer.disconnect();
  }, [children]); // Re-run when children change to re-attach observer

  return (
    <TabsPrimitive.List
      ref={(el) => {
        listRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-[30px] bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
        <span
            className="absolute h-8 rounded-[30px] bg-background shadow-sm transition-all duration-500 ease-spring"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
        {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-[30px] px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
