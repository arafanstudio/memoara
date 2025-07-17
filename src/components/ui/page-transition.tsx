import * as React from "react"
import { usePageTransition } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

export function PageTransition({ 
  children, 
  className,
  direction = 'right'
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  
  React.useEffect(() => {
    setIsVisible(true)
  }, [])
  
  const getTransitionStyles = () => {
    const baseStyles = {
      transition: 'all 0.3s ease-out',
    }
    
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return { ...baseStyles, opacity: 0, transform: 'translateX(-100%)' }
        case 'right':
          return { ...baseStyles, opacity: 0, transform: 'translateX(100%)' }
        case 'up':
          return { ...baseStyles, opacity: 0, transform: 'translateY(-100%)' }
        case 'down':
          return { ...baseStyles, opacity: 0, transform: 'translateY(100%)' }
        default:
          return { ...baseStyles, opacity: 0, transform: 'translateX(100%)' }
      }
    }
    
    return { ...baseStyles, opacity: 1, transform: 'translate(0)' }
  }
  
  return (
    <div
      className={cn("w-full h-full", className)}
      style={getTransitionStyles()}
    >
      {children}
    </div>
  )
}

// Hook untuk mengontrol transisi halaman
export function usePageTransitionController() {
  const [currentPage, setCurrentPage] = React.useState<string>('')
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  
  const navigateToPage = async (pageName: string) => {
    setIsTransitioning(true)
    
    // Tunggu animasi keluar selesai
    await new Promise(resolve => setTimeout(resolve, 150))
    
    setCurrentPage(pageName)
    
    // Tunggu animasi masuk selesai
    await new Promise(resolve => setTimeout(resolve, 150))
    
    setIsTransitioning(false)
  }
  
  return {
    currentPage,
    isTransitioning,
    navigateToPage
  }
}

