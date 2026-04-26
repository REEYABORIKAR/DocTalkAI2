import React from 'react'
import { FileText, ExternalLink } from 'lucide-react'
import { Source } from '../../utils/streaming'
import { useChatStore } from '../../store/chatStore'

interface Props {
  sources: Source[]
}

export default function CitationChip({ sources }: Props) {
  const { openPdf } = useChatStore()

  if (!sources || sources.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dark-600/40">
      {sources.map((src, i) => (
        <button
          key={i}
          onClick={() => openPdf(src.file, src.page)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-700/70 border border-dark-600/60
                     hover:border-brand-500/60 hover:bg-dark-600/70 transition-all duration-150 group"
          title={src.text}
        >
          <FileText size={11} className="text-brand-400 shrink-0" />
          <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">
            [{i + 1}] {src.file}
          </span>
          <span className="text-[10px] text-slate-500 bg-dark-600 px-1.5 py-0.5 rounded-md font-mono">
            p.{src.page}
          </span>
          <ExternalLink size={9} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </button>
      ))}
    </div>
  )
}
