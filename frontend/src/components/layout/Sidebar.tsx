import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare, FolderOpen, Database, Settings,
  Home, Plus, LogOut, Search, MoreVertical, Trash2
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const NAV = [
  { icon: Home,          label: 'Home',      path: '/home' },
  { icon: MessageSquare, label: 'Chats',     path: '/' },
  { icon: FolderOpen,    label: 'Documents', path: '/documents' },
  { icon: Database,      label: 'Sources',   path: '/sources' },
  { icon: Settings,      label: 'Settings',  path: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { chats, activeChatId, newChat, setActiveChat } = useChatStore()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  const handleNewChat = () => {
    newChat()
    navigate('/')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const todayChats = chats.filter(c =>
    new Date(c.createdAt).toDateString() === new Date().toDateString() &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const olderChats = chats.filter(c =>
    new Date(c.createdAt).toDateString() !== new Date().toDateString() &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8)

  const hasChats = chats.length > 0

  return (
    <aside className="flex flex-col w-[260px] shrink-0 bg-dark-800 border-r border-dark-600/50 h-screen overflow-hidden">
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-dark-600/50 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-brand-600/20">
          D
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base text-white tracking-tight">DockTalk</h1>
          <p className="text-[10px] text-slate-500">Enterprise</p>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3 shrink-0">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:shadow-lg hover:shadow-brand-600/30 transition-all duration-200 active:scale-95"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1 shrink-0">
        {NAV.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(path)
                ? 'bg-brand-600/15 text-brand-400 border border-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Chat History */}
      {hasChats && (
        <div className="flex-1 flex flex-col min-h-0 mt-4 border-t border-dark-600/30 pt-3">
          {/* Search */}
          <div className="px-2 pb-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/40 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-brand-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 px-2">
            {todayChats.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Today</p>
                <div className="space-y-1">
                  {todayChats.map(chat => (
                    <div
                      key={chat.id}
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                      className="group relative"
                    >
                      <button
                        onClick={() => {
                          setActiveChat(chat.id)
                          navigate('/')
                        }}
                        className={clsx(
                          'w-full text-left px-2.5 py-2 rounded-lg text-xs truncate transition-all duration-200 flex items-center gap-2',
                          chat.id === activeChatId
                            ? 'bg-brand-600/20 text-brand-300 border border-brand-600/40'
                            : 'text-slate-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
                        )}
                      >
                        <MessageSquare size={12} className="shrink-0 opacity-60 mt-0.5" />
                        <span className="truncate">{chat.title}</span>
                      </button>
                      {hoveredChat === chat.id && (
                        <button
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {olderChats.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Earlier</p>
                <div className="space-y-1">
                  {olderChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat.id)
                        navigate('/')
                      }}
                      className={clsx(
                        'w-full text-left px-2.5 py-2 rounded-lg text-xs truncate transition-all duration-200 flex items-center gap-2',
                        chat.id === activeChatId
                          ? 'bg-brand-600/20 text-brand-300 border border-brand-600/40'
                          : 'text-slate-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
                      )}
                    >
                      <MessageSquare size={12} className="shrink-0 opacity-60 mt-0.5" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && todayChats.length === 0 && olderChats.length === 0 && (
              <div className="text-center py-8">
                <Search size={20} className="mx-auto text-slate-600 mb-2 opacity-50" />
                <p className="text-xs text-slate-500">No chats found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Section */}
      {user && (
        <div className="border-t border-dark-600/50 p-3 shrink-0">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-dark-700/50 cursor-pointer group transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role || 'Member'}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLogout()
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
