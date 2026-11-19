import type { CSSProperties } from "react"

// Entrance-animation helper for tw-animate-css: `animate-in` defaults to
// `animation-fill-mode: none`, which would flash content visible during a
// stagger delay before the animation runs — `backwards` keeps each element
// hidden until its entrance starts. Pair with `motion-safe:animate-in`
// utilities so `prefers-reduced-motion` disables the animation entirely.
export function enter(delay: string): CSSProperties {
  return { animationDelay: delay, animationFillMode: "backwards" }
}
