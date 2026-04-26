import { useEffect } from 'react'
import { useDocStore } from '../store/docStore'

export function useDocuments() {
  const { documents, isUploading, fetchDocuments, uploadDocument } = useDocStore()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUpload = async (file: File) => {
    await uploadDocument(file)
  }

  return { documents, isUploading, handleUpload, refresh: fetchDocuments }
}
