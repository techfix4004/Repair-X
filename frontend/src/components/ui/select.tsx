import * as React from "react"
import { cn } from "../../lib/utils"

// Select Components
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
        }
        return child;
      })}
    </div>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
  onValueChange?: (value: string) => void
}

export function SelectTrigger({ className, children, value, ...props }: SelectTriggerProps) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-gray-500">{placeholder || "Select..."}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md">
      {children}
    </div>
  )
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function SelectItem({ className, value, children, ...props }: SelectItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}