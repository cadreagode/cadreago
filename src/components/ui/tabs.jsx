import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { value, onValueChange })
      }
      return child
    })}
  </div>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            currentValue: value,
            onValueChange
          })
        }
        return child
      })}
    </div>
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, currentValue, onValueChange, children, badge, ...props }, ref) => {
  const isActive = currentValue === value

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm md:text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative border-b-2",
        isActive
          ? "border-blue-600 text-blue-700 bg-background"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-background/60",
        className
      )}
      {...props}
    >
      {children}
      {badge > 0 && (
        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, currentValue, ...props }, ref) => {
  if (currentValue !== value) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
