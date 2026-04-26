import React from 'react'
import { Cpu, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface Props {
  steps: string[]
  isStreaming: boolean
}

function StepIcon({ step }: { step: string }) {
  if (step.startsWith('✅')) return <CheckCircle size={12} className="text-emerald-400 shrink-0 mt-0.5" />
  if (step.startsWith('⚠️')) return <AlertCircle size={12} className="text-amber-400 shrink-0 mt-0.5" />
  if (step.startsWith('🧭')) return <Cpu size={12} className="text-brand-400 shrink-0 mt-0.5" />
  if (step.startsWith('🔍')) return <Cpu size={12} className="text-purple-400 shrink-0 mt-0.5" />
  return <Cpu size={12} className="text-slate-400 shrink-0 mt-0.5" />
}

function cleanStep(step: string): string {
  return step.replace(/^[🧭🔍✅⚠️🚀]\s*/, '')
}

export default function ThinkingTrace({ steps, isStreaming }: Props) {
  if (steps.length === 0 && !isStreaming) return null

  return (
    <div className="mb-3 space-y-1.5">
      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
        <Cpu size={10} />
        Agent Trace
      </div>
      {steps.map((step, i) => (
        <div key={i} className="trace-item animate-fade-in">
          <StepIcon step={step} />
          <span
            className="text-slate-300 leading-snug"
            dangerouslySetInnerHTML={{
              __html: cleanStep(step).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
            }}
          />
        </div>
      ))}
      {isStreaming && steps.length > 0 && (
        <div className="trace-item">
          <Loader size={12} className="text-brand-400 shrink-0 animate-spin mt-0.5" />
          <span className="text-slate-400 text-xs">Generating answer…</span>
        </div>
      )}
    </div>
  )
}
