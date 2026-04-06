import type { ComponentType } from 'react'
import { EngineSVG } from './EngineSVG'

interface SVGPartProps {
  onSubComponentSelect?: (subComponentId: string) => void
  selectedSubId?: string | null
}

const SVG_PARTS: Record<string, ComponentType<SVGPartProps>> = {
  engine: EngineSVG,
  // TODO: remaining parts
}

export function getInteractiveSVG(partSlug: string): ComponentType<SVGPartProps> | null {
  return SVG_PARTS[partSlug] ?? null
}

export type { SVGPartProps }
