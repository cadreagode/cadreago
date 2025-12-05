import * as React from "react"
import { Users, Plus, Minus } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function GuestPicker({ adults, children, onAdultsChange, onChildrenChange, className }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const totalGuests = adults + children

  const displayText = React.useMemo(() => {
    const parts = []
    if (adults > 0) {
      parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`)
    }
    if (children > 0) {
      parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`)
    }
    return parts.length > 0 ? parts.join(', ') : 'Select guests'
  }, [adults, children])

  const handleIncrement = (type) => {
    if (type === 'adults' && adults < 10) {
      onAdultsChange(adults + 1)
    } else if (type === 'children' && children < 10) {
      onChildrenChange(children + 1)
    }
  }

  const handleDecrement = (type) => {
    if (type === 'adults' && adults > 1) {
      onAdultsChange(adults - 1)
    } else if (type === 'children' && children > 0) {
      onChildrenChange(children - 1)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="guests"
            variant={"outline"}
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal h-[42px] hover:border-blue-400 cursor-pointer",
              totalGuests === 0 && "text-muted-foreground"
            )}
          >
            <Users className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start" sideOffset={8}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Adults</p>
                <p className="text-xs text-gray-500">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleDecrement('adults')}
                  disabled={adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{adults}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleIncrement('adults')}
                  disabled={adults >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Children</p>
                  <p className="text-xs text-gray-500">Ages 2-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleDecrement('children')}
                    disabled={children <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{children}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleIncrement('children')}
                    disabled={children >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
