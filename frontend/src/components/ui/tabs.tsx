import * as React from "react"
import { cn } from "../../lib/utils"

// Tabs Components
interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value || '')
  
  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <div className={cn("", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            activeTab, 
            onValueChange: handleValueChange 
          });
        }
        return child;
      })}
    </div>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onValueChange?: (value: string) => void
}

export function TabsList({ className, children, activeTab, onValueChange, ...props }: TabsListProps) {
  return (
    <div
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            activeTab, 
            onValueChange 
          });
        }
        return child;
      })}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  activeTab?: string
  onValueChange?: (value: string) => void
}

export function TabsTrigger({ className, value, activeTab, onValueChange, children, ...props }: TabsTriggerProps) {
  const isActive = activeTab === value
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-gray-950 shadow-sm" : "text-gray-500",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeTab?: string
}

export function TabsContent({ className, value, activeTab, children, ...props }: TabsContentProps) {
  if (activeTab !== value) return null
  
  return (
    <div
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}