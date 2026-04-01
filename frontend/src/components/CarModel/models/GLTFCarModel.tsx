import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { usePartStore } from '../../../stores/partStore'
import { useColorStore } from '../../../stores/colorStore'
import { identifyMaterials, type MaterialMapping } from './identifyMaterials'
import { getMeshMap, type MeshMapping, type MeshZone, type GenerationMeshMap } from '../../../data/corvette-mesh-maps'
import type { GenerationCode } from '../../../data/corvette-generations'
import type { PartSlug } from '../../../types'

export interface GLTFBoundingBox {
  min: [number, number, number]
  max: [number, number, number]
  size: [number, number, number]
  center: [number, number, number]
}

interface GLTFCarModelProps {
  url: string
  generation?: string // 'c3' through 'c8'
  color?: string
  viewMode: 'normal' | 'exploded' | 'xray'
  onLoaded?: () => void
  onBoundingBox?: (bbox: GLTFBoundingBox) => void
}

// ---------------------------------------------------------------------------
// Zone → PartSlug mapping (only zones that have a PartSlug equivalent)
// ---------------------------------------------------------------------------
const ZONE_TO_PART_SLUG: Partial<Record<MeshZone, PartSlug>> = {
  body: 'body-shell',
  doors: 'body-shell',
  hood: 'body-shell',
  trunk: 'body-shell',
  roof: 'body-shell',
  wheels: 'tires-wheels',
  brakes: 'brakes',
  engine: 'engine',
  exhaust: 'exhaust',
  transmission: 'transmission',
  suspension: 'suspension',
  steering: 'steering',
  cooling: 'cooling-system',
  fuel: 'fuel-system',
  intake: 'air-intake',
  interior: 'ecu-electronics',
}

// Body/shell zones — these get transparent in X-ray and colored by bodyColor
const BODY_ZONES: Set<MeshZone> = new Set([
  'body', 'doors', 'hood', 'trunk', 'roof', 'glass',
])

// Internal zones — fully visible through the transparent shell in X-ray
const INTERNAL_ZONES: Set<MeshZone> = new Set([
  'engine', 'exhaust', 'transmission', 'suspension', 'brakes',
  'steering', 'cooling', 'fuel', 'intake', 'interior',
])

// Colorable zones — body color applies to these
const COLORABLE_ZONES: Set<MeshZone> = new Set([
  'body', 'doors', 'hood', 'trunk', 'roof',
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip .001 / .002 etc. suffixes (common in C6 Blender exports). */
function stripNumericSuffix(name: string): string {
  return name.replace(/\.\d{3}$/, '')
}

/**
 * Match a node name against the mesh map. Tries exact match first,
 * then prefix match (startsWith). For C6 models the numeric suffix is
 * stripped before matching.
 */
function findMapping(
  name: string,
  meshMap: GenerationMeshMap,
  isC6: boolean,
): MeshMapping | undefined {
  const clean = isC6 ? stripNumericSuffix(name) : name

  // Exact match
  if (meshMap[clean]) return meshMap[clean]

  // Prefix match — longest prefix wins
  let bestKey = ''
  let bestMapping: MeshMapping | undefined
  for (const key of Object.keys(meshMap)) {
    if (clean.startsWith(key) && key.length > bestKey.length) {
      bestKey = key
      bestMapping = meshMap[key]
    }
  }
  return bestMapping
}

/**
 * Determine X-ray opacity for a zone.
 */
function xrayOpacityForZone(zone: MeshZone, mapping?: MeshMapping): number {
  if (mapping?.xrayOpacity !== undefined) return mapping.xrayOpacity
  if (BODY_ZONES.has(zone)) return 0.12
  if (INTERNAL_ZONES.has(zone)) return 1.0
  if (zone === 'wheels') return 0.85
  if (zone === 'chrome') return 0.7
  if (zone === 'lights') return 0.8
  return 0.3
}

/**
 * Determine exploded-view opacity for a zone.
 */
function explodedOpacityForZone(zone: MeshZone, mapping?: MeshMapping): number {
  if (mapping?.xrayOpacity !== undefined) return mapping.xrayOpacity
  if (BODY_ZONES.has(zone)) return 0.06
  if (INTERNAL_ZONES.has(zone)) return 1.0
  if (zone === 'wheels') return 0.85
  return 0.3
}

// ---------------------------------------------------------------------------
// Fallback X-ray opacity for identifyMaterials categories
// ---------------------------------------------------------------------------
function fallbackXrayOpacity(
  mat: THREE.MeshStandardMaterial,
  fb: MaterialMapping,
): number {
  if (fb.body.includes(mat)) return 0.12
  if (fb.glass.includes(mat)) return 0.2
  if (fb.wheels.includes(mat)) return 0.85
  if (fb.chrome.includes(mat)) return 0.7
  if (fb.rubber.includes(mat)) return 0.6
  if (fb.calipers.includes(mat)) return 1.0
  if (fb.lights.includes(mat)) return 0.8
  // Unassigned — check if it looks like interior (bright colored, medium size)
  return 0.4
}

// ---------------------------------------------------------------------------
// Processed scene data
// ---------------------------------------------------------------------------
interface NodeMeta {
  mapping: MeshMapping
  originalPosition: THREE.Vector3
}

interface ProcessedScene {
  clone: THREE.Group
  scale: number
  bbox: GLTFBoundingBox
  hasMeshMap: boolean

  // Mesh-map-aware data (populated when a mesh map exists)
  nodeMeta: Map<THREE.Object3D, NodeMeta>
  zoneMaterials: Map<MeshZone, Set<THREE.MeshStandardMaterial>>

  // Fallback data (for C3/C5 without mesh maps)
  fallbackMapping: MaterialMapping | null
  allMats: Set<THREE.MeshStandardMaterial>

  // Original properties for restoring normal view
  originalBodyProps: Map<THREE.MeshStandardMaterial, { color: THREE.Color; metalness: number; roughness: number }>
  originalMatProps: Map<THREE.MeshStandardMaterial, { transparent: boolean; opacity: number; depthWrite: boolean; emissive: THREE.Color; emissiveIntensity: number }>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GLTFCarModel({
  url,
  generation,
  viewMode,
  onLoaded,
  onBoundingBox,
}: GLTFCarModelProps) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null!)
  const explodeProgressRef = useRef(0)
  const setHoveredPart = usePartStore((s) => s.setHoveredPart)
  const setSelectedPart = usePartStore((s) => s.setSelectedPart)
  const selectedPart = usePartStore((s) => s.selectedPart)
  const setHoveredMeshGroup = usePartStore((s) => s.setHoveredMeshGroup)
  const setSelectedMeshGroup = usePartStore((s) => s.setSelectedMeshGroup)
  const [ready, setReady] = useState(false)

  // Track currently highlighted meshes for emissive effect
  const highlightedMeshesRef = useRef<THREE.Mesh[]>([])

  const bodyColor = useColorStore((s) => s.bodyColor)

  // -----------------------------------------------------------------------
  // Clone, normalize, classify
  // -----------------------------------------------------------------------
  const processed = useMemo<ProcessedScene>(() => {
    const clone = scene.clone(true)

    // --- Scale & center ---
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 4.0 / maxDim

    clone.scale.setScalar(scale)
    clone.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    )
    clone.updateMatrixWorld(true)

    // --- Mesh map classification ---
    const genCode = generation as GenerationCode | undefined
    const meshMap = genCode ? getMeshMap(genCode) : undefined
    const isC6 = genCode === 'c6'
    const mapEntries = meshMap ? Object.keys(meshMap) : []
    const hasMeshMap = mapEntries.length > 0

    const nodeMeta = new Map<THREE.Object3D, NodeMeta>()
    const zoneMaterials = new Map<MeshZone, Set<THREE.MeshStandardMaterial>>()
    const allMats = new Set<THREE.MeshStandardMaterial>()

    clone.traverse((child) => {
      // Collect all materials
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        for (const m of mats) {
          if (m instanceof THREE.MeshStandardMaterial) allMats.add(m)
        }
      }

      // Map nodes to zones via mesh map
      if (hasMeshMap && meshMap && child.name) {
        const mapping = findMapping(child.name, meshMap, isC6)
        if (mapping) {
          // Store original position
          nodeMeta.set(child, {
            mapping,
            originalPosition: child.position.clone(),
          })

          // Collect materials for this zone from this node + its children
          const collectMats = (obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
              for (const m of mats) {
                if (m instanceof THREE.MeshStandardMaterial) {
                  if (!zoneMaterials.has(mapping.zone)) zoneMaterials.set(mapping.zone, new Set())
                  zoneMaterials.get(mapping.zone)!.add(m)
                }
              }
            }
          }
          collectMats(child)
          child.traverse((desc) => {
            if (desc !== child) collectMats(desc)
          })
        }
      }
    })

    // --- Fallback: identifyMaterials for C3/C5 ---
    const fallbackMapping = !hasMeshMap ? identifyMaterials(clone) : null

    // --- Debug logging ---
    console.log(`[MyVette] Generation: ${genCode}, hasMeshMap: ${hasMeshMap}`)
    if (hasMeshMap) {
      console.log(`[MyVette] Matched ${nodeMeta.size} nodes to mesh map`)
      for (const [zone, mats] of zoneMaterials) {
        console.log(`  ${zone}: ${mats.size} materials`)
      }
    } else if (fallbackMapping) {
      console.log('[MyVette] Fallback material mapping:', {
        body: fallbackMapping.body.length,
        wheels: fallbackMapping.wheels.length,
        glass: fallbackMapping.glass.length,
        chrome: fallbackMapping.chrome.length,
        rubber: fallbackMapping.rubber.length,
        calipers: fallbackMapping.calipers.length,
        lights: fallbackMapping.lights.length,
        unassigned: fallbackMapping.unassigned.length,
      })
    }

    // --- Save original body props ---
    const originalBodyProps = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; metalness: number; roughness: number }>()
    if (hasMeshMap) {
      for (const zone of COLORABLE_ZONES) {
        const mats = zoneMaterials.get(zone)
        if (!mats) continue
        for (const mat of mats) {
          originalBodyProps.set(mat, { color: mat.color.clone(), metalness: mat.metalness, roughness: mat.roughness })
        }
      }
    } else if (fallbackMapping) {
      for (const mat of fallbackMapping.body) {
        originalBodyProps.set(mat, { color: mat.color.clone(), metalness: mat.metalness, roughness: mat.roughness })
      }
    }

    // --- Save original material props (including emissive for hover restore) ---
    const originalMatProps = new Map<THREE.MeshStandardMaterial, { transparent: boolean; opacity: number; depthWrite: boolean; emissive: THREE.Color; emissiveIntensity: number }>()
    for (const mat of allMats) {
      originalMatProps.set(mat, {
        transparent: mat.transparent,
        opacity: mat.opacity,
        depthWrite: mat.depthWrite,
        emissive: mat.emissive.clone(),
        emissiveIntensity: mat.emissiveIntensity,
      })
    }

    // --- Bounding box ---
    const normalizedBox = new THREE.Box3().setFromObject(clone)
    const normalizedSize = normalizedBox.getSize(new THREE.Vector3())
    const normalizedCenter = normalizedBox.getCenter(new THREE.Vector3())
    const bbox: GLTFBoundingBox = {
      min: [normalizedBox.min.x, normalizedBox.min.y, normalizedBox.min.z],
      max: [normalizedBox.max.x, normalizedBox.max.y, normalizedBox.max.z],
      size: [normalizedSize.x, normalizedSize.y, normalizedSize.z],
      center: [normalizedCenter.x, normalizedCenter.y, normalizedCenter.z],
    }

    return {
      clone,
      scale,
      bbox,
      hasMeshMap,
      nodeMeta,
      zoneMaterials,
      fallbackMapping,
      allMats,
      originalBodyProps,
      originalMatProps,
    }
  }, [scene, generation])

  // -----------------------------------------------------------------------
  // Body color — zone-aware or fallback
  // -----------------------------------------------------------------------
  useEffect(() => {
    const isStock = bodyColor.toLowerCase() === '#ffffff' || bodyColor.toLowerCase() === '#fff'

    if (processed.hasMeshMap) {
      for (const zone of COLORABLE_ZONES) {
        const mats = processed.zoneMaterials.get(zone)
        if (!mats) continue
        for (const mat of mats) {
          if (isStock) {
            const orig = processed.originalBodyProps.get(mat)
            if (orig) {
              mat.color.copy(orig.color)
              mat.metalness = orig.metalness
              mat.roughness = orig.roughness
            }
          } else {
            mat.color.set(bodyColor)
            mat.metalness = 0.8
            mat.roughness = 0.25
          }
          mat.needsUpdate = true
        }
      }
    } else if (processed.fallbackMapping) {
      for (const mat of processed.fallbackMapping.body) {
        if (isStock) {
          const orig = processed.originalBodyProps.get(mat)
          if (orig) {
            mat.color.copy(orig.color)
            mat.metalness = orig.metalness
            mat.roughness = orig.roughness
          }
        } else {
          mat.color.set(bodyColor)
          mat.metalness = 0.8
          mat.roughness = 0.25
        }
        mat.needsUpdate = true
      }
    }
  }, [processed, bodyColor])

  // -----------------------------------------------------------------------
  // X-ray / Exploded view — per-zone opacity (mesh map) or per-category (fallback)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (viewMode === 'normal') {
      // Restore all materials to original state
      for (const mat of processed.allMats) {
        const orig = processed.originalMatProps.get(mat)
        if (orig) {
          mat.transparent = orig.transparent
          mat.opacity = orig.opacity
          mat.depthWrite = orig.depthWrite
        }
        mat.needsUpdate = true
      }
      return
    }

    if (processed.hasMeshMap) {
      // Build a material→zone lookup (last zone wins if shared)
      const matToZoneInfo = new Map<THREE.MeshStandardMaterial, { zone: MeshZone; mapping?: MeshMapping }>()
      for (const [node, meta] of processed.nodeMeta) {
        // Collect materials from this node and its children
        const collectMats = (obj: THREE.Object3D) => {
          if (obj instanceof THREE.Mesh) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
            for (const m of mats) {
              if (m instanceof THREE.MeshStandardMaterial) {
                matToZoneInfo.set(m, { zone: meta.mapping.zone, mapping: meta.mapping })
              }
            }
          }
        }
        collectMats(node)
        node.traverse((desc) => { if (desc !== node) collectMats(desc) })
      }

      for (const mat of processed.allMats) {
        const info = matToZoneInfo.get(mat)
        if (info) {
          const opacity = viewMode === 'xray'
            ? xrayOpacityForZone(info.zone, info.mapping)
            : explodedOpacityForZone(info.zone, info.mapping)

          mat.transparent = opacity < 1.0
          mat.opacity = opacity
          mat.depthWrite = opacity >= 0.9
        } else {
          // Unmatched material — semi-transparent
          mat.transparent = true
          mat.opacity = 0.25
          mat.depthWrite = false
        }
        mat.needsUpdate = true
      }
    } else if (processed.fallbackMapping) {
      // Fallback: use identifyMaterials categories for per-zone transparency
      const fb = processed.fallbackMapping
      for (const mat of processed.allMats) {
        const opacity = viewMode === 'xray'
          ? fallbackXrayOpacity(mat, fb)
          : (fb.body.includes(mat) ? 0.06 : fallbackXrayOpacity(mat, fb))

        mat.transparent = opacity < 1.0
        mat.opacity = opacity
        mat.depthWrite = opacity >= 0.9
        mat.needsUpdate = true
      }
    }
  }, [processed, viewMode])

  // -----------------------------------------------------------------------
  // Exploded view animation via useFrame
  // -----------------------------------------------------------------------
  useFrame(() => {
    const target = viewMode === 'exploded' ? 1.0 : 0.0
    const current = explodeProgressRef.current
    const SPEED = 0.05

    // Lerp towards target
    if (Math.abs(current - target) > 0.001) {
      explodeProgressRef.current += (target - current) * SPEED
    } else {
      explodeProgressRef.current = target
    }

    const progress = explodeProgressRef.current
    if (!processed.hasMeshMap) return

    // Apply explode offsets
    for (const [node, meta] of processed.nodeMeta) {
      const { mapping, originalPosition } = meta

      if (mapping.explodable && mapping.explodeDirection) {
        const [dx, dy, dz] = mapping.explodeDirection
        const scaleFactor = progress * 2.0
        node.position.set(
          originalPosition.x + dx * scaleFactor,
          originalPosition.y + dy * scaleFactor,
          originalPosition.z + dz * scaleFactor,
        )
      }
    }
  })

  // -----------------------------------------------------------------------
  // Emissive-based hover highlighting
  // -----------------------------------------------------------------------
  const clearHighlight = useCallback(() => {
    for (const mesh of highlightedMeshesRef.current) {
      if (mesh instanceof THREE.Mesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const mat of mats) {
          if (mat instanceof THREE.MeshStandardMaterial) {
            const orig = processed.originalMatProps.get(mat)
            if (orig) {
              mat.emissive.copy(orig.emissive)
              mat.emissiveIntensity = orig.emissiveIntensity
            } else {
              mat.emissive.setHex(0x000000)
              mat.emissiveIntensity = 0
            }
            mat.needsUpdate = true
          }
        }
      }
    }
    highlightedMeshesRef.current = []
  }, [processed])

  const applyHighlight = useCallback((node: THREE.Object3D) => {
    clearHighlight()

    const meshes: THREE.Mesh[] = []
    const addMesh = (obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) meshes.push(obj)
    }
    addMesh(node)
    node.traverse((desc) => { if (desc !== node) addMesh(desc) })

    for (const mesh of meshes) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.emissive.setHex(0xc41e2a) // Torch Red highlight
          mat.emissiveIntensity = 0.3
          mat.needsUpdate = true
        }
      }
    }
    highlightedMeshesRef.current = meshes
  }, [clearHighlight])

  // -----------------------------------------------------------------------
  // Click + Hover interaction
  // -----------------------------------------------------------------------

  /** Walk up the parent chain to find a node in the mesh map. */
  const findMappedAncestor = useCallback(
    (obj: THREE.Object3D): { node: THREE.Object3D; mapping: MeshMapping } | null => {
      let current: THREE.Object3D | null = obj
      while (current) {
        const meta = processed.nodeMeta.get(current)
        if (meta) return { node: current, mapping: meta.mapping }
        current = current.parent
      }
      return null
    },
    [processed],
  )

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()

      const hit = event.intersections[0]
      if (!hit) {
        setHoveredPart(null)
        setHoveredMeshGroup(null)
        clearHighlight()
        return
      }

      if (processed.hasMeshMap) {
        const mapped = findMappedAncestor(hit.object)
        if (mapped && mapped.mapping.clickable) {
          const slug = ZONE_TO_PART_SLUG[mapped.mapping.zone]
          setHoveredPart(slug ?? null)
          setHoveredMeshGroup(mapped.mapping.label)
          applyHighlight(mapped.node)
          document.body.style.cursor = 'pointer'
        } else {
          setHoveredPart(null)
          setHoveredMeshGroup(null)
          clearHighlight()
          document.body.style.cursor = 'auto'
        }
      }
    },
    [processed, findMappedAncestor, setHoveredPart, setHoveredMeshGroup, applyHighlight, clearHighlight],
  )

  const handlePointerOut = useCallback(() => {
    setHoveredPart(null)
    setHoveredMeshGroup(null)
    clearHighlight()
    document.body.style.cursor = 'auto'
  }, [setHoveredPart, setHoveredMeshGroup, clearHighlight])

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()

      const hit = event.intersections[0]
      if (!hit) return

      if (processed.hasMeshMap) {
        const mapped = findMappedAncestor(hit.object)
        if (mapped && mapped.mapping.clickable) {
          const slug = ZONE_TO_PART_SLUG[mapped.mapping.zone]
          if (slug) {
            setSelectedPart(selectedPart === slug ? null : slug)
            setSelectedMeshGroup(mapped.mapping.label)
          }
        }
      }
    },
    [processed, findMappedAncestor, setSelectedPart, selectedPart, setSelectedMeshGroup],
  )

  // -----------------------------------------------------------------------
  // Loaded callback + bounding box
  // -----------------------------------------------------------------------
  useEffect(() => {
    setReady(true)
    onLoaded?.()
    onBoundingBox?.(processed.bbox)
  }, [processed, onLoaded, onBoundingBox])

  if (!ready) return null

  return (
    <group
      ref={groupRef}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={processed.clone} />
    </group>
  )
}
