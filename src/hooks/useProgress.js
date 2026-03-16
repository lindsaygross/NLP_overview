import { useState, useEffect } from 'react'

export function useProgress() {
  const [progress, setProgressState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nlp-progress') || '{}')
    } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('nlp-progress', JSON.stringify(progress))
  }, [progress])

  const markVisited = (section, id) => {
    setProgressState(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [id]: true }
    }))
  }

  const getProgress = (section, total) => {
    const visited = Object.keys(progress[section] || {}).length
    return total > 0 ? Math.round((visited / total) * 100) : 0
  }

  return { progress, markVisited, getProgress }
}
