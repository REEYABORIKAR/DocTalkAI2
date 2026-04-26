import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please accept the Terms of Service'); return }
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center font-bold text-white text-xl mb-4">D</div>
          <h1 className="text-xl font-bold text-white">DockTalk</h1>
          <p className="text-sm text-slate-500 mt-1">Create your account</p>
          <p className="text-xs text-slate-600 mt-0.5">Start your AI-powered productivity journey</p>
        </div>

        <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>
            )}

            {[
              { label: 'Full name', value: name, set: setName, type: 'text', placeholder: 'John Doe' },
              { label: 'Email address', value: email, set: setEmail, type: 'email', placeholder: 'you@company.com' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <input
                  type={type} value={value} onChange={e => set(e.target.value)} required placeholder={placeholder}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white
                             placeholder-slate-600 outline-none focus:border-brand-500/60 transition-colors"
                />
              </div>
            ))}

            {['Password', 'Confirm password'].map((label, idx) => (
              <div key={label}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={idx === 0 ? password : confirm}
                    onChange={e => idx === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-slate-600 outline-none focus:border-brand-500/60 transition-colors pr-10"
                  />
                  {idx === 0 && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 accent-brand-500" />
              <span className="text-xs text-slate-500">
                I agree to the <span className="text-brand-400">Terms of Service</span> and <span className="text-brand-400">Privacy Policy</span>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader size={14} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-dark-600/50 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
