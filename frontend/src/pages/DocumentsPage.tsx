import React, { useEffect, useRef, useState } from 'react'
import { Upload, FileText, Shield, Tag, Clock, Loader, Search, Filter, Download, MoreVertical, Trash2 } from 'lucide-react'
import { useDocStore } from '../store/docStore'
import { useToast } from '../hooks/useToast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'

const SECURITY_COLORS: Record<string, { label: string; color: string }> = {
  Public: { label: '🌐 Public', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  Internal: { label: '🔒 Internal', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  Confidential: { label: '⚠️ Confidential', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  Restricted: { label: '🔐 Restricted', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

export default function DocumentsPage() {
  const { documents, isUploading, isLoading, fetchDocuments, uploadDocument } = useDocStore()
  const { success, error: showError } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => { fetchDocuments() }, [])

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.policy_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      showError('Invalid file', 'Only PDF files are supported')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      showError('File too large', 'Maximum file size is 50MB')
      return
    }
    await uploadDocument(file)
    success('Document uploaded', 'Processing PDF for indexing...')
    e.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      fileRef.current = { files } as any
      const file = files[0]
      handleFileChange({ target: { files } } as any)
    }
  }

  const totalPages = documents.reduce((sum, doc) => sum + (doc.total_pages || 0), 0)
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunks_indexed || 0), 0)

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Page Header */}
      <div className="px-6 py-6 border-b border-dark-600/50 shrink-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Documents</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and organize your company policies and documentation</p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-brand-600/20 active:scale-95"
          >
            {isUploading
              ? <><Loader size={16} className="animate-spin" /> Processing…</>
              : <><Upload size={16} /> Upload Document</>
            }
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-dark-800/40 border border-dark-600/40 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-white mt-1">{documents.length}</p>
          </div>
          <div className="bg-dark-800/40 border border-dark-600/40 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Pages</p>
            <p className="text-2xl font-bold text-white mt-1">{totalPages}</p>
          </div>
          <div className="bg-dark-800/40 border border-dark-600/40 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Indexed Chunks</p>
            <p className="text-2xl font-bold text-white mt-1">{totalChunks}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-dark-800/60 border border-dark-600/40 rounded-lg px-3.5 py-2.5 focus-within:border-brand-500/50 transition-colors">
            <Search size={16} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search documents by name or type…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-dark-800/60 border border-dark-600/40 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-dark-700/60 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" text="Loading documents..." />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="w-20 h-20 rounded-2xl bg-dark-800/60 border border-dark-600/40 flex items-center justify-center">
              <FileText size={40} className="text-slate-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">No documents yet</h2>
              <p className="text-slate-400 mb-6 max-w-sm">
                Upload PDF documents to start building your knowledge base. Documents will be automatically indexed for intelligent search.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-all"
              >
                Upload your first document
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`w-full max-w-md border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-600/50 hover:border-dark-600'
              }`}
            >
              <Upload size={24} className="mx-auto mb-2 text-slate-500" />
              <p className="text-sm text-slate-400">Or drag and drop PDF files here</p>
            </div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <Search size={32} className="text-slate-600" />
            <p className="text-slate-400">No documents matching your search</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Name</span>
              <span>Type</span>
              <span>Security Level</span>
              <span>Uploaded</span>
              <span></span>
            </div>

            {/* Document Rows */}
            {filteredDocs.map((doc, i) => {
              const securityInfo = SECURITY_COLORS[doc.security_level] || { label: doc.security_level, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' }
              return (
                <div
                  key={i}
                  className="group grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-4 py-3.5 rounded-lg bg-dark-800/40 border border-dark-600/40 hover:border-dark-600/80 hover:bg-dark-800/60 transition-all items-center"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate" title={doc.filename}>{doc.filename}</p>
                      <p className="text-xs text-slate-500">{doc.chunks_indexed} chunks • {doc.total_pages} pages</p>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-dark-700/40 px-2 py-1.5 rounded">
                      <Tag size={12} />
                      {doc.policy_type}
                    </span>
                  </div>

                  {/* Security Level */}
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border inline-block ${securityInfo.color}`}>
                      {securityInfo.label}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{formatDistanceToNow(new Date(doc.uploaded_at || new Date()), { addSuffix: true })}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      title="Download"
                      className="p-2 rounded-lg hover:bg-dark-600/50 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
