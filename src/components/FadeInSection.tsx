"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function FadeInSection({ 
  children, 
  className, 
  delay = 0 
}: FadeInSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  )
}

