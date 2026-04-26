import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

interface User {
  email: string
  name: string
  role: string
  department: string
  member_since: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const res = await api.post('/auth/login', form, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        localStorage.setItem('docktalk_token', res.data.access_token)
        set({ user: res.data.user, token: res.data.access_token, isAuthenticated: true })
      },

      register: async (email, password, name) => {
        const res = await api.post('/auth/register', { email, password, name })
        localStorage.setItem('docktalk_token', res.data.access_token)
        set({ user: res.data.user, token: res.data.access_token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('docktalk_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'docktalk-auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)
