import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface DatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const parsed = parseISO(value);
      return !isNaN(parsed.getTime()) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full h-9",
          !selectedDate && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {selectedDate ? (
          <span className="font-medium font-mono text-foreground">
            {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
