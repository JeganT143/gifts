'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Plays through a list of timed steps. Time only advances while the page is
 * visible (requestAnimationFrame pauses in background tabs), so nobody misses
 * a step by switching apps.
 */
export function useTimeline(starts: number[], total: number, onDone: () => void) {
  const [index, setIndex] = useState(0)
  const elapsed = useRef(0)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    let current = 0

    const tick = (now: number) => {
      elapsed.current += Math.min(now - last, 100)
      last = now

      let next = current
      while (next + 1 < starts.length && elapsed.current >= starts[next + 1]) next++
      if (next !== current) {
        current = next
        setIndex(next)
      }

      if (elapsed.current >= total) {
        done.current()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [starts, total])

  return { index, elapsed }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}
