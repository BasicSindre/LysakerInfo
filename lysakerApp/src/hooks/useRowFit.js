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

  // rAF-id for debounce
  const rafIdRef = useRef(null)

  // Den faktiske målingen (kalles kun fra scheduleMeasure)
  const doMeasure = useCallback(() => {
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

  // Planlagt måling: samler mange kall til én pr frame
  const scheduleMeasure = useCallback(() => {
    if (rafIdRef.current != null) return
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      doMeasure()
    })
  }, [doMeasure])

  // Første synkrone måling (etter layout)
  useLayoutEffect(() => {
    doMeasure()
  }, [doMeasure])

  // Løpende målinger for dynamiske endringer
  useEffect(() => {
    // Ekstra kontroller etter fonts/layouter:
    const raf1 = requestAnimationFrame(scheduleMeasure)
    const raf2 = requestAnimationFrame(scheduleMeasure)
    const t = setTimeout(scheduleMeasure, 250)

    const ro = new ResizeObserver(scheduleMeasure)
    if (ref.current) ro.observe(ref.current)

    // Re-mål ved DOM-endringer i panel-body
    const mo = new MutationObserver(scheduleMeasure)
    if (ref.current) mo.observe(ref.current, { childList: true, subtree: true })

    window.addEventListener('resize', scheduleMeasure, { passive: true })
    window.addEventListener('orientationchange', scheduleMeasure, { passive: true })
    document.addEventListener('fullscreenchange', scheduleMeasure, { passive: true })

    return () => {
      if (raf1) cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      clearTimeout(t)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('orientationchange', scheduleMeasure)
      document.removeEventListener('fullscreenchange', scheduleMeasure)
    }
  }, [scheduleMeasure])

  // Behold API: tredje returverdi heter fortsatt measure
  return [ref, rows, scheduleMeasure]
}
