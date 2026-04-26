import React, { useState } from 'react'
import { Settings, User, Bell, Shield, Database, Monitor, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-dark-500'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
  </button>
)

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [useCompanyData, setUseCompanyData] = useState(true)
  const [saveChatHistory, setSaveChatHistory] = useState(true)
  const [allowUploads, setAllowUploads] = useState(true)
  const [language, setLanguage] = useState('English')
  const [responseLength, setResponseLength] = useState('Balanced')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-dark-600/50 shrink-0">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Settings nav */}
          <div className="w-44 shrink-0 border-r border-dark-600/30 p-4">
            {[
              { icon: Settings, label: 'General', active: true },
              { icon: User, label: 'Appearance' },
              { icon: Shield, label: 'Privacy' },
              { icon: Bell, label: 'Notifications' },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors
                  ${active ? 'bg-brand-600/15 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-dark-700'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Settings content */}
          <div className="flex-1 p-6 space-y-6 max-w-lg">
            {/* Preferences */}
            <section>
              <h3 className="text-sm font-semibold text-white mb-4">Preferences</h3>

              <div className="space-y-4">
                {/* Theme */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Theme</label>
                  <div className="flex gap-2">
                    {(['Light', 'Dark', 'System'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t.toLowerCase() as any)}
                        className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-medium transition-colors
                          ${theme === t.toLowerCase()
                            ? 'border-brand-500/60 bg-brand-600/10 text-brand-400'
                            : 'border-dark-600/50 text-slate-400 hover:border-dark-500 hover:text-white'}`}
                      >
                        {t === 'Light' ? <Sun size={16} /> : t === 'Dark' ? <Moon size={16} /> : <Monitor size={16} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  >
                    {['English', 'Spanish', 'French', 'German', 'Japanese'].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Response Length */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Response Length</label>
                  <select
                    value={responseLength}
                    onChange={e => setResponseLength(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  >
                    {['Concise', 'Balanced', 'Detailed'].map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Data & Privacy */}
            <section>
              <h3 className="text-sm font-semibold text-white mb-4">Data & Privacy</h3>
              <div className="space-y-3">
                {[
                  { label: 'Use company data', value: useCompanyData, set: setUseCompanyData },
                  { label: 'Save chat history', value: saveChatHistory, set: setSaveChatHistory },
                  { label: 'Allow document uploads', value: allowUploads, set: setAllowUploads },
                  { label: 'Push notifications', value: notifications, set: setNotifications },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{label}</span>
                    <Toggle checked={value} onChange={() => set(!value)} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
