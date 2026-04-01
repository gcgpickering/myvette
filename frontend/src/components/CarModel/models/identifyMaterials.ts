import * as THREE from 'three'

export interface MaterialMapping {
  body: THREE.MeshStandardMaterial[]
  wheels: THREE.MeshStandardMaterial[]
  glass: THREE.MeshStandardMaterial[]
  chrome: THREE.MeshStandardMaterial[]
  rubber: THREE.MeshStandardMaterial[]
  calipers: THREE.MeshStandardMaterial[]
  lights: THREE.MeshStandardMaterial[]
  unassigned: THREE.MeshStandardMaterial[]
}

/**
 * Analyzes a cloned GLTF scene and classifies materials.
 *
 * Meshy models typically use a single texture atlas material, so body color
 * is the primary customization. Wheels, glass, etc. will be supported in a
 * future update when per-zone texture manipulation is implemented.
 */
export function identifyMaterials(root: THREE.Group): MaterialMapping {
  const mapping: MaterialMapping = {
    body: [],
    wheels: [],
    glass: [],
    chrome: [],
    rubber: [],
    calipers: [],
    lights: [],
    unassigned: [],
  }

  // Collect all unique MeshStandardMaterials
  const allMats = new Set<THREE.MeshStandardMaterial>()
  const matMeshes = new Map<THREE.MeshStandardMaterial, THREE.Mesh[]>()

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of mats) {
        if (m instanceof THREE.MeshStandardMaterial) {
          allMats.add(m)
          if (!matMeshes.has(m)) matMeshes.set(m, [])
          matMeshes.get(m)!.push(child)
        }
      }
    }
  })

  const assigned = new Set<THREE.MeshStandardMaterial>()

  // Name-based matching (works when models have semantic names)
  const nameRules: [RegExp, keyof MaterialMapping][] = [
    [/body|paint|car_?paint|exterior/, 'body'],
    [/wheel|rim|alloy/, 'wheels'],
    [/glass|window|windshield/, 'glass'],
    [/tire|rubber|tyre/, 'rubber'],
    [/chrome|metal_?trim/, 'chrome'],
    [/brake|caliper/, 'calipers'],
    [/light|lamp|headlight|taillight/, 'lights'],
  ]

  for (const mat of allMats) {
    if (assigned.has(mat)) continue
    const name = mat.name.toLowerCase()
    if (!name) continue
    for (const [regex, zone] of nameRules) {
      if (regex.test(name)) {
        mapping[zone].push(mat)
        assigned.add(mat)
        break
      }
    }
  }

  // Property-based: glass (transparent), rubber (dark rough)
  for (const mat of allMats) {
    if (assigned.has(mat)) continue
    if (mat.transparent && mat.opacity < 0.8) {
      mapping.glass.push(mat); assigned.add(mat); continue
    }
    const b = mat.color.r + mat.color.g + mat.color.b
    if (b < 0.35 && mat.roughness > 0.7 && mat.metalness < 0.2) {
      mapping.rubber.push(mat); assigned.add(mat); continue
    }
  }

  // Surface area: largest unassigned = body
  let largestArea = 0
  let largestMat: THREE.MeshStandardMaterial | null = null

  for (const [mat, meshes] of matMeshes) {
    if (assigned.has(mat)) continue
    let area = 0
    for (const mesh of meshes) {
      mesh.geometry.computeBoundingBox()
      const bb = mesh.geometry.boundingBox
      if (bb) {
        const s = bb.getSize(new THREE.Vector3())
        area += s.x * s.y + s.y * s.z + s.x * s.z
      }
    }
    if (area > largestArea) {
      largestArea = area
      largestMat = mat
    }
  }

  if (mapping.body.length === 0 && largestMat) {
    mapping.body.push(largestMat)
    assigned.add(largestMat)
  }

  // Everything else → unassigned
  for (const mat of allMats) {
    if (!assigned.has(mat)) mapping.unassigned.push(mat)
  }

  console.log('[MyVette] Material mapping:', {
    body: mapping.body.length,
    wheels: mapping.wheels.length,
    glass: mapping.glass.length,
    chrome: mapping.chrome.length,
    rubber: mapping.rubber.length,
    calipers: mapping.calipers.length,
    lights: mapping.lights.length,
    unassigned: mapping.unassigned.length,
  })

  return mapping
}
