import { create } from 'zustand'
import { Source } from '../utils/streaming'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  steps?: string[]
  sources?: Source[]
  domain?: string
  verified?: boolean
  isStreaming?: boolean
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface ChatState {
  chats: Chat[]
  activeChatId: string | null
  mode: 'personal' | 'company' | 'hybrid'
  activePdfFile: string | null
  activePdfPage: number
  setMode: (mode: 'personal' | 'company' | 'hybrid') => void
  newChat: () => string
  setActiveChat: (id: string) => void
  addMessage: (chatId: string, msg: Omit<Message, 'id' | 'timestamp'>) => string
  appendToMessage: (chatId: string, msgId: string, chunk: string) => void
  updateMessage: (chatId: string, msgId: string, updates: Partial<Message>) => void
  openPdf: (file: string, page?: number) => void
  closePdf: () => void
  setPdfPage: (page: number) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  mode: 'company',
  activePdfFile: null,
  activePdfPage: 1,

  setMode: (mode) => set({ mode }),

  newChat: () => {
    const id = makeId()
    const chat: Chat = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    }
    set((s) => ({ chats: [chat, ...s.chats], activeChatId: id }))
    return id
  },

  setActiveChat: (id) => set({ activeChatId: id }),

  addMessage: (chatId, msg) => {
    const id = makeId()
    const message: Message = { ...msg, id, timestamp: new Date() }
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c
        const messages = [...c.messages, message]
        // Auto-title from first user message
        const title = c.messages.length === 0 && msg.role === 'user'
          ? msg.content.slice(0, 40) + (msg.content.length > 40 ? '…' : '')
          : c.title
        return { ...c, messages, title }
      }),
    }))
    return id
  },

  appendToMessage: (chatId, msgId, chunk) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id !== chatId ? c : {
          ...c,
          messages: c.messages.map((m) =>
            m.id !== msgId ? m : { ...m, content: m.content + chunk }
          ),
        }
      ),
    }))
  },

  updateMessage: (chatId, msgId, updates) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id !== chatId ? c : {
          ...c,
          messages: c.messages.map((m) =>
            m.id !== msgId ? m : { ...m, ...updates }
          ),
        }
      ),
    }))
  },

  openPdf: (file, page = 1) => set({ activePdfFile: file, activePdfPage: page }),
  closePdf: () => set({ activePdfFile: null }),
  setPdfPage: (page) => set({ activePdfPage: page }),
}))
