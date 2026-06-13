/**
 * Date helpers shared across transaction / debt forms.
 *
 * Backend (post-P1) accepts both a full ISO instant and a bare "YYYY-MM-DD".
 * The frontend always sends a full ISO instant for correctness so the chosen
 * calendar day is preserved regardless of the user's timezone.
 */

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Convert a date-only string ("YYYY-MM-DD", as produced by `<input type="date">`)
 * into a UTC ISO instant at midnight UTC: "2026-06-10" -> "2026-06-10T00:00:00.000Z".
 *
 * Returns `undefined` for empty / invalid input so callers can omit the field
 * from the payload instead of sending a broken value.
 */
export function ymdToInstant(ymd: string | null | undefined): string | undefined {
  if (!ymd) return undefined
  // Already a full instant — pass through unchanged.
  if (!YMD_RE.test(ymd)) {
    const passthrough = new Date(ymd)
    return Number.isNaN(passthrough.getTime()) ? undefined : passthrough.toISOString()
  }
  const instant = new Date(`${ymd}T00:00:00Z`)
  return Number.isNaN(instant.getTime()) ? undefined : instant.toISOString()
}

/**
 * Convert an ISO instant (or "YYYY-MM-DD") into the "YYYY-MM-DD" form expected
 * by `<input type="date">`. Uses UTC components so the day matches what
 * {@link ymdToInstant} stored.
 */
export function isoToInputDate(iso: string | null | undefined): string {
  if (!iso) return ''
  if (YMD_RE.test(iso)) return iso
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Today as "YYYY-MM-DD" (local calendar day) — convenience for form defaults. */
export function todayYmd(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
