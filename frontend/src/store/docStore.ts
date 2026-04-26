import { create } from 'zustand'
import api from '../utils/api'

export interface Document {
  filename: string
  domain: string
  department: string
  policy_type: string
  security_level: string
  total_pages: number
  chunks_indexed: number
  uploaded_by: string
}

interface DocState {
  documents: Document[]
  isUploading: boolean
  fetchDocuments: () => Promise<void>
  uploadDocument: (file: File) => Promise<void>
}

export const useDocStore = create<DocState>((set) => ({
  documents: [],
  isUploading: false,

  fetchDocuments: async () => {
    try {
      const res = await api.get('/documents/')
      set({ documents: res.data.documents || [] })
    } catch {
      set({ documents: [] })
    }
  },

  uploadDocument: async (file: File) => {
    set({ isUploading: true })
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post('/documents/upload', form)
      // Refresh list
      const res = await api.get('/documents/')
      set({ documents: res.data.documents || [] })
    } finally {
      set({ isUploading: false })
    }
  },
}))
