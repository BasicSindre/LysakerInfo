import { useEffect, useState } from 'react'

const THEMES = ["dark","light","autumn"]

export default function ThemeSwitcher(){
  const [theme,setTheme] = useState("dark")

  useEffect(()=>{
    const saved = localStorage.getItem("theme")
    if(saved && THEMES.includes(saved)) setTheme(saved)
    else document.documentElement.setAttribute("data-theme",theme)
  },[])

  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme)
    localStorage.setItem("theme",theme)
  },[theme])

  return (
    <div style={{display:"flex",gap:"8px"}}>
      {THEMES.map(t=>(
        <button key={t} onClick={()=>setTheme(t)}
          style={{
            padding:"6px 12px",borderRadius:"8px",
            border: theme===t?"2px solid var(--ok)":"1px solid var(--line)",
            background: theme===t?"var(--glass)":"transparent",
            color:"var(--text)",cursor:"pointer"
          }}>
          {t}
        </button>
      ))}
    </div>
  )
}
