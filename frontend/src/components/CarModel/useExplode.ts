import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Vec3 = [number, number, number]

export function useExplodeAnimation(
  assembled: Vec3,
  exploded: Vec3,
  active: boolean,
  speed = 4,
) {
  const ref = useRef<THREE.Group>(null!)
  const target = useRef(new THREE.Vector3(...assembled))

  useEffect(() => {
    target.current.set(...(active ? exploded : assembled))
  }, [active, assembled, exploded])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.lerp(target.current, 1 - Math.exp(-speed * delta))
    }
  })

  return ref
}
