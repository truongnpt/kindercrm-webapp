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
} from '@kit/ui/command';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import type { navigationConfig } from '~/config/navigation.config';

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

  const groups = navigation.routes.flatMap((group) => {
    if (!('children' in group) || group.children.length === 0) {
      return [];
    }

    return [
      {
        label: t(group.label),
        items: group.children.map((child) => ({
          label: t(child.label),
          path: child.path,
        })),
      },
    ];
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
        className={cn('kinder-search-trigger hidden md:flex', className)}
        onClick={() => setOpen(true)}
        type="button"
        variant="ghost"
      >
        <Search className="size-4 shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left">
          <Trans i18nKey="kinder:workspace.searchPlaceholder" />
        </span>
        <kbd className="kinder-search-kbd">⌘K</kbd>
      </Button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={t('kinder:workspace.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>
            <Trans i18nKey="kinder:workspace.searchEmpty" />
          </CommandEmpty>
          {groups.map((group) => (
            <CommandGroup heading={group.label} key={group.label}>
              {group.items.map((item) => (
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
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
