import React, { useEffect } from 'react'

export default function Toast({ id, message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(t)
  }, [id, onClose])

  const bg = type === 'error' ? 'bg-red-600' : 'bg-slate-900'

  return (
    <div className={`pointer-events-auto mb-2 rounded-md px-4 py-2 text-white ${bg} shadow-lg`}>
      {message}
    </div>
  )
}
