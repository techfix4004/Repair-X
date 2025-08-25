import * as React from "react"
import { cn } from "../../lib/utils"

// Dialog Component
interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange?.(false)}>
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}