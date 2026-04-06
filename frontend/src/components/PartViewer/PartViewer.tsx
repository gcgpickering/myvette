import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getMeshMap, type MeshZone, type GenerationMeshMap } from '../../data/corvette-mesh-maps'
import type { GenerationCode } from '../../data/corvette-generations'
import type { PartSlug } from '../../types'
import { partDiagrams } from '../../data/diagrams'
import { getInteractiveSVG } from './svgs'

/* ─── PartSlug to MeshZone mapping ─── */

const PART_ZONE_MAP: Record<PartSlug, MeshZone> = {
  'engine': 'engine',
  'transmission': 'transmission',
  'exhaust': 'exhaust',
  'suspension': 'suspension',
  'brakes': 'brakes',
  'tires-wheels': 'wheels',
  'air-intake': 'intake',
  'turbo-supercharger': 'engine',
  'fuel-system': 'fuel',
  'cooling-system': 'cooling',
  'steering': 'steering',
  'ecu-electronics': 'interior',
  'body-shell': 'body',
  'interior': 'interior',
  'lights': 'lights',
  'glass': 'glass',
}

export function getPartZone(slug: PartSlug): MeshZone {
  return PART_ZONE_MAP[slug] ?? 'other'
}

/* ─── Friendly labels for zones ─── */

const ZONE_LABELS: Record<string, string> = {
  engine: 'Engine',
  transmission: 'Transmission',
  exhaust: 'Exhaust System',
  suspension: 'Suspension',
  brakes: 'Brake System',
  wheels: 'Wheels & Tires',
  intake: 'Air Intake',
  fuel: 'Fuel System',
  cooling: 'Cooling System',
  steering: 'Steering',
  interior: 'Interior / Electronics',
  body: 'Body Shell',
  lights: 'Lights',
  glass: 'Glass',
}

/* ─── Zone resolution — longest prefix match (same as GLTFCarModel) ─── */

function stripNumericSuffix(name: string): string {
  return name.replace(/\.\d{3}$/, '')
}

/**
 * Normalize a node name for matching against mesh map keys.
 * Sketchfab GLB exports: underscores for spaces, dots stripped.
 * Mesh map keys use spaces and may contain dots (e.g. "6.2L").
 */
function normalizeName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\./g, '')
}

function findZone(
  nodeName: string,
  meshMap: GenerationMeshMap,
  isC6: boolean,
): MeshZone | null {
  if (!nodeName) return null
  const raw = isC6 ? stripNumericSuffix(nodeName) : nodeName
  // Normalize for matching: underscores→spaces, dots stripped
  const cleanNode = normalizeName(raw)

  // Exact match (try normalized, raw, and original)
  if (meshMap[raw]) return meshMap[raw].zone

  // Longest prefix match — normalize both sides
  let bestLen = 0
  let bestZone: MeshZone | null = null
  for (const [key, mapping] of Object.entries(meshMap)) {
    const cleanKey = normalizeName(key)
    if (
      cleanNode.startsWith(cleanKey) ||
      raw.startsWith(key) ||
      nodeName.startsWith(key)
    ) {
      if (cleanKey.length > bestLen) {
        bestLen = cleanKey.length
        bestZone = mapping.zone
      }
    }
  }
  return bestZone
}

/* ─── Build a node→zone map for the entire scene, then extract target zone meshes ─── */

function buildZoneMap(
  root: THREE.Object3D,
  meshMap: GenerationMeshMap,
  isC6: boolean,
): Map<THREE.Object3D, MeshZone> {
  const nodeZones = new Map<THREE.Object3D, MeshZone>()

  // Pass 1: Assign zones to ALL named nodes (groups + meshes)
  root.traverse((node) => {
    const zone = findZone(node.name, meshMap, isC6)
    if (zone) nodeZones.set(node, zone)
  })

  // Pass 2: For meshes without a direct zone, inherit from nearest ancestor
  root.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return
    if (nodeZones.has(node)) return // already has direct zone

    let parent = node.parent
    while (parent) {
      if (nodeZones.has(parent)) {
        nodeZones.set(node, nodeZones.get(parent)!)
        break
      }
      parent = parent.parent
    }
  })

  return nodeZones
}

/**
 * Extract all meshes belonging to a target zone into a fresh group.
 * Clones each mesh with fresh materials so GLTFCarModel can't interfere.
 */
function extractZoneMeshes(
  scene: THREE.Object3D,
  meshMap: GenerationMeshMap,
  targetZone: MeshZone,
  isC6: boolean,
): THREE.Group {
  const result = new THREE.Group()
  const zoneMap = buildZoneMap(scene, meshMap, isC6)

  let totalMeshes = 0

  scene.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return
    totalMeshes++
    const zone = zoneMap.get(node)
    if (zone !== targetZone) return

    // Clone the mesh with fresh materials
    const mesh = node as THREE.Mesh
    const clonedMesh = mesh.clone()

    // Deep-clone materials so they're independent
    if (Array.isArray(clonedMesh.material)) {
      clonedMesh.material = clonedMesh.material.map((m) => {
        const c = m.clone()
        if (c instanceof THREE.MeshStandardMaterial) {
          c.transparent = false
          c.opacity = 1.0
          c.depthWrite = true
          c.emissive.setHex(0x000000)
          c.emissiveIntensity = 0
          c.needsUpdate = true
        }
        return c
      })
    } else {
      const c = clonedMesh.material.clone()
      if (c instanceof THREE.MeshStandardMaterial) {
        c.transparent = false
        c.opacity = 1.0
        c.depthWrite = true
        c.emissive.setHex(0x000000)
        c.emissiveIntensity = 0
        c.needsUpdate = true
      }
      clonedMesh.material = c
    }

    // Position cloned mesh using the original's world transform
    mesh.updateWorldMatrix(true, false)
    clonedMesh.matrixAutoUpdate = false
    clonedMesh.matrix.copy(mesh.matrixWorld)

    clonedMesh.visible = true
    result.add(clonedMesh)
  })

  console.log(`[PartViewer] Zone "${targetZone}": ${result.children.length}/${totalMeshes} meshes`)

  return result
}

/* ─── SVG Diagram Fallback ─── */

function DiagramFallback({ label, partSlug }: { label: string; partSlug: PartSlug }) {
  const Diagram = partDiagrams[partSlug]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Zone label */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 16,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(196,30,42,0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'rgba(196,30,42,0.6)',
            boxShadow: '0 0 8px rgba(196,30,42,0.4)',
          }}
        />
        {label}
      </div>

      {/* Diagram label */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        Schematic
      </div>

      {/* SVG Diagram */}
      {Diagram ? (
        <div style={{ width: '65%', maxWidth: 320, opacity: 0.85 }}>
          <Diagram />
        </div>
      ) : (
        <>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <p
            style={{
              margin: '12px 0 0 0',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: 200,
            }}
          >
            Part view not available for this model
          </p>
        </>
      )}
    </div>
  )
}

/* ─── IsolatedPart: the R3F scene content ─── */

function IsolatedPart({
  modelUrl,
  generation,
  partZone,
  onMeshCount,
}: {
  modelUrl: string
  generation: string
  partZone: MeshZone
  onMeshCount: (count: number) => void
}) {
  // Use a cache-buster fragment so drei gives us a separate scene instance,
  // immune to GLTFCarModel's material mutations on the shared original.
  const { scene } = useGLTF(modelUrl + '#partviewer')
  const groupRef = useRef<THREE.Group>(null!)
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const hasFramed = useRef(false)

  const isC6 = generation === 'c6'
  const meshMap = useMemo(
    () => getMeshMap(generation as GenerationCode),
    [generation],
  )

  // Extract zone meshes into a fresh group (no hierarchy dependency)
  const extractedGroup = useMemo(() => {
    const group = extractZoneMeshes(scene, meshMap, partZone, isC6)
    return group
  }, [scene, meshMap, partZone, isC6])

  // Report mesh count to parent
  useEffect(() => {
    onMeshCount(extractedGroup.children.length)
  }, [extractedGroup, onMeshCount])

  // Auto-frame camera on the extracted meshes
  useEffect(() => {
    hasFramed.current = false
  }, [partZone])

  useFrame(() => {
    if (hasFramed.current || !groupRef.current) return
    if (groupRef.current.children.length === 0) return

    const box = new THREE.Box3()
    let hasGeometry = false

    groupRef.current.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox()
          if (mesh.geometry.boundingBox) {
            const meshBox = mesh.geometry.boundingBox.clone()
            meshBox.applyMatrix4(mesh.matrixWorld)
            box.union(meshBox)
            hasGeometry = true
          }
        }
      }
    })

    if (!hasGeometry) return

    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim === 0) return

    const fov = (camera as THREE.PerspectiveCamera).fov
    const distance = maxDim / (2 * Math.tan((fov * Math.PI) / 360)) * 1.6

    camera.position.set(
      center.x + distance * 0.6,
      center.y + distance * 0.4,
      center.z + distance * 0.7,
    )
    camera.lookAt(center)
    ;(camera as THREE.PerspectiveCamera).near = 0.01
    ;(camera as THREE.PerspectiveCamera).far = distance * 10
    camera.updateProjectionMatrix()

    // Set OrbitControls target to mesh center so orbiting pivots correctly
    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }

    hasFramed.current = true
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -4]} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#c41e2a" />

      <group ref={groupRef}>
        <primitive object={extractedGroup} />
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.08}
        enableDamping
        minDistance={0.1}
        maxDistance={50}
      />
    </>
  )
}

/* ─── PartViewer: full component with Canvas and overlay ─── */

interface PartViewerProps {
  modelUrl: string
  generation: string
  partZone: PartSlug
  onSubComponentSelect?: (subComponentId: string) => void
  selectedSubId?: string | null
}

export function PartViewer({ modelUrl, generation, partZone, onSubComponentSelect, selectedSubId }: PartViewerProps) {
  const meshMap = useMemo(
    () => getMeshMap(generation as GenerationCode),
    [generation],
  )

  const zone = getPartZone(partZone)
  const label = ZONE_LABELS[zone] ?? zone

  // Check if mesh map is empty (C3/C5 have no map data)
  const isEmpty = Object.keys(meshMap).length === 0

  // Check if any meshes exist for this zone in the mesh map
  const hasZoneMeshes = useMemo(() => {
    if (isEmpty) return false
    return Object.values(meshMap).some((m) => m.zone === zone)
  }, [meshMap, zone, isEmpty])

  // Track actual extracted mesh count from IsolatedPart
  const [meshCount, setMeshCount] = useState<number | null>(null)
  const handleMeshCount = useCallback((count: number) => setMeshCount(count), [])

  // Reset mesh count when zone changes
  useEffect(() => {
    setMeshCount(null)
  }, [zone, generation])

  // Show SVG diagram fallback if:
  // 1. No mesh map at all (C3/C5), or
  // 2. Zone doesn't exist in mesh map, or
  // 3. Extraction found 0 meshes despite zone existing in map
  const showDiagramFallback = isEmpty || !hasZoneMeshes || meshCount === 0

  // Try interactive SVG first, fall back to old diagram
  const InteractivePart = getInteractiveSVG(partZone)
  const renderFallback = () => {
    if (InteractivePart) {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <InteractivePart
            onSubComponentSelect={onSubComponentSelect}
            selectedSubId={selectedSubId}
          />
        </div>
      )
    }
    return <DiagramFallback label={label} partSlug={partZone} />
  }

  if (showDiagramFallback && meshCount !== null) {
    return renderFallback()
  }

  if (isEmpty || !hasZoneMeshes) {
    return renderFallback()
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0a0a0f',
      }}
    >
      {/* Zone label overlay */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 16,
          zIndex: 10,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(196,30,42,0.8)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'rgba(196,30,42,0.6)',
            boxShadow: '0 0 8px rgba(196,30,42,0.4)',
          }}
        />
        {label}
      </div>

      {/* Hint overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          zIndex: 10,
          textAlign: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}
      >
        Drag to orbit
      </div>

      <Canvas
        camera={{ fov: 45, near: 0.01, far: 500 }}
        style={{ background: '#0a0a0f' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <IsolatedPart
          modelUrl={modelUrl}
          generation={generation}
          partZone={zone}
          onMeshCount={handleMeshCount}
        />
      </Canvas>
    </div>
  )
}
