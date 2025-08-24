import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Calculates how many `.row` items can fit inside a `.card` (minus header/paddings).
 * Returns [ref, rowsThatFit, measure].
 *
 * Usage:
 *   const [bodyRef, rowsThatFit, measure] = useRowFit()
 *   <div ref={bodyRef} className="panel-body"> ... list with .row items ... </div>
 *   // After you set data that renders rows, call: requestAnimationFrame(measure)
 */
export function useRowFit() {
  const ref = useRef(null)
  const [rows, setRows] = useState(4)

  const measure = useCallback(() => {
    const body = ref.current
    if (!body) return

    const card = body.closest('.card')
    if (!card) return
    const header = card.querySelector('.card-header')

    const cardRect = card.getBoundingClientRect()
    const style = getComputedStyle(card)
    const padY =
      parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0)
    const headerH = header ? header.getBoundingClientRect().height : 0

    const available = Math.max(0, cardRect.height - headerH - padY)

    // The list element contains the rows
    const list = body.querySelector('.list')
    if (!list) {
      setRows(1)
      return
    }

    const row = list.querySelector('.row')
    // Fallback height before any row exists
    let rowH = row ? row.getBoundingClientRect().height : 84
    if (rowH < 40) rowH = 84

    const gap = parseFloat(getComputedStyle(list).rowGap || 12)

    // rows * rowH + (rows-1)*gap <= available
    let r = Math.floor((available + gap) / (rowH + gap))
    if (!Number.isFinite(r) || r < 1) r = 1
    setRows(r)
  }, [])

  // First sync measurement
  useLayoutEffect(() => {
    measure()
  }, [measure])

  // Ongoing measurements for dynamic changes
  useEffect(() => {
    // A couple of extra checks after layout settles (fonts, etc.)
    const raf1 = requestAnimationFrame(measure)
    const raf2 = requestAnimationFrame(measure)
    const t = setTimeout(measure, 250)

    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)

    // If children are added/removed/changed, re-measure
    const mo = new MutationObserver(measure)
    if (ref.current) mo.observe(ref.current, { childList: true, subtree: true })

    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    document.addEventListener('fullscreenchange', measure)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(t)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      document.removeEventListener('fullscreenchange', measure)
    }
  }, [measure])

  return [ref, rows, measure]
}
