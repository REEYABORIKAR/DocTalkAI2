import React from 'react'
import { Database, ExternalLink } from 'lucide-react'
import { useChatStore } from '../store/chatStore'

export default function SourcesPage() {
  const { chats, openPdf } = useChatStore()

  // Collect all unique sources across all chats
  const allSources: Array<{ file: string; page: number; text: string; domain: string }> = []
  const seen = new Set<string>()

  for (const chat of chats) {
    for (const msg of chat.messages) {
      for (const src of msg.sources || []) {
        const key = `${src.file}:${src.page}`
        if (!seen.has(key)) {
          seen.add(key)
          allSources.push(src)
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-dark-600/50 shrink-0">
        <h2 className="text-lg font-semibold text-white">Sources & Citations</h2>
        <p className="text-xs text-slate-500 mt-0.5">{allSources.length} unique sources cited across all chats</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {allSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-600/50 flex items-center justify-center">
              <Database size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No citations yet</p>
            <p className="text-xs text-slate-600">Start a chat to see sources cited by the AI</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allSources.map((src, i) => (
              <div key={i}
                className="p-4 rounded-xl bg-dark-800 border border-dark-600/40 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-brand-400 font-mono">{i + 1}</span>
                      <p className="text-sm font-medium text-white truncate">{src.file}</p>
                      <span className="text-[10px] text-slate-500 bg-dark-700 px-2 py-0.5 rounded-full font-mono shrink-0">
                        Page {src.page}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{src.text}</p>
                    <span className="inline-block mt-2 text-[10px] text-slate-600 font-mono bg-dark-700 px-2 py-0.5 rounded">
                      {src.domain}
                    </span>
                  </div>
                  <button
                    onClick={() => openPdf(src.file, src.page)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-dark-600
                               text-slate-500 hover:text-brand-400 transition-colors"
                    title="Open in PDF viewer"
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
