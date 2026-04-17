'use client'

import { useEffect, useRef } from 'react'
import type { VoiceVisualization } from '@/lib/types'
import { cn } from '@/lib/utils'

interface VoiceVisualizerProps {
  isActive: boolean
  volume: number
  type?: VoiceVisualization
  className?: string
}

export function VoiceVisualizer({ 
  isActive, 
  volume, 
  type = 'gentle-waves',
  className 
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      timeRef.current += 0.02
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      if (type === 'gentle-waves') {
        drawGentleWaves(ctx, width, height, centerX, centerY, volume, timeRef.current, isActive)
      } else if (type === 'breathing-circle') {
        drawBreathingCircle(ctx, width, height, centerX, centerY, volume, timeRef.current, isActive)
      } else if (type === 'particle-cloud') {
        drawParticleCloud(ctx, width, height, centerX, centerY, volume, timeRef.current, isActive)
      } else if (type === 'aurora') {
        drawAurora(ctx, width, height, centerX, centerY, volume, timeRef.current, isActive)
      } else if (type === 'minimal') {
        drawMinimal(ctx, width, height, centerX, centerY, volume, timeRef.current, isActive)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, volume, type])

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      className={cn('rounded-full', className)}
    />
  )
}

function drawGentleWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  volume: number,
  time: number,
  isActive: boolean
) {
  const numWaves = 4
  const baseRadius = 25
  const maxRadius = 50
  const amplitude = isActive ? volume * 15 : 3

  for (let i = 0; i < numWaves; i++) {
    const offset = (i / numWaves) * Math.PI * 2
    const waveRadius = baseRadius + (isActive ? (maxRadius - baseRadius) * (i / numWaves) : 0)
    const opacity = 1 - (i / numWaves) * 0.7

    ctx.beginPath()
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const wave = Math.sin(angle * 3 + time * 2 + offset) * amplitude * (1 - i / numWaves)
      const r = waveRadius + wave
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      if (angle === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
    gradient.addColorStop(0, `rgba(99, 102, 241, ${opacity * 0.3})`)
    gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity * 0.1})`)
    ctx.fillStyle = gradient
    ctx.fill()
    
    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.5})`
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawBreathingCircle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  volume: number,
  time: number,
  isActive: boolean
) {
  const breathCycle = Math.sin(time * (isActive ? 3 : 0.5)) * 0.5 + 0.5
  const baseRadius = 20
  const maxExpansion = isActive ? volume * 20 : 10
  const radius = baseRadius + breathCycle * maxExpansion

  // Outer glow
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 20)
  glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)')
  glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)')
  glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2)
  ctx.fill()

  // Main circle
  const mainGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  mainGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)')
  mainGradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)')
  ctx.fillStyle = mainGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  // Inner highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawParticleCloud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  volume: number,
  time: number,
  isActive: boolean
) {
  const numParticles = 30
  const baseSpread = isActive ? 20 + volume * 20 : 15

  for (let i = 0; i < numParticles; i++) {
    const angle = (i / numParticles) * Math.PI * 2 + time * 0.5
    const distance = baseSpread * (0.5 + Math.sin(time * 2 + i) * 0.5)
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    const size = 2 + Math.sin(time * 3 + i) * 1.5
    const opacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.3

    ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Center glow
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15)
  glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)')
  glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
  ctx.fill()
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  volume: number,
  time: number,
  isActive: boolean
) {
  const numBands = 5
  const amplitude = isActive ? volume * 20 : 5

  for (let i = 0; i < numBands; i++) {
    const yOffset = (i - numBands / 2) * 8
    const hue = 240 + i * 20 // Blue to purple
    
    ctx.beginPath()
    ctx.moveTo(0, centerY + yOffset)
    
    for (let x = 0; x <= width; x += 2) {
      const wave1 = Math.sin((x * 0.02) + time + i * 0.5) * amplitude
      const wave2 = Math.sin((x * 0.03) + time * 1.5 + i) * amplitude * 0.5
      const y = centerY + yOffset + wave1 + wave2
      ctx.lineTo(x, y)
    }
    
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, centerY - 30, 0, centerY + 30)
    gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0)`)
    gradient.addColorStop(0.5, `hsla(${hue}, 80%, 60%, ${0.3 - i * 0.05})`)
    gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`)
    ctx.fillStyle = gradient
    ctx.fill()
  }
}

function drawMinimal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  volume: number,
  time: number,
  isActive: boolean
) {
  const pulse = Math.sin(time * (isActive ? 4 : 1)) * 0.3 + 0.7
  const radius = 8 + (isActive ? volume * 8 : 0) * pulse

  // Glow
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 15)
  glowGradient.addColorStop(0, `rgba(99, 102, 241, ${0.6 * pulse})`)
  glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2)
  ctx.fill()

  // Dot
  ctx.fillStyle = 'rgb(99, 102, 241)'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
}
