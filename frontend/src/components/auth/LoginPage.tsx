import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader, Mail, Lock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { success, error: showError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPassword = password.length >= 6
  const canSubmit = isValidEmail && isValidPassword && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      await login(email, password)
      success('Signed in', 'Welcome back!')
      navigate('/')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Invalid credentials'
      showError('Sign in failed', String(errorMsg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/6 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg shadow-brand-600/30">
            D
          </div>
          <h1 className="text-3xl font-bold text-white">DockTalk</h1>
          <p className="text-base text-slate-400 mt-2 font-medium">Enterprise Documentation Platform</p>
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 bg-dark-800/40 px-3 py-1.5 rounded-full border border-dark-600/50">
            <Sparkles size={12} />
            Powered by AI
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-dark-800/60 border border-dark-600/40 backdrop-blur-sm rounded-2xl p-7 shadow-2xl">
          {/* Welcome Text */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400">Sign in to access your documents</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <div className={`relative flex items-center border rounded-lg transition-all ${
                touched.email && !isValidEmail
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-dark-600/40 bg-dark-800/40 focus-within:border-brand-500/50 focus-within:bg-dark-800/60'
              }`}>
                <Mail size={16} className="absolute left-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  placeholder="you@company.com"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                  disabled={loading}
                />
              </div>
              {touched.email && !isValidEmail && (
                <p className="text-xs text-red-400 mt-1.5">Please enter a valid email</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className={`relative flex items-center border rounded-lg transition-all ${
                touched.password && !isValidPassword
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-dark-600/40 bg-dark-800/40 focus-within:border-brand-500/50 focus-within:bg-dark-800/60'
              }`}>
                <Lock size={16} className="absolute left-3 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="••••••••"
                  className="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  disabled={loading}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && !isValidPassword && (
                <p className="text-xs text-red-400 mt-1.5">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-dark-600 bg-dark-700" disabled={loading} />
                Remember me
              </label>
              <a href="#" className="text-brand-400 hover:text-brand-300 font-medium">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                canSubmit
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:shadow-lg hover:shadow-brand-600/30 text-white active:scale-95'
                  : 'bg-dark-700 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-600/30"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-dark-800/60 text-slate-500">New to DockTalk?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="w-full py-2.5 px-4 rounded-lg border border-dark-600/40 hover:border-dark-600 text-white font-medium transition-all text-center"
          >
            Create Account
          </Link>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-dark-700/30 border border-dark-600/30 rounded-lg">
            <p className="text-xs font-semibold text-slate-300 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <p>Email: <span className="text-slate-300">demo@company.com</span></p>
              <p>Password: <span className="text-slate-300">demo1234</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  )
}
