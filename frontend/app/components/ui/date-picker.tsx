import * as React from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface DatePickerProps {
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
      const formatted = format(date, "yyyy-MM-dd");
      onChange?.(formatted);
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
          "inline-flex items-center justify-start rounded-md border border-input bg-background px-2.5 py-1 text-xs font-normal shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-full transition-colors",
          !value && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {selectedDate ? (
          <span className="text-foreground font-medium font-mono text-xs">
            {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
