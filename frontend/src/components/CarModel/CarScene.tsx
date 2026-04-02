import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { CarModel } from './CarModel'
import type { ViewMode } from '../../stores/partStore'
import { usePartStore } from '../../stores/partStore'
import { useColorStore } from '../../stores/colorStore'

interface CarSceneProps {
  bodyType?: string
  onModelLoaded?: () => void
  modelUrl?: string | null
  generation?: string
}

const VIEW_MODE_LABELS: { mode: ViewMode; label: string }[] = [
  { mode: 'normal', label: 'Normal' },
  { mode: 'xray', label: 'X-Ray' },
]

function SceneControls({ bodyColor, onOpenColorStudio }: { bodyColor: string; onOpenColorStudio: () => void }) {
  const viewMode = usePartStore((s) => s.viewMode)
  const setViewMode = usePartStore((s) => s.setViewMode)

  return (
    <>
      {/* Bottom center: View mode + paint brush */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* View mode buttons */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            background: 'rgba(8, 8, 15, 0.85)',
            borderRadius: 8,
            padding: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {VIEW_MODE_LABELS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 18px',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: viewMode === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: viewMode === mode ? 'rgba(255,255,255,0.9)' : 'rgba(255, 255, 255, 0.4)',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== mode) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
              onMouseLeave={(e) => {
                if (viewMode !== mode) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Paint brush button — opens Color Studio */}
        <button
          onClick={onOpenColorStudio}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '2px solid rgba(255,255,255,0.15)',
            background: 'rgba(8, 8, 15, 0.85)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            position: 'relative',
            backdropFilter: 'blur(8px)',
          }}
          title="Open Color Studio"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
            e.currentTarget.style.boxShadow = '0 0 12px rgba(255,255,255,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Paint brush icon */}
          <svg
            viewBox="0 0 24 24"
            style={{ width: 16, height: 16 }}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4 7.37-7.37z" />
            <path d="M9 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h4z" />
          </svg>
          {/* Small color indicator dot */}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: bodyColor,
              border: '2px solid rgba(8, 8, 15, 0.85)',
            }}
          />
        </button>
      </div>
    </>
  )
}

export function CarScene({
  onModelLoaded,
  modelUrl = null,
  generation,
}: CarSceneProps) {
  const bodyColor = useColorStore((s) => s.bodyColor)
  const openStudio = useColorStore((s) => s.openStudio)
  const viewMode = usePartStore((s) => s.viewMode)

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 45 }}
        gl={{ antialias: true, toneMappingExposure: 1.0 }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 10, 25]} />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#ff8888" />
        <pointLight position={[0, 4, 0]} intensity={0.3} color="#ffffff" />
        <spotLight
          position={[-3, 6, 3]}
          angle={0.3}
          penumbra={0.8}
          intensity={0.5}
          color="#c41e2a"
        />

        <Suspense fallback={null}>
          <CarModel
            color={bodyColor}
            viewMode={viewMode}
            onModelLoaded={onModelLoaded}
            modelUrl={modelUrl}
            generation={generation}
          />
          <Environment preset="night" />
        </Suspense>

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4}
        />
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.4} />
        </mesh>

        <OrbitControls
          makeDefault
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={3}
          maxDistance={12}
          enablePan={false}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>

      {/* Scene controls overlay: view mode + paint brush */}
      <SceneControls bodyColor={bodyColor} onOpenColorStudio={openStudio} />
    </div>
  )
}
