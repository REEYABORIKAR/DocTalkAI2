import React, { useEffect, useRef } from 'react'
import { MessageSquare, Sparkles, Zap, Shield, Brain } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useChat } from '../../hooks/useChat'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import { LoadingDots } from '../ui/LoadingSpinner'

const SUGGESTIONS = [
  {
    icon: Shield,
    title: 'What is the remote work policy?',
    desc: 'Company policies'
  },
  {
    icon: Zap,
    title: 'How do I request time off?',
    desc: 'HR procedures'
  },
  {
    icon: Brain,
    title: 'What are the IT security protocols?',
    desc: 'Security guidelines'
  },
  {
    icon: MessageSquare,
    title: 'Explain the expense reimbursement process',
    desc: 'Finance policies'
  },
]

export default function ChatPanel() {
  const { activeChatId, newChat } = useChatStore()
  const { messages, isLoading, sendMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (query: string) => {
    if (!activeChatId) newChat()
    await sendMessage(query)
  }

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-8 pb-20">
            {/* Logo */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600/30 to-brand-600/10 border border-brand-600/30 flex items-center justify-center shadow-lg shadow-brand-600/10">
                <Sparkles size={36} className="text-brand-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-3 border-dark-900 flex items-center justify-center shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Welcome Text */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Welcome to DockTalk</h2>
              <p className="text-base text-slate-400 max-w-md mx-auto leading-relaxed">
                Your AI-powered assistant for company documents. Get instant answers with accurate citations and source references.
              </p>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mt-4">
              {SUGGESTIONS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.title}
                    onClick={() => handleSend(item.title)}
                    className="group flex flex-col items-start gap-2 p-4 rounded-xl text-left bg-dark-800/40 border border-dark-600/40
                               hover:border-brand-500/50 hover:bg-dark-800/80 transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-brand-400 group-hover:text-brand-300" />
                      <span className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {item.title.split('?')[0].slice(0, 25)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </button>
                )
              })}
            </div>

            {/* Features */}
            <div className="flex gap-6 mt-4 text-xs text-slate-500 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Accurate answers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Source citations
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                AI-powered search
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 py-6">
                <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={16} className="text-brand-400" />
                </div>
                <div className="flex-1 bg-dark-800/40 border border-dark-600/30 rounded-xl p-4">
                  <LoadingDots text="AI is thinking..." />
                </div>
              </div>
            )}
            
            <div ref={bottomRef} className="h-2" />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
