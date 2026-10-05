import { isValidElement, type ReactElement, type ReactNode } from 'react'

/**
 * Serialises a tree of plain SVG React elements (and simple function
 * components that return them) into an SVG string. Used to put the dish
 * illustrations into the generated share image without a browser.
 */

const KEEP_CASE = new Set([
  'viewBox',
  'preserveAspectRatio',
  'gradientUnits',
  'gradientTransform',
  'maskUnits',
  'maskContentUnits',
  'clipPathUnits',
  'textLength',
  'lengthAdjust',
  'pathLength',
  'baseFrequency',
  'numOctaves',
  'stdDeviation',
  'filterUnits',
  'startOffset',
])

const RENAME: Record<string, string> = { className: 'class', xlinkHref: 'xlink:href' }

const attrName = (name: string) =>
  RENAME[name] ?? (KEEP_CASE.has(name) ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type AnyProps = Record<string, unknown> & { children?: ReactNode }

export function toSvgString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return escape(String(node))
  if (Array.isArray(node)) return node.map(toSvgString).join('')
  if (!isValidElement(node)) return ''

  const element = node as ReactElement<AnyProps>
  const { type, props } = element

  if (typeof type === 'function') {
    return toSvgString((type as (p: AnyProps) => ReactNode)(props))
  }
  if (typeof type !== 'string') {
    // Fragments and other wrappers: just their children.
    return toSvgString(props.children)
  }

  let attrs = ''
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value === undefined || value === null || value === false) continue
    if (typeof value === 'function' || typeof value === 'object') continue
    attrs += ` ${attrName(key)}="${escape(String(value))}"`
  }
  return `<${type}${attrs}>${toSvgString(props.children)}</${type}>`
}
