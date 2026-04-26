import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, Paperclip, Mic } from 'lucide-react'

interface Props {
  onSend: (query: string) => void
  isLoading: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, isLoading, placeholder = 'Ask me anything...' }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div className="px-6 py-5 border-t border-dark-600/50 bg-dark-900/50 backdrop-blur-sm shrink-0">
      <div className="flex items-end gap-3 bg-dark-800/60 border border-dark-600/40 rounded-2xl px-4 py-3
                      hover:border-dark-600/60 focus-within:border-brand-500/50 transition-all duration-200 shadow-lg">
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent text-base text-white placeholder-slate-500 outline-none resize-none
                     leading-relaxed min-h-[24px] max-h-[120px] py-1 disabled:opacity-50"
          aria-label="Chat input"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => console.log('Attach file')}
            disabled={isLoading}
            title="Attach file"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-400 hover:bg-dark-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Paperclip size={18} />
          </button>

          <button
            onClick={handleSend}
            disabled={!canSend}
            title={canSend ? 'Send message' : 'Type a message to send'}
            className={`p-2.5 rounded-lg transition-all duration-200 shrink-0 flex items-center justify-center ${
              canSend
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 active:scale-95'
                : 'bg-dark-700/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isLoading
              ? <Loader size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between mt-2 px-2 text-xs text-slate-600">
        <span>
          <kbd className="bg-dark-700/50 px-1.5 py-0.5 rounded text-slate-500 font-mono">↵</kbd>
          <span className="ml-1.5">send</span>
          <span className="mx-2">•</span>
          <kbd className="bg-dark-700/50 px-1.5 py-0.5 rounded text-slate-500 font-mono">Shift+↵</kbd>
          <span className="ml-1.5">new line</span>
        </span>
        <span className={value.length > 1000 ? 'text-red-500' : ''}>
          {value.length}/2000
        </span>
      </div>
    </div>
  )
}
