import React, { useState, useEffect } from 'react'
import { X, Download, Maximize2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'

// We use a simple iframe-based PDF viewer to avoid complex pdfjs setup issues.
// For production, swap this with @react-pdf-viewer/core.

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

export default function PDFViewer() {
  const { activePdfFile, activePdfPage, closePdf, setPdfPage } = useChatStore()
  const [zoom, setZoom] = useState(100)

  if (!activePdfFile) return null

  const fileUrl = `${BASE_URL}/files/${encodeURIComponent(activePdfFile)}`
  const downloadUrl = fileUrl

  return (
    <div className="flex flex-col h-full bg-dark-800 border-l border-dark-600/50 w-[420px] shrink-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600/50 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{activePdfFile}</p>
          <p className="text-[10px] text-slate-500">Page {activePdfPage}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <a
            href={downloadUrl}
            download={activePdfFile}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
            title="Download"
          >
            <Download size={13} />
          </a>
          <button
            onClick={closePdf}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-600/30 bg-dark-750/50 shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPdfPage(Math.max(1, activePdfPage - 1))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-slate-400 font-mono min-w-[60px] text-center">
            {activePdfPage}
          </span>
          <button
            onClick={() => setPdfPage(activePdfPage + 1)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut size={11} />
          </button>
          <span className="text-[10px] text-slate-500 font-mono w-9 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 10))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn size={11} />
          </button>
        </div>
      </div>

      {/* PDF Iframe Viewer */}
      <div className="flex-1 overflow-hidden bg-dark-900/50">
        <iframe
          src={`${fileUrl}#page=${activePdfPage}&zoom=${zoom}`}
          className="w-full h-full border-none"
          title={activePdfFile}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
        />
      </div>

      {/* Page indicator strip */}
      <div className="px-4 py-2 border-t border-dark-600/30 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
          <span className="text-brand-400">{activePdfPage}</span>
          <span>/</span>
          <span>—</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}
