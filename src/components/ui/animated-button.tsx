import * as React from "react"
import { Button, ButtonProps } from "./button"
import { useRipple } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  enableRipple?: boolean
}

export function AnimatedButton({ 
  children, 
  className, 
  enableRipple = true, 
  onClick,
  ...props 
}: AnimatedButtonProps) {
  const { ripples, addRipple } = useRipple()
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (enableRipple) {
      addRipple(event)
    }
    if (onClick) {
      onClick(event)
    }
  }
  
  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {enableRipple && ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s',
            animationFillMode: 'forwards'
          }}
        />
      ))}
    </Button>
  )
}

