import React from 'react'
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
  return (
    <div
      className={cn(
        "relative group",
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
          
          {/* Static scanning line on hover replaced with transition */}
          <div 
            className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent z-10 top-0 opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-[1500ms] ease-linear"
          />
        </div>
      </div>
    </div>
  )
}
