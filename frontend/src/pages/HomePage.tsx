import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Upload, BookOpen, Database,
  Shield, Users, Zap, ArrowRight, FileText
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useDocStore } from '../store/docStore'
import { useChatStore } from '../store/chatStore'
import { useEffect } from 'react'

const FEATURES = [
  { icon: Sparkles,  color: 'from-brand-500 to-blue-600',    title: 'AI-Powered Assistant',    desc: 'Get instant answers from your documents with GPT-4o mini.' },
  { icon: Upload,    color: 'from-purple-500 to-pink-600',   title: 'Document Upload',         desc: 'Upload PDFs and they are auto-indexed into the right domain.' },
  { icon: BookOpen,  color: 'from-emerald-500 to-teal-600',  title: 'Source Citations',        desc: 'View exact sources, page numbers, and highlighted snippets.' },
  { icon: Users,     color: 'from-orange-500 to-red-500',    title: 'Multi-Mode Chat',         desc: 'Switch between Personal, Company, and Hybrid modes.' },
  { icon: Shield,    color: 'from-slate-500 to-slate-700',   title: 'Secure & Private',        desc: 'Enterprise-grade RBAC — agents only see what you can see.' },
  { icon: Zap,       color: 'from-yellow-500 to-orange-500', title: 'Multi-Agent System',      desc: 'LangGraph orchestration: Router → Domain Agent → Verifier.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { documents, fetchDocuments } = useDocStore()
  const { chats } = useChatStore()

  useEffect(() => { fetchDocuments() }, [])

  const stats = [
    { label: 'Documents Indexed', value: documents.length, icon: FileText },
    { label: 'Total Chats',       value: chats.length,     icon: Sparkles },
    { label: 'Domains Active',    value: new Set(documents.map(d => d.domain)).size || 0, icon: Database },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Hero */}
      <div className="px-8 py-10 border-b border-dark-600/40">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
            Multi-Agent Enterprise Platform
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'there'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Ask anything about your company documents. The AI routes your question to the right domain agent and cites exact sources with page numbers.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700
                         text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Sparkles size={15} />
              Start Chat
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="flex items-center gap-2 px-5 py-2.5 border border-dark-500 hover:border-dark-400
                         text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Upload size={15} />
              Upload Documents
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 border-b border-dark-600/40">
        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-4 bg-dark-800 border border-dark-600/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-brand-400" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="px-8 py-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">Powerful Features</h2>
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title}
              className="p-4 bg-dark-800 border border-dark-600/40 rounded-xl hover:border-dark-500 transition-colors group">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
