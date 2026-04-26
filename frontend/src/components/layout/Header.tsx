import React, { useState } from 'react'
import { Settings, MoreVertical, Copy, Trash2 } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import clsx from 'clsx'

const MODES = ['Personal', 'Company', 'Hybrid'] as const

export default function Header() {
  const { mode, setMode } = useChatStore()
  const [showMenu, setShowMenu] = useState(false)

  const handleCopy = async () => {
    try {
      const text = window.location.href
      await navigator.clipboard.writeText(text)
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-dark-600/50 bg-dark-800/50 backdrop-blur-sm shrink-0">
      {/* Mode switcher */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode:</span>
        <div className="flex items-center gap-1 bg-dark-700/60 rounded-full p-1 border border-dark-600/40">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m.toLowerCase() as any)}
              title={`Switch to ${m} mode`}
              className={clsx(
                'mode-tab transition-all duration-200',
                mode === m.toLowerCase()
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 relative">
        <span className="text-xs font-mono text-slate-500 bg-dark-700/50 px-2.5 py-1 rounded-lg border border-dark-600/40">
          {mode.toUpperCase()}
        </span>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
          title="More options"
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600/50 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/50 transition-colors border-b border-dark-600/30"
            >
              <Copy size={16} />
              Copy chat link
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
              Clear conversation
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
