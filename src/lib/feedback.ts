/**
 * Tiny bits of physical feedback: a synthesized bite sound and a short
 * vibration. Both are best-effort and silently do nothing when unsupported.
 */

let context: AudioContext | null = null
let crunchBuffer: AudioBuffer | null = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

function getCrunch(ac: AudioContext) {
  if (crunchBuffer) return crunchBuffer
  const length = Math.floor(ac.sampleRate * 0.22)
  const buffer = ac.createBuffer(1, length, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const decay = Math.pow(1 - i / length, 2.4)
    const crackle = Math.random() < 0.06 ? 1 : 0.22
    data[i] = (Math.random() * 2 - 1) * crackle * decay
  }
  crunchBuffer = buffer
  return buffer
}

export function playBite() {
  try {
    const ac = audio()
    if (!ac) return
    const source = ac.createBufferSource()
    source.buffer = getCrunch(ac)
    source.playbackRate.value = 0.75 + Math.random() * 0.5

    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1200 + Math.random() * 1400
    filter.Q.value = 0.8

    const gain = ac.createGain()
    const now = ac.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

    source.connect(filter).connect(gain).connect(ac.destination)
    source.start(now)
    source.stop(now + 0.24)
  } catch {
    // Audio is decoration; never let it break the meal.
  }
}

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Not supported (iOS, desktop).
  }
}
