type HapticKind = "success" | "error" | "detent"

const patterns: Record<HapticKind, number | Array<number>> = {
  success: 12,
  error: [18, 35, 18],
  detent: 6,
}

/** Android vibration with an intentionally silent no-op on unsupported devices. */
export function haptic(kind: HapticKind): void {
  if (
    typeof navigator === "undefined" ||
    document.documentElement.dataset.reducedMotion === "true" ||
    !Reflect.has(navigator, "vibrate")
  ) return

  navigator.vibrate(patterns[kind])
}
