'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { cn } from '@kit/ui/utils';

const SIZE_CLASS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
} as const;

export function KinderFormDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  footer,
  size = 'md',
  className,
}: React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}>) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          'kinder-bento-dialog max-h-[90vh] gap-0 overflow-hidden p-0',
          SIZE_CLASS[size],
          className,
        )}
      >
        <DialogHeader className="border-border/40 space-y-1 border-b px-6 py-5 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="max-h-[calc(90vh-12rem)] overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer ? (
          <DialogFooter className="border-border/40 border-t px-6 py-4 sm:justify-end">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
