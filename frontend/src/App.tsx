import { Routes, Route, useParams, Link } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { GenerationPicker } from './components/GenerationPicker'
import { CarScene } from './components/CarModel'
import { ColorStudio } from './components/ColorStudio'
import { useColorStore, setColorVehicleKey } from './stores/colorStore'
import { useGenerationStore } from './stores/generationStore'
import { getGeneration } from './data/corvette-generations'
import { GenerationInfo } from './components/GenerationInfo'
import { PartsPanel } from './components/PartsPanel'
import { PartViewer } from './components/PartViewer'
import type { PartSlug } from './types'

/* ── Particle Background ── */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number; y: number; vx: number; vy: number; r: number; o: number; red: boolean
    }

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 0.3 + Math.random() * 1.2,
      o: 0.05 + Math.random() * 0.2,
      red: Math.random() < 0.4,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.strokeStyle = `rgba(196,30,42,${0.03 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.fillStyle = p.red
          ? `rgba(196,30,42,${p.o * 3})`
          : `rgba(255,255,255,${p.o})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
    />
  )
}

/* ── Count-Up ── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          const duration = 2000
          const start = performance.now()
          const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(target * eased))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, started])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── Landing ── */
function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Particle canvas */}
      <ParticleBackground />

      {/* Gradient orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(196,30,42,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 12s ease-in-out infinite',
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 15s ease-in-out infinite 3s',
        }}
      />

      {/* Nav bar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="text-xl font-semibold tracking-tight">
          <span className="text-white">My</span>
          <span style={{ color: 'rgba(196,30,42,0.9)' }}>Vette</span>
        </div>
        <button className="px-4 py-2 text-sm text-text-tertiary border border-border-subtle rounded-xl hover:text-text-secondary hover:border-border-medium transition-all duration-200 cursor-pointer">
          Sign in
        </button>
      </nav>

      {/* Hero section */}
      <div className="flex flex-col items-center px-4" style={{ paddingTop: '80px' }}>
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Pill badge */}
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-border-subtle mb-8"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              animation: 'fadeUp 0.8s ease both',
              animationDelay: '0.3s',
            }}
          >
            C3 through C8 &mdash; Explore in 3D
          </div>

          {/* Main heading */}
          <h1
            className="text-center font-bold mb-5"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            <span
              className="block text-white"
              style={{ animation: 'fadeUp 0.8s ease both', animationDelay: '0.4s' }}
            >
              Every Corvette.
            </span>
            <span
              className="block"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.95) 80%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animationName: 'fadeUp, shimmer',
                animationDuration: '0.8s, 4s',
                animationTimingFunction: 'ease, linear',
                animationFillMode: 'both, none',
                animationDelay: '0.45s, 1.25s',
                animationIterationCount: '1, infinite',
              }}
            >
              Every Generation.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-center mb-12"
            style={{
              fontWeight: 300,
              color: 'rgba(255,255,255,0.35)',
              maxWidth: '480px',
              fontSize: '16px',
              lineHeight: 1.6,
              animation: 'fadeUp 0.8s ease both',
              animationDelay: '0.5s',
            }}
          >
            Six generations of American performance, rendered in interactive 3D.
            Pick a generation. Explore every angle.
          </p>

          {/* Generation picker */}
          <GenerationPicker />
        </div>

        {/* Stats bar */}
        <div
          className="flex items-center gap-0 mb-12"
          style={{ marginTop: '60px', animation: 'fadeUp 0.8s ease both', animationDelay: '0.8s' }}
        >
          {[
            { target: 6, suffix: '', label: 'Generations' },
            { target: 0, suffix: '', label: 'C3 through C8', raw: true },
            { target: 0, suffix: '', label: 'Instant Loading', raw: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-10"
              style={{
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined,
              }}
            >
              <span className="font-bold text-white" style={{ fontSize: '28px' }}>
                {stat.raw ? stat.label : <CountUp target={stat.target} suffix={stat.suffix} />}
              </span>
              {!stat.raw && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  {stat.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-10"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '13px',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        MyVette &copy; 2026
      </footer>
    </div>
  )
}

/* ── Generation Page ── */
function GenerationPage() {
  const { gen } = useParams<{ gen: string }>()
  const generation = gen ? getGeneration(gen) : undefined
  const setGeneration = useGenerationStore((s) => s.setGeneration)

  const isStudioOpen = useColorStore((s) => s.isStudioOpen)
  const closeStudio = useColorStore((s) => s.closeStudio)

  const [modelLoaded, setModelLoaded] = useState(false)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [selectedPartTab, setSelectedPartTab] = useState<PartSlug | null>(null)

  const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '')

  // Set generation in store on mount
  useEffect(() => {
    if (gen) {
      setGeneration(gen)
      setColorVehicleKey(gen)
    }
  }, [gen, setGeneration])

  const handleModelLoaded = useCallback(() => {
    setModelLoaded(true)
  }, [])

  if (!generation) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center">
          <p className="text-text-muted text-lg mb-4">Generation not found</p>
          <Link to="/" className="text-sm underline" style={{ color: 'rgba(196,30,42,0.9)' }}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const modelUrl = generation.modelUrl.startsWith('http')
    ? generation.modelUrl
    : `${API_BASE}${generation.modelUrl}`

  const showSidePanel = isStudioOpen || infoPanelOpen

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-6 py-3 border-b border-border-subtle shrink-0 z-10"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-lg font-semibold text-white">
          {generation.name}
        </h1>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            background: 'rgba(196,30,42,0.15)',
            color: 'rgba(196,30,42,0.9)',
          }}
        >
          {generation.code.toUpperCase()}
        </span>
        <span className="text-text-tertiary text-sm">{generation.yearRange}</span>

        {/* Right side buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setInfoPanelOpen(!infoPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors duration-200 ${
              infoPanelOpen
                ? 'text-white/70 border-white/20 bg-white/5'
                : 'text-white/40 border-border-subtle hover:text-white/70 hover:border-white/20'
            }`}
            title="Generation info"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Info
          </button>
        </div>
      </div>

      {/* Upper section: 3D Scene + optional side panel / part viewer */}
      <div className="flex min-h-0" style={{ height: '55%' }}>
        {/* 3D Scene */}
        <div
          className="h-full relative"
          style={{
            width: showSidePanel
              ? '70%'
              : modelLoaded && selectedPartTab
                ? '60%'
                : '100%',
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <CarScene
            onModelLoaded={handleModelLoaded}
            modelUrl={modelUrl}
            generation={gen}
          />

          {/* Loading spinner */}
          {!modelLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-10 h-10 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(196,30,42,0.2)', borderTopColor: 'rgba(196,30,42,0.9)' }}
                />
                <span className="text-sm text-text-tertiary">Loading {generation.name}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Side panel: Color Studio / Generation Info */}
        {showSidePanel && (
          <div
            className="w-[30%] h-full border-l border-border-subtle overflow-y-auto"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            {isStudioOpen ? (
              <ColorStudio onClose={closeStudio} />
            ) : infoPanelOpen && gen ? (
              <GenerationInfo
                generationCode={gen}
                onClose={() => setInfoPanelOpen(false)}
              />
            ) : null}
          </div>
        )}

        {/* Part Viewer split pane (shown when a part tab is active and no side panel) */}
        {!showSidePanel && modelLoaded && selectedPartTab && (
          <div
            className="h-full border-l border-border-subtle"
            style={{
              width: '40%',
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#0a0a0f',
            }}
          >
            <PartViewer
              modelUrl={modelUrl}
              generation={gen!}
              partZone={selectedPartTab}
            />
          </div>
        )}
      </div>

      {/* Lower section: Parts tab panel */}
      {modelLoaded && gen && (
        <div className="border-t border-border-subtle overflow-hidden" style={{ height: '45%' }}>
          <PartsPanel generation={gen} onTabChange={setSelectedPartTab} />
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/generation/:gen" element={<GenerationPage />} />
    </Routes>
  )
}
