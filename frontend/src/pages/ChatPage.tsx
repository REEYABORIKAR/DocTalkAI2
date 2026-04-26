import React from 'react'
import Header from '../components/layout/Header'
import ChatPanel from '../components/chat/ChatPanel'
import PDFViewer from '../components/pdf/PDFViewer'
import { useChatStore } from '../store/chatStore'

export default function ChatPage() {
  const { activePdfFile } = useChatStore()

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ChatPanel />
        </div>

        {/* PDF Viewer - slides in when a citation is clicked */}
        {activePdfFile && <PDFViewer />}
      </div>
    </div>
  )
}
