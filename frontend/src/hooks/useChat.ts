import { useState, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { streamChat } from '../utils/streaming'

export function useChat() {
  const {
    chats, activeChatId, mode,
    newChat, addMessage, appendToMessage, updateMessage,
  } = useChatStore()
  const { token } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const activeChat = chats.find(c => c.id === activeChatId)
  const messages = activeChat?.messages || []

  const sendMessage = useCallback(async (query: string) => {
    if (!token || isLoading) return

    let chatId = activeChatId
    if (!chatId) {
      chatId = newChat()
    }

    addMessage(chatId, { role: 'user', content: query })

    const assistantMsgId = addMessage(chatId, {
      role: 'assistant',
      content: '',
      steps: [],
      sources: [],
      isStreaming: true,
    })

    setIsLoading(true)
    const steps: string[] = []

    try {
      await streamChat(query, mode, token, {
        onStep: (step) => {
          steps.push(step)
          updateMessage(chatId!, assistantMsgId, { steps: [...steps] })
        },
        onAnswerChunk: (chunk) => {
          appendToMessage(chatId!, assistantMsgId, chunk)
        },
        onSources: (sources) => {
          updateMessage(chatId!, assistantMsgId, { sources })
        },
        onMeta: (meta) => {
          updateMessage(chatId!, assistantMsgId, {
            domain: meta.domain,
            verified: meta.verified,
          })
        },
        onDone: () => {
          updateMessage(chatId!, assistantMsgId, { isStreaming: false })
          setIsLoading(false)
        },
        onError: (err) => {
          updateMessage(chatId!, assistantMsgId, {
            content: `⚠️ Error: ${err}`,
            isStreaming: false,
          })
          setIsLoading(false)
        },
      })
    } catch (e: any) {
      updateMessage(chatId!, assistantMsgId, {
        content: `⚠️ Connection error: ${e?.message || 'Unknown error'}`,
        isStreaming: false,
      })
      setIsLoading(false)
    }
  }, [token, isLoading, activeChatId, mode, newChat, addMessage, appendToMessage, updateMessage])

  return { messages, isLoading, sendMessage }
}
