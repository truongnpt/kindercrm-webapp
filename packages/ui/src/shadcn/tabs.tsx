'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'inline-flex h-auto flex-wrap items-center gap-0.5 rounded-lg p-0.5',
  {
    variants: {
      variant: {
        /** TailAdmin ChartTab — pill segment control */
        default: 'bg-gray-100 dark:bg-gray-900',
        /** Bordered pill bar */
        outline:
          'border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50',
        /** Underline tabs (page-level navigation) */
        line: 'gap-1 rounded-none border-b border-gray-200 bg-transparent p-0 dark:border-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-all',
    'focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
          'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
          'dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white',
          'data-[state=active]:[&_svg]:text-primary',
        ],
        outline: [
          'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
          'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
          'dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white',
          'data-[state=active]:[&_svg]:text-primary',
        ],
        line: [
          'rounded-none border-b-2 border-transparent px-4 py-2.5 text-gray-500',
          'hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          'data-[state=active]:border-primary data-[state=active]:text-gray-900 data-[state=active]:shadow-none',
          'dark:data-[state=active]:text-white',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-hidden',
      'animate-in fade-in-0 duration-150',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
