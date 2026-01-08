import { useEffect, useState } from 'react'

function AccountDialog({ isOpen, onClose, user, onUpdate, onDelete }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    if (isOpen && user) {
      setForm({ name: user.name || '', email: user.email || '', password: '' })
    }
    if (!isOpen) {
      setForm({ name: '', email: '', password: '' })
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const { name, email, password } = form
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900'
  const onField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      name: name.trim(),
      email: email.trim(),
    }
    if (password.trim()) {
      payload.passwordHash = password.trim()
    }
    onUpdate?.(payload)
  }

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this account? This cannot be undone.')) return
    onDelete?.()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-2">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Account Settings</h2>
            <p className="mt-1 text-xs text-slate-500">Update your profile or delete your account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={name}
              onChange={onField('name')}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={onField('email')}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={onField('password')}
              className={inputClass}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
            >
              Delete Account
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-1.5 font-medium text-white hover:bg-emerald-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountDialog
