import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function DateRangePicker({ checkIn, checkOut, onCheckInChange, onCheckOutChange, className }) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse dates safely
  const parseDate = (dateString) => {
    if (!dateString) return undefined
    try {
      // Handle ISO date strings properly
      return parseISO(dateString)
    } catch {
      return undefined
    }
  }

  const [range, setRange] = React.useState({
    from: parseDate(checkIn),
    to: parseDate(checkOut),
  })

  const today = React.useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    []
  )

  React.useEffect(() => {
    setRange({
      from: parseDate(checkIn),
      to: parseDate(checkOut),
    })
  }, [checkIn, checkOut])

  const handleDayClick = (day) => {
    const clicked = new Date(day.getFullYear(), day.getMonth(), day.getDate())

    let newFrom = range.from
    let newTo = range.to

    // If no dates selected yet OR both dates are selected,
    // start a new range with this day as the new check-in.
    if (!newFrom || (newFrom && newTo)) {
      newFrom = clicked
      newTo = undefined
    } else {
      // Only check-in is selected
      const fromTime = newFrom.getTime()
      const clickedTime = clicked.getTime()

      if (clickedTime === fromTime) {
        // Clicking the same check-in again: clear selection
        newFrom = undefined
        newTo = undefined
      } else if (clickedTime < fromTime) {
        // Clicked before current check-in: move check-in earlier
        newFrom = clicked
        newTo = undefined
      } else {
        // Clicked after current check-in: set/replace check-out
        newTo = clicked
      }
    }

    const nextRange = { from: newFrom, to: newTo }
    setRange(nextRange)

    if (newFrom) {
      onCheckInChange(format(newFrom, "yyyy-MM-dd"))
    } else {
      onCheckInChange("")
    }

    if (newTo) {
      onCheckOutChange(format(newTo, "yyyy-MM-dd"))
      // Close popover when both dates are selected with a small delay
      setTimeout(() => setIsOpen(false), 100)
    } else {
      onCheckOutChange("")
    }
  }

  const numberOfNights = range.from && range.to ? differenceInDays(range.to, range.from) : 0

  const displayText = React.useMemo(() => {
    if (range.from && range.to) {
      return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")} (${numberOfNights} ${numberOfNights === 1 ? 'night' : 'nights'})`
    }
    if (range.from) {
      return `${format(range.from, "MMM d, yyyy")} - Select checkout`
    }
    return "Select dates"
  }, [range, numberOfNights])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal h-[42px] hover:border-blue-400 cursor-pointer",
              !range.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range.from && range.from >= today ? range.from : today}
            selected={range}
            onDayClick={handleDayClick}
            numberOfMonths={2}
            disabled={(date) => date < today}
          />
          {range.from && range.to && (
            <div className="px-4 py-3 border-t bg-slate-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total stay:</span>
                <span className="font-semibold text-gray-900">
                  {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
                </span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
