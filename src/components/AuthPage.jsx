import { useState } from 'react'
import { signUp, signIn } from '../api/client'

function AuthPage({ initialMode = 'signin', onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const { name, email, password } = form
  const isSignIn = mode === 'signin'

  const inputClass = 'auth-input w-full rounded-full border border-slate-300 px-5 py-3.5 text-base text-slate-800 shadow-sm outline-none focus:border-emerald-500'

  const onField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) return

    if (isSignIn) {
      try {
        const user = await signIn({
          email: email.trim(),
          passwordHash: password,
        })
        setError('')
        onAuthenticated?.({ mode, ...user })
      } catch (err) {
        console.error('Sign in failed', err)
        // Extract the specific error message from the backend
        setError(err.message || 'Sign in failed')
      }
    } else {
      try {
        const user = await signUp({
          name: name.trim(),
          email: email.trim(),
          passwordHash: password, // or send plain and hash on backend
        })
        setError('')
        onAuthenticated?.({ mode, ...user })
      } catch (err) {
        console.error('Sign up failed', err)
        setError('Could not create account')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen w-full bg-white">
        {/* Left side: form */}
        <div className="flex w-full flex-col items-center justify-center px-10 py-16 md:w-1/2 relative bg-white overflow-hidden">
          {/* Accent bar */}
          <div className="hidden md:block absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-emerald-500 via-emerald-300 to-emerald-100 rounded-r-xl shadow-lg z-10" />
          <div className="w-full max-w-md z-10">
            <h1 className="auth-page-title text-center text-4xl font-extrabold text-slate-900 md:text-5xl">
              {isSignIn ? 'SIGN IN' : 'GET STARTED NOW!'}
            </h1>
            <p className="auth-page-brand mt-3 text-center text-2xl">
              VisionBoard
            </p>

            <form onSubmit={handleSubmit} className="mt-12 space-y-5">
              {!isSignIn && (
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={onField('name')}
                    className={inputClass}
                  />
                </div>
              )}
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={onField('email')}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={onField('password')}
                  className={inputClass}
                  required
                />
              </div>
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  className="auth-page-primary-btn inline-flex min-w-[150px] items-center justify-center rounded-full px-10 py-2.5 text-base font-semibold uppercase tracking-wide text-white shadow"
                >
                  {isSignIn ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right side: marketing panel with blurred image + overlay */}
        <div className="hidden w-1/2 md:flex">
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="/image/auth-bg.jpg"
              alt="Analytics dashboard on laptop"
              className="absolute inset-0 h-full w-full scale-105 object-cover"
              style={{ filter: 'blur(17px)' }}
            />
            <div className="auth-bg-overlay absolute inset-0" />
            <div className="relative flex h-full w-full items-center justify-center px-10 text-center text-white">
              <div className="max-w-md space-y-5">
                <h2 className="auth-page-title text-4xl font-extrabold md:text-5xl">HEY THERE!</h2>
                <p className="text-base leading-relaxed text-slate-100 md:text-lg">
                  {isSignIn
                    ? 'Create your account now and step into an amazing new journey'
                    : 'Already have an account?'}
                </p>
                <button
                  type="button"
                  onClick={() => setMode(isSignIn ? 'signup' : 'signin')}
                  className="mt-4 inline-flex min-w-[150px] items-center justify-center rounded-full border border-white/70 px-10 py-2.5 text-base font-semibold uppercase tracking-wide text-white hover:bg-white/10"
                >
                  {isSignIn ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
