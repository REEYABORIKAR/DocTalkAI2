import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CheckCircle, ShieldAlert } from 'lucide-react'
import { Message } from '../../store/chatStore'
import ThinkingTrace from './ThinkingTrace'
import CitationChip from './CitationChip'
import clsx from 'clsx'

interface Props {
  message: Message
}

const DockTalkLogo = () => (
  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
    D
  </div>
)

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-slide-up">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-5 animate-slide-up">
      <DockTalkLogo />
      <div className="flex-1 min-w-0">
        {/* Agent thinking trace */}
        {(message.steps && message.steps.length > 0) && (
          <ThinkingTrace steps={message.steps} isStreaming={!!message.isStreaming && message.content.length === 0} />
        )}

        {/* Answer content */}
        {message.content ? (
          <div className={clsx('prose-dark text-sm', { 'cursor-blink': message.isStreaming })}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : message.isStreaming ? (
          <div className="flex gap-1 items-center h-6">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        ) : null}

        {/* Sources */}
        {!message.isStreaming && message.sources && message.sources.length > 0 && (
          <CitationChip sources={message.sources} />
        )}

        {/* Verified badge */}
        {!message.isStreaming && message.content && (
          <div className="mt-2 flex items-center gap-2">
            {message.verified ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle size={10} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                <ShieldAlert size={10} /> Unverified
              </span>
            )}
            {message.domain && (
              <span className="text-[10px] text-slate-600 font-mono uppercase bg-dark-700 px-1.5 py-0.5 rounded">
                {message.domain}
              </span>
            )}
            <span className="text-[10px] text-slate-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
