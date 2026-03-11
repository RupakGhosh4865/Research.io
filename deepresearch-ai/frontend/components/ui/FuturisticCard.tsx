"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FuturisticCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

export default function FuturisticCard({ children, className, glowColor = '#00d4ff' }: FuturisticCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "relative group perspective-1000",
        className
      )}
    >
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-60 transition duration-500"
        style={{
          background: `linear-gradient(45deg, ${glowColor}, transparent, ${glowColor})`,
          filter: 'blur(10px)',
        }}
      />
      <div className="relative glass p-1 rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Glow border effect */}
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative bg-[#080B14]/80 backdrop-blur-xl p-6 rounded-xl flex-1 flex flex-col min-h-0">
          {children}
          
          {/* Animated scanning line on hover */}
          <motion.div 
            initial={{ top: '-100%' }}
            whileHover={{ top: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent z-10"
          />
        </div>
      </div>
    </motion.div>
  )
}
