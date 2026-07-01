'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@kit/ui/command';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import type { navigationConfig } from '~/config/navigation.config';

type NavItem = {
  label: string;
  path: string;
};

export function WorkspaceSearch({
  navigation,
  className,
}: {
  navigation: typeof navigationConfig;
  className?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = navigation.routes.flatMap((group) => {
    if (!('children' in group)) {
      return [];
    }

    return group.children.map((child) => ({
      label: t(child.label),
      path: child.path,
    }));
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        className={cn(
          'text-muted-foreground hover:text-foreground hidden h-10 w-full max-w-md justify-start gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 font-normal shadow-none md:flex',
          className,
        )}
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <Search className="size-4 shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left text-sm">
          <Trans i18nKey="kinder:workspace.searchPlaceholder" />
        </span>
        <kbd className="bg-background text-muted-foreground hidden rounded-md border px-1.5 py-0.5 text-[10px] font-medium lg:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={t('kinder:workspace.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>
            <Trans i18nKey="kinder:workspace.searchEmpty" />
          </CommandEmpty>
          <CommandGroup heading={t('kinder:workspace.searchGroup')}>
            {items.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => {
                  setOpen(false);
                  router.push(item.path);
                }}
                value={`${item.label} ${item.path}`}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
}
