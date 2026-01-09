import { useCallback, useState } from 'react'

let idCounter = 1

export default function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info') => {
    const id = idCounter++
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, show, remove }
}
