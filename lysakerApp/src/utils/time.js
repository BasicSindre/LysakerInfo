// src/utils/time.js

/**
 * Formatter klokkeslett som 24-timers eller 12-timers.
 * @param {Date|string|number} date - Date-objekt eller timestamp
 * @param {boolean} clock24 - true = 24t, false = 12t
 */
export function formatTime(date, clock24 = true) {
  const d = date instanceof Date ? date : new Date(date)
  let h = d.getHours()
  const m = d.getMinutes()

  if (clock24) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  } else {
    const suffix = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`
  }
}
