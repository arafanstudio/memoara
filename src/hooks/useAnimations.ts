import { useEffect, useRef, useState } from 'react'

// Hook untuk animasi fade in saat komponen mount
export function useFadeIn(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.4s ease-out'
  }
}

// Hook untuk animasi slide in dari kanan
export function useSlideInRight(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'all 0.3s ease-out'
  }
}

// Hook untuk animasi slide in dari kiri
export function useSlideInLeft(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'all 0.3s ease-out'
  }
}

// Hook untuk animasi staggered pada list items
export function useStaggeredAnimation(itemCount: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i])
      }, i * delay)
      timers.push(timer)
    }
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [itemCount, delay])
  
  return visibleItems
}

// Hook untuk ripple effect pada button click
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  
  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()
    
    setRipples(prev => [...prev, { x, y, id }])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)
  }
  
  return { ripples, addRipple }
}

// Hook untuk intersection observer animation
export function useIntersectionAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])
  
  return { ref, isVisible }
}

// Hook untuk smooth scroll
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  
  return { scrollToElement, scrollToTop }
}

// Hook untuk page transition
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const startTransition = () => {
    setIsTransitioning(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsTransitioning(false)
        resolve()
      }, 300)
    })
  }
  
  return { isTransitioning, startTransition }
}

