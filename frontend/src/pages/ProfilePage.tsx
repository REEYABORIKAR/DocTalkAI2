import React, { useState } from 'react'
import { Camera, Edit2, LogOut, Shield, Calendar, Building } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const initials = user.name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-dark-600/50 shrink-0">
        <h2 className="text-lg font-semibold text-white">Profile & Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal information</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-5 p-5 bg-dark-800 border border-dark-600/40 rounded-2xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                              flex items-center justify-center text-xl font-bold text-white">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-600 border border-dark-500
                                 flex items-center justify-center hover:bg-dark-500 transition-colors">
                <Camera size={11} className="text-slate-300" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-white">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border
                  ${user.role === 'admin'
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-brand-400 bg-brand-400/10 border-brand-400/20'}`}>
                  {user.role?.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-500
                         text-xs text-slate-400 hover:text-white hover:border-dark-400 transition-colors"
            >
              <Edit2 size={11} />
              Edit Profile
            </button>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, label: 'Role', value: user.role, color: 'text-amber-400' },
              { icon: Building, label: 'Department', value: user.department || 'General', color: 'text-brand-400' },
              { icon: Calendar, label: 'Member Since', value: user.member_since ? new Date(user.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A', color: 'text-emerald-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-4 bg-dark-800 border border-dark-600/40 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className={color} />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm text-white font-medium capitalize">{value}</p>
              </div>
            ))}

            {/* Email */}
            <div className="p-4 bg-dark-800 border border-dark-600/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Email</span>
              </div>
              <p className="text-sm text-white font-medium truncate">{user.email}</p>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="p-5 bg-dark-800 border border-brand-500/30 rounded-2xl space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
              {[
                { label: 'Full Name', placeholder: user.name, type: 'text' },
                { label: 'Email', placeholder: user.email, type: 'email' },
                { label: 'Department', placeholder: user.department || 'General', type: 'text' },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    defaultValue={placeholder}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-slate-600 outline-none focus:border-brand-500/60 transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors">
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30
                         text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
