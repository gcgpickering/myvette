import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { PartSlug } from '../../types'

const PART_LABELS: Partial<Record<PartSlug, string>> = {
  'engine': 'Engine',
  'transmission': 'Transmission',
  'suspension': 'Suspension',
  'brakes': 'Brakes',
  'exhaust': 'Exhaust',
  'tires-wheels': 'Tires & Wheels',
  'air-intake': 'Air Intake',
  'ecu-electronics': 'ECU / Electronics',
  'turbo-supercharger': 'Turbo / Supercharger',
  'fuel-system': 'Fuel System',
  'cooling-system': 'Cooling System',
  'steering': 'Steering',
}

// Positions as PROPORTIONS of car dimensions [x%, y%, z%]
// x: 0 = center, positive = front, negative = rear
// y: 0 = ground, 1 = roof height
// z: 0 = center, positive = left side
// These map to real car part locations regardless of model size
const PART_PROPORTIONS: Partial<Record<PartSlug, [number, number, number]>> = {
  'engine':             [ 0.35,  0.40,  0.00],  // front, mid-height, center
  'transmission':       [ 0.10,  0.25,  0.00],  // behind engine, low, center
  'suspension':         [-0.15,  0.20,  0.40],  // mid, low, left side near wheel
  'brakes':             [ 0.35,  0.15,  0.45],  // front wheel area
  'exhaust':            [-0.42,  0.12, 0.20],   // rear, very low, slightly off-center
  'tires-wheels':       [-0.30,  0.15,  0.48],  // rear wheel area
  'air-intake':         [ 0.30,  0.55,  0.00],  // front, above engine, center
  'ecu-electronics':    [ 0.05,  0.60,  0.15],  // cabin area, dash height
  'turbo-supercharger': [ 0.30,  0.35,  0.20],  // engine bay, slightly off-center
  'fuel-system':        [-0.30,  0.22,  0.25],  // rear underside
  'cooling-system':     [ 0.45,  0.35,  0.00],  // very front, behind grille
  'steering':           [ 0.15,  0.50,  0.20],  // front cabin, steering column area
}

const ALL_PARTS = Object.keys(PART_PROPORTIONS) as (keyof typeof PART_PROPORTIONS)[]

// Mid-engine layout overrides for C8 (engine behind driver)
const C8_POSITION_OVERRIDES: Partial<Record<PartSlug, [number, number, number]>> = {
  'engine':             [-0.25,  0.40,  0.00],  // behind cabin, mid-height
  'transmission':       [-0.35,  0.25,  0.00],  // behind engine, low
  'air-intake':         [-0.20,  0.55,  0.00],  // above engine
  'turbo-supercharger': [-0.25,  0.35,  0.20],  // engine bay
  'exhaust':            [-0.45,  0.12,  0.20],  // rear, low
  'cooling-system':     [ 0.42,  0.20,  0.00],  // front (radiator still in front)
  'fuel-system':        [ 0.10,  0.22,  0.00],  // front trunk area
}

interface PartHotspotsProps {
  bodyConfig: {
    bodyLength: number
    bodyHeight: number
    bodyWidth: number
    groundClearance: number
    wheelRadius: number
  }
  onPartClick: (part: PartSlug) => void
  onPartHover: (part: PartSlug | null) => void
  selectedPart: PartSlug | null
  hoveredPart: PartSlug | null
  positionOverrides?: Partial<Record<PartSlug, [number, number, number] | null>>
  generation?: string
}

function Hotspot({
  slug,
  position,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: {
  slug: PartSlug
  position: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const outerRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = Math.sin(t * 2.5) * 0.5 + 0.5

    if (innerRef.current) {
      const baseScale = isSelected ? 1.4 : isHovered ? 1.2 : 0.8 + pulse * 0.2
      innerRef.current.scale.setScalar(baseScale)

      const mat = innerRef.current.material as THREE.MeshStandardMaterial
      if (isSelected) {
        mat.emissiveIntensity = 3
      } else if (isHovered) {
        mat.emissiveIntensity = 2.5
      } else {
        mat.emissiveIntensity = 0.8 + pulse * 0.8
      }
    }

    if (outerRef.current) {
      const outerScale = isSelected ? 1.6 : isHovered ? 1.4 : 1 + pulse * 0.15
      outerRef.current.scale.setScalar(outerScale)
      const mat = outerRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = isSelected ? 0.6 : isHovered ? 0.45 : 0.15 + pulse * 0.15
    }
  })

  const dotColor = isSelected ? '#44ff88' : '#c41e2a'
  const ringColor = isSelected ? '#44ff88' : '#c41e2a'

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Inner sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={dotColor}
          emissive={dotColor}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 12, 32]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={1}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Hover tooltip */}
      {(isHovered || isSelected) && (
        <Html
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              background: 'rgba(8, 8, 13, 0.9)',
              border: `1px solid ${isSelected ? 'rgba(68,255,136,0.8)' : 'rgba(196,30,42,0.6)'}`,
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: isSelected ? 'rgba(68,255,136,0.8)' : 'rgba(196,30,42,0.8)',
              fontFamily: "'DM Mono', monospace",
              transform: 'translateY(-28px)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {PART_LABELS[slug]}
          </div>
        </Html>
      )}
    </group>
  )
}

export function PartHotspots({
  bodyConfig,
  onPartClick,
  onPartHover,
  selectedPart,
  hoveredPart,
  positionOverrides,
  generation,
}: PartHotspotsProps) {
  // Merge generation-specific overrides with explicit overrides
  const mergedOverrides = {
    ...(generation === 'c8' ? C8_POSITION_OVERRIDES : {}),
    ...positionOverrides,
  }

  // Compute actual positions from proportions and car dimensions
  // The car model is ~4 units long, centered at origin, sitting on y=0
  const carHeight = bodyConfig.groundClearance + bodyConfig.wheelRadius + bodyConfig.bodyHeight * 2

  return (
    <group>
      {ALL_PARTS.map((slug) => {
        // Check overrides first: null means hide, [x,y,z] means use those
        if (mergedOverrides && slug in mergedOverrides) {
          const override = mergedOverrides[slug]
          if (override === null || override === undefined) return null  // hidden part
          const [px, py, pz] = override
          const x = px * bodyConfig.bodyLength
          const y = py * carHeight
          const z = pz * bodyConfig.bodyWidth
          return (
            <Hotspot
              key={slug}
              slug={slug}
              position={[x, y, z]}
              isSelected={selectedPart === slug}
              isHovered={hoveredPart === slug}
              onClick={() => onPartClick(slug)}
              onHover={(hovered) => onPartHover(hovered ? slug : null)}
            />
          )
        }

        // Fall back to default PART_PROPORTIONS
        const prop = PART_PROPORTIONS[slug]
        if (!prop) return null
        const [px, py, pz] = prop
        // Convert proportions to world coordinates
        const x = px * bodyConfig.bodyLength
        const y = py * carHeight
        const z = pz * bodyConfig.bodyWidth
        return (
          <Hotspot
            key={slug}
            slug={slug}
            position={[x, y, z]}
            isSelected={selectedPart === slug}
            isHovered={hoveredPart === slug}
            onClick={() => onPartClick(slug)}
            onHover={(hovered) => onPartHover(hovered ? slug : null)}
          />
        )
      })}
    </group>
  )
}
