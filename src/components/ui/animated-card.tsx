import * as React from "react"
import { Card, CardProps } from "./card"
import { useIntersectionAnimation } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends CardProps {
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight'
  delay?: number
}

export function AnimatedCard({ 
  children, 
  className, 
  animationType = 'fadeIn',
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  const { ref, isVisible } = useIntersectionAnimation()
  
  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `all 0.6s ease-out ${delay}ms`,
    }
    
    if (!isVisible) {
      switch (animationType) {
        case 'slideUp':
          return { ...baseStyles, opacity: 0, transform: 'translateY(50px)' }
        case 'slideLeft':
          return { ...baseStyles, opacity: 0, transform: 'translateX(-50px)' }
        case 'slideRight':
          return { ...baseStyles, opacity: 0, transform: 'translateX(50px)' }
        default:
          return { ...baseStyles, opacity: 0, transform: 'translateY(20px)' }
      }
    }
    
    return { ...baseStyles, opacity: 1, transform: 'translate(0)' }
  }
  
  return (
    <Card
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("transition-all duration-300", className)}
      style={getAnimationStyles()}
      {...props}
    >
      {children}
    </Card>
  )
}

