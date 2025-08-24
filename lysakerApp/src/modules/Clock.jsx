import { useState, useEffect } from "react"
import { formatTime } from "../utils/time"

export default function Clock({ clock24 = true }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return <div className="clock">{formatTime(time, clock24)}</div>
}
