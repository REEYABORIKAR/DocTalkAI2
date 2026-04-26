import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useToast } from './hooks/useToast'
import Sidebar from './components/layout/Sidebar'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import SourcesPage from './pages/SourcesPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'

function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-dark-900">
        {children}
      </main>
    </div>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
}

function AppRoutes() {
  const { toasts, remove } = useToast()

  return (
    <>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/"          element={<Layout><ChatPage /></Layout>} />
            <Route path="/chats"     element={<Layout><ChatPage /></Layout>} />
            <Route path="/home"      element={<Layout><PageWrapper><HomePage /></PageWrapper></Layout>} />
            <Route path="/documents" element={<Layout><PageWrapper><DocumentsPage /></PageWrapper></Layout>} />
            <Route path="/sources"   element={<Layout><PageWrapper><SourcesPage /></PageWrapper></Layout>} />
            <Route path="/settings"  element={<Layout><PageWrapper><SettingsPage /></PageWrapper></Layout>} />
            <Route path="/profile"   element={<Layout><PageWrapper><ProfilePage /></PageWrapper></Layout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <ToastContainer toasts={toasts.map(t => ({ ...t, onClose: remove }))} onClose={remove} />
    </>
  )
}

export default AppRoutes
