import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/ui/utils';

export function TabbedModule({
  defaultValue,
  children,
  className,
}: React.PropsWithChildren<{
  defaultValue: string;
  className?: string;
}>) {
  return (
    <Tabs
      className={cn('flex w-full flex-col gap-6', className)}
      defaultValue={defaultValue}
    >
      {children}
    </Tabs>
  );
}

export function TabbedModuleList({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <TabsList className={cn('kinder-tab-list', className)}>{children}</TabsList>
  );
}

export function TabbedModuleTrigger({
  value,
  children,
}: React.PropsWithChildren<{ value: string }>) {
  return (
    <TabsTrigger className="kinder-tab-trigger" value={value}>
      {children}
    </TabsTrigger>
  );
}

export function TabbedModuleContent({
  value,
  children,
  className,
}: React.PropsWithChildren<{ value: string; className?: string }>) {
  return (
    <TabsContent
      className={cn('mt-0 focus-visible:outline-none', className)}
      value={value}
    >
      {children}
    </TabsContent>
  );
}
