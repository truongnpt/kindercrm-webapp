'use client';

import * as React from 'react';

import { format, isValid, parse } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const ISO_DATE_FORMAT = 'yyyy-MM-dd';

function parseDateValue(value?: Date | string) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = parse(trimmed, ISO_DATE_FORMAT, new Date());

  return isValid(parsed) ? parsed : undefined;
}

function toIsoDateString(date?: Date) {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, ISO_DATE_FORMAT);
}

type DatePickerProps = {
  value?: Date | string;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: React.ComponentProps<typeof PopoverContent>['align'];
  dateFormat?: string;
  closeOnSelect?: boolean;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    'mode' | 'selected' | 'onSelect' | 'defaultMonth'
  >;
};

function DatePicker({
  value,
  onChange,
  onBlur,
  name,
  placeholder = 'Chọn ngày',
  disabled,
  className,
  align = 'start',
  dateFormat = 'dd/MM/yyyy',
  closeOnSelect = true,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          name={name}
          onBlur={onBlur}
          data-empty={!selectedDate}
          className={cn(
            'w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground',
            className,
          )}
        >
          {selectedDate ?
            format(selectedDate, dateFormat)
          : <span>{placeholder}</span>}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-auto p-0"
        data-slot="popover-content"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={(date) => {
            onChange?.(toIsoDateString(date));

            if (closeOnSelect) {
              setOpen(false);
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, type DatePickerProps };
