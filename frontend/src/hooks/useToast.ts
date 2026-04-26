import { useState, useCallback } from 'react'
import { ToastType } from '../components/ui/Toast'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).slice(2, 10)
    const toast: Toast = { id, type, title, message, duration }
    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    return show('success', title, message, 4000)
  }, [show])

  const error = useCallback((title: string, message?: string) => {
    return show('error', title, message, 5000)
  }, [show])

  const info = useCallback((title: string, message?: string) => {
    return show('info', title, message, 4000)
  }, [show])

  const warning = useCallback((title: string, message?: string) => {
    return show('warning', title, message, 4000)
  }, [show])

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info,
    warning,
  }
}
