"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  id,
}: DatePickerProps) {
  const [mounted, setMounted] = React.useState(false)

  // Only render on client to avoid hydration mismatch with dates
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Convert string value (YYYY-MM-DD) to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    // Parse YYYY-MM-DD string
    const parsed = new Date(value + 'T00:00:00')
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        id={id}
        variant="outline"
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{placeholder}</span>
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
