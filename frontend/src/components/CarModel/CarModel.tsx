import { useCallback, useState, Component, type ReactNode, type ErrorInfo } from 'react'
import { GLTFCarModel } from './models/GLTFCarModel'
import type { GLTFBoundingBox } from './models/GLTFCarModel'
import type { ViewMode } from '../../stores/partStore'

/** Error boundary that catches GLTF load failures */
class GLTFErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('GLTF model load failed:', error.message, info)
    this.props.onError?.()
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

interface CarModelProps {
  bodyType?: string
  color: string
  viewMode: ViewMode
  onModelLoaded?: () => void
  modelUrl?: string | null
  generation?: string
}

export function CarModel({
  viewMode,
  onModelLoaded,
  modelUrl = null,
  generation,
}: CarModelProps) {
  const [_gltfBbox, setGltfBbox] = useState<GLTFBoundingBox | null>(null)
  const [gltfLoadFailed, setGltfLoadFailed] = useState(false)

  const handleBoundingBox = useCallback((bbox: GLTFBoundingBox) => {
    setGltfBbox(bbox)
  }, [])

  const handleGltfError = useCallback(() => {
    setGltfLoadFailed(true)
    onModelLoaded?.()
  }, [onModelLoaded])

  return (
    <group>
      {gltfLoadFailed ? null : modelUrl ? (
        <GLTFErrorBoundary onError={handleGltfError} fallback={null}>
          <GLTFCarModel
            url={modelUrl}
            generation={generation}
            viewMode={viewMode}
            onLoaded={onModelLoaded}
            onBoundingBox={handleBoundingBox}
          />
        </GLTFErrorBoundary>
      ) : null}
    </group>
  )
}
